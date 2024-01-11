---
title: etcd 队列引发的问题一则
tags: [go,etcd]
---


etcd 是分布式系统中的一个重要基础中间件，为 K8s 等关键基础设施提供了底层的 KV 储存能力。摘自 Github 描述：

> Distributed reliable key-value store for the most critical data of a distributed system.

由于业务需要，我项目中使用了 etcd 官方客户端 clientv3 及其源码仓库中提供的队列实现（当时的版本为 3.5.11），并意外地发现了一系列问题，故事从这里开始。

<!-- more -->



## 问题背景



## 复现方式

首先，通过 docker 快速部署一个带有授权认证的 etcd 服务器：

```
docker run -e ETCD_ROOT_PASSWORD=root -e ETCD_AUTH_TOKEN_TTL=5 -p 2379:2379 --name etcd bitnami/etcd:3.5.5
```

在这个服务器中，我们：

1. 为 root 用户启用了密码，密码为 root。
2. 设置了 token 的 ttl (time to live，即过期时间) 为 5 秒钟。

然后，编写客户端代码：

```go
package main

import (
	"fmt"
	clientv3 "go.etcd.io/etcd/client/v3"
	recipe "go.etcd.io/etcd/client/v3/experimental/recipes"
	"time"
)

func main() {
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{"http://127.0.0.1:2379"},
		Username:    "root",
		Password:    "root",
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		panic(err)
	}
	queue := recipe.NewQueue(cli, "/test")

	go start(queue, 1)

	time.Sleep(6 * time.Second)
	go start(queue, 2)

	time.Sleep(10 * time.Second)
}

func start(q *recipe.Queue, idx int) {
	for {
		fmt.Printf("#%d start...\n", idx)
		item, err := q.Dequeue()
		fmt.Printf("dequeue: %v, err: %v\n", item, err)
	}
}
```

在程序运行一段时间后将崩溃，控制台输出：

```
#1 start...
#2 start...
{"level":"warn","ts":"2024-01-10T10:17:39.062521+0800","logger":"etcd-client","caller":"v3@v3.5.11/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"etcd-endpoints://0xc0001f5500/127.0.0.1:2379","attempt":0,"error":"rpc error: code = Unauthenticated desc = etcdserver: invalid auth token"}
panic: runtime error: invalid memory address or nil pointer dereference
[signal 0xc0000005 code=0x0 addr=0x8 pc=0x1088656]

goroutine 37 [running]:
go.etcd.io/etcd/client/v3/experimental/recipes.(*Queue).Dequeue(0xc000380780)
        C:/Users/G40NTC3/go/pkg/mod/go.etcd.io/etcd/client/v3@v3.5.11/experimental/recipes/queue.go:70 +0x136
main.start(0x0?, 0x0?)
        E:/githome/backend/code-interpreter/sbscheduler/test/watchproblem/main.go:33 +0xcf
created by main.main
        E:/githome/backend/code-interpreter/sbscheduler/test/watchproblem/main.go:25 +0x245

Process finished with the exit code 2
```

可以看到 2 号和 3 号 watch 出错并且退出了 （Canceled）。出错的原因是 `permission denied`，即授权认证未通过。

## 错误定位

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

它的实现非常简单，接口也很干净，支持分布式的多读多写，并且它的 Dequeue 方法正是利用了 Watch 功能实现的，因此重点关注一下 Dequeue 方法，我在代码中补充了一些自己的注释：

```go
// Dequeue returns Enqueue()'d elements in FIFO order. If the
// queue is empty, Dequeue blocks until elements are available.
func (q *Queue) Dequeue() (string, error) {
	// 先从队列中获取一个元素，从最新的修订号开始获取（FIFO）
	resp, err := q.client.Get(q.ctx, q.keyPrefix, v3.WithFirstRev()...)
	if err != nil {
		return "", err
	}

	// 获取到的每一个元素，尝试 "claim" 它，实际上就是尝试删除并返回
	kv, err := claimFirstKey(q.client, resp.Kvs)
	if err != nil {
		return "", err
	} else if kv != nil {
		// 拿到了返回，代表删除成功了，这时候出队成功
		return string(kv.Value), nil
	} else if resp.More {
		// 递归调用自己，继续获取剩余内容
		return q.Dequeue()
	}

	// 现有数据中没找到任何成功出队的元素，开始等待新元素入队
	// 这里用的是 Watch!
	ev, err := WaitPrefixEvents(
		q.client,
		q.keyPrefix,
		resp.Header.Revision,
		[]mvccpb.Event_EventType{mvccpb.PUT})
	if err != nil {
		return "", err
	}
	// 尝试删除该元素
	ok, err := deleteRevKey(q.client, string(ev.Kv.Key), ev.Kv.ModRevision)
	if err != nil {
		return "", err
	} else if !ok {
		// 删除失败了，继续 Dequeue
		return q.Dequeue()
	}
	// 删除成功了，返回元素的值
	return string(ev.Kv.Value), err
}
```

这段代码里面涉及到很多 etcd3 的知识点，出现最多的是“修订号”（Rev）的概念。因为跟本文没有太大关系，这里只简单提一下：etcd 底层使用了一个 MVCC 数据库，它会保存数据的所有历史记录，就像 git 一样，可以通过 rev 来找到一条数据记录在任意时间点的状态。

这个 Dequeue 方法概括来说就是：它首先尝试在现有元素中出队（删除成功等于出队成功，因为要照顾多客户端读，只有成功删除的那个客户端视作成功出队），如果没有能出队的，则启动一个 Watch 等待新元素，并尝试出队。成功则返回，不成功则如此往复。

这段代码写得很好，很精妙，也很有意思，但它问题出在哪呢？还要继续看一下 `WaitPrefixEvents` 的实现：

```go
func WaitPrefixEvents(c *clientv3.Client, prefix string, rev int64, evs []mvccpb.Event_EventType) (*clientv3.Event, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	wc := c.Watch(ctx, prefix, clientv3.WithPrefix(), clientv3.WithRev(rev))
	if wc == nil {
		return nil, ErrNoWatcher
	}
	return waitEvents(wc, evs), nil
}

func waitEvents(wc clientv3.WatchChan, evs []mvccpb.Event_EventType) *clientv3.Event {
	i := 0
	for wresp := range wc {
		// wresp.Canceled ???
		for _, ev := range wresp.Events {
			if ev.Type == evs[i] {
				i++
				if i == len(evs) {
					return ev
				}
			}
		}
	}
	return nil
}
```

可以看到在 `waitEvents` 的循环中，它实际上是漏掉了 `wresp.Canceled` 的判断，没有判断 watch 因为某种原因失败的情况（实际上它可能并不经常失败，除了上面提到的 token 问题）。在 watch 失败的情况下，它会返回一个值为 `nil` 的 `ev`，并且 `err` 也是 `nil`。好巧不巧的是，在 Dequeue 方法中，只判断了 `err != nil`，没有判断 `ev != nil`，因此程序只要触发了某个 watch 的错误，就会因为这行代码：

```go
ok, err := deleteRevKey(q.client, string(ev.Kv.Key), ev.Kv.ModRevision)
```

导致 panic。