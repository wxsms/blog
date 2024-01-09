---
title: etcd 队列引发的问题一则
tags: [go,etcd]
---


etcd 是分布式系统中的一个重要基础中间件，为 K8s 等关键基础设施提供了底层的 KV 储存能力。摘自 Github 描述：

> Distributed reliable key-value store for the most critical data of a distributed system.

由于业务需要，我项目中使用了 etcd 官方客户端 clientv3 及其源码仓库中提供的队列实现（当时的版本为 3.5.11），并意外地发现了一系列问题，故事就从这里开始。

<!-- more -->

## 问题复现

先来一个简单的复现，帮助大家快速理解。

首先，我们需要创建一个带有授权认证的 etcd 服务器，可以通过 docker 快速部署一个：

```
docker run -e ETCD_ROOT_PASSWORD=root -e ETCD_AUTH_TOKEN_TTL=5 -p 2379:2379 --name etcd bitnami/etcd:3.5.5
```

在这个服务器中，我们：

1. 为 root 用户启用了密码，密码为 root。
2. 设置了 token 的 ttl (time to live，即过期时间) 为 5 秒钟（后面再解释这个的具体含义）。

服务准备好了，现在写一个客户端代码：

```go
package main

import (
	"context"
	"fmt"
	clientv3 "go.etcd.io/etcd/client/v3"
	"sync"
	"time"
)

var wg sync.WaitGroup

func main() {
	cfg := clientv3.Config{
		Endpoints: []string{"http://127.0.0.1:2379"},
		Username:  "root",
		Password:  "root",
	}

	cli, err := clientv3.New(cfg)
	if err != nil {
		panic(err)
	}

	watch(cli, 1)

	time.Sleep(6 * time.Second)
	watch(cli, 2)
	
	time.Sleep(1 * time.Second)
	watch(cli, 3)

	wg.Wait()
}

func watch(cli *clientv3.Client, num int) {
	wg.Add(1)

	go func() {
		defer wg.Done()
		for wr := range cli.Watch(context.Background(), "") {
			if wr.Canceled {
				fmt.Printf("%#v\n", wr.Err())
			}
		}

		fmt.Printf("#%v watch existed\n", num)
	}()
}
```

在程序运行一段时间后，可以看到控制台上输出：

```
&errors.errorString{s:"rpc error: code = PermissionDenied desc = etcdserver: permission denied"}
#2 watch existed
&errors.errorString{s:"rpc error: code = PermissionDenied desc = etcdserver: permission denied"}
#3 watch existed
```

可以看到 2 号和 3 号 watch 出错并且退出了 （Canceled）。出错的原因是 `permission denied`。这个很明显是授权相关的问题，但是理论上来说 client 应该自动帮我们处理此类问题。因此出现这个问题，即使从 clientv3 的内部来看也是不符合预期的。

## 这跟队列有什么关系？

etcd 在 clientv3 内实现了一个队列工具：

```go
// go doc go.etcd.io/etcd/client/v3/experimental/recipes.Queue
package recipe // import "go.etcd.io/etcd/client/v3/experimental/recipes"

type Queue struct {
        // Has unexported fields.
}
    Queue implements a multi-reader, multi-writer distributed queue.

func NewQueue(client *v3.Client, keyPrefix string) *Queue
func (q *Queue) Dequeue() (string, error)
func (q *Queue) Enqueue(val string) error
```

它的 Dequeue 方法正是利用了 Watch 功能实现的。