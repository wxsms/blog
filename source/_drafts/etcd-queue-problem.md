---
title: etcd 队列引发的问题一则
tags: [go,etcd]
---


etcd 是分布式系统中的一个重要基础中间件，为 K8s 等关键基础设施提供了底层的 KV 储存能力。摘自 Github 描述：

> Distributed reliable key-value store for the most critical data of a distributed system.

由于业务需要，我项目中使用了 etcd 官方客户端 clientv3 及其源码仓库中提供的队列实现（当时的版本为 3.5.11），并意外地发现了一系列问题，故事从这里开始。

<!-- more -->



## 问题背景

在项目的本地开发过程中，我通过 docker 部署了一个 etcd 服务器，开发过程非常顺畅，没有遇到任何问题。但是将服务部署上测试环境，连接上测试环境的 etcd 后，发现服务运行一段时间后就会报如下错误：

```
{"level":"warn","ts":"2024-01-10T11:49:21.911042+0800","logger":"etcd-client","caller":"v3@v3.5.11/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"etcd-endpoints://0xc0001ab500/127.0.0.1:2379","attempt":0,"error":"rpc error: code = Unauthenticated desc = etcdserver: invalid auth token"}
```

以及如下错误：

```
panic: runtime error: invalid memory address or nil pointer dereference
[signal 0xc0000005 code=0x0 addr=0x8 pc=0x1088656]

goroutine 37 [running]:
go.etcd.io/etcd/client/v3/experimental/recipes.(*Queue).Dequeue(0xc000380780)
        xxx/go/pkg/mod/go.etcd.io/etcd/client/v3@v3.5.11/experimental/recipes/queue.go:70 +0x136
```

由于协程内部没有做 recover，所以这个 panic 会导致 pod 崩溃重启，部分接口调用出错或超时。但由于在本地从来没有出现过该问题，所以初见崩溃时感觉有些诡异。

## 错误定位

### Dequeue

通过上述日志可以发现，panic 是从 clientv3 内部的代码发出的。因此我们直接来到 Dequeue 方法中查看：

```go
// Dequeue returns Enqueue()'d elements in FIFO order. If the
// queue is empty, Dequeue blocks until elements are available.
func (q *Queue) Dequeue() (string, error) {
	// ...
	ev, err := WaitPrefixEvents(
		q.client,
		q.keyPrefix,
		resp.Header.Revision,
		[]mvccpb.Event_EventType{mvccpb.PUT})
	if err != nil {
		return "", err
	}
	// L70
	ok, err := deleteRevKey(q.client, string(ev.Kv.Key), ev.Kv.ModRevision)
	if err != nil {
		return "", err
	} else if !ok {
		return q.Dequeue()
	}
	return string(ev.Kv.Value), err
}
```

可以看到，在产生报错的 L70 处，它尝试将获取到的一个队列元素删除。如果删除成功了，则认为出队成功。如果说这里有可能出现 nil pointer，那么应该只可能是 `ev.Kv`，也就是说 `WaitPrefixEvents` 同时返回了值为 `nil` 的 `ev` 和 `err`。

### WaitPrefixEvents

继续进入 WaitPrefixEvents 查看：

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

可以看到，它通过 etcd 的 Watch 功能来等待一个队列元素的 PUT 事件（在该场景下即添加）。那么它有可能同时返回值为 `nil` 的 `ev` 和 `err` 吗？很显然是有的：在 `waitEvents` 的最后一行，它返回了值为 nil 的 ev。也就是说，如果 `wc` 这个 channel 在被发送方 close 之前没有收到有效的 put event，那么这段代码就会返回 `nil`。




## 问题复现

在什么情况下 Watch channel 会被 close 呢？结合上面抛出的另一个错误来看：

```
{"level":"warn","ts":"2024-01-10T11:49:21.911042+0800","logger":"etcd-client","caller":"v3@v3.5.11/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"etcd-endpoints://0xc0001ab500/127.0.0.1:2379","attempt":0,"error":"rpc error: code = Unauthenticated desc = etcdserver: invalid auth token"}
```

合理推测：这应该与 etcd 的授权有关。这时候回看一下我本地开发环境与测试环境的区别：

1. 本地环境启动的 etcd 服务**没有密码**；
2. 测试环境的 etcd 服务使用了**帐号密码认证**。

是否说明如果我在本地部署一个带**帐号密码认证**的服务则可以稳定复现该问题呢？

首先，通过 docker 快速部署一个带有授权认证的 etcd 服务器：

```
docker run -e ETCD_ROOT_PASSWORD=root -e ETCD_AUTH_TOKEN_TTL=5 -p 2379:2379 --name etcd bitnami/etcd:3.5.5
```

在这个服务器中，我们：

1. 为 root 用户启用了密码，密码为 root。
2. 为了快速复现，设置了 token 的 ttl (time to live，即过期时间) 为 5 秒钟。

然后，编写一段简单的客户端代码：

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

可以看到 2 号协程出现了 panic，并且同时抛出了一个 `etcdserver: invalid auth token` 的 warning。与上述服务在测试环境出现的问题完全一致。

## 问题原因

很显然该问题的出现与两个因素有关：

1. etcd 的授权机制
2. Watch API

### etcd 的授权机制

在 etcdv3 中，client 与 server 的连接方式出现了较大变化：从 v2 的简单 http1 json 调用升级为了基于 http2 的 gRPC 调用。 etcdv3 支持 4 种授权机制：

1. 无授权
2. simple token
3. JWT (JSON Web Token)
4. TLS

其中：

1. 无授权，顾名思义，没有授权，不存在 token 过期等问题
2. simple token 和 JWT 都是基于用户名、密码下发 token 的策略，token 默认情况下 5 分钟会过期一次，过期需要向 server 重新授权获取
3. TLS 是基于证书的授权认证，性能显著优于 token 的同时，不需要下发 token

在本次问题过程中，测试环境的 etcd server 采用了用户名+密码的认证策略，因此存在 token 过期问题。但是一个巴掌拍不响：为什么 clientv3 的其它接口都没有因为 token 过期而出现异常，唯独 Watch 不行呢？


### Watch API

通过 `etch watch token` 关键词搜索，排名第一的结果已经直接找到答案：[#12385 watch stream return "permission denied" if token expired](https://github.com/etcd-io/etcd/issues/12385)：

简要过程描述：
1. 在 2020 年 10 月，有人提出了 etcd 的 watch stream 在 token 过期的时候会遇到 permission denied 的问题。这个问题是由于 clientv3 内部没有对 Watch 接口的 Token 过期错误进行处理和重试导致的。
2. 在 [#14322](https://github.com/etcd-io/etcd/pull/14322/files) 中，有人为这个问题添加了一个重试机制，发布为 v3.5.6
3. 在 v3.5.7 中，上述 PR 被 [#14995](https://github.com/etcd-io/etcd/pull/14995) 回滚了。理由是它在同时修改了 server 和 client 实现的前提下，改动方式过于脆弱（通过字符串比对的方式来比较错误类型）。
4. 在 [#15058](https://github.com/etcd-io/etcd/issues/15058) 中，团队成员决定为 WatchResponse 添加一个基于 Code 的 cancel reason，但是这个 issue 还处于 open 状态，按照计划它将于 v3.6.0 的 server+client 中提供。

在 [#14995](https://github.com/etcd-io/etcd/pull/14995) 中，回滚者提到：

> It's very easy for client application to workaround the issue.
> The client just needs to create a new client each time before watching.

所以，这个问题的答案是：
1. 没错，Watch API 目前确实不支持 token 过期的重试
2. 如果想要 work around，可以为每次 Watch 创建新的 client
3. 如果要彻底解决，需要等待 v3.6.0

## 问题解决

### 方式一：为每次 Watch 创建新的 client

这个做法真的是可行的吗？经过我的实践，答案是：不一定可行，取决于使用场景。

其主要原因是，在创建一个新的 client 的过程中，client 和 server 需要进行一定的连接建立、授权认证等初始化工作，这些工作的耗时非常惊人，可能会达到几百毫秒。这样一来，如果我需要为进入服务器的每一个请求启动一个 watch 进程，那么每一个请求都可能会被拖慢几百毫秒。同时由于用户名+密码授权的过程耗费大量的 etcd server 计算性能，在请求量较大时，etcd server 可能会被频繁的授权工作拖累，出现耗时增加甚至崩溃的情况。

### 方式二：修改队列源码，只在启动时 Watch

既然每次都创建新 client 不现实，那么很容易想到另一个办法：既然不能在服务运行的过程中动态 watch，那我在启动时只 watch 一次是不是就好了？答案是：确实可行。

队列代码修改如下，我们使用一个 channel 来作为 Dequeue 时的通信手段，在程序启动时，先通过 get 获取到所有的元素，一个一个消费完后，启动 Watch 来观测后续其它元素的入队：

```go
package etcd

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"go.etcd.io/etcd/api/v3/mvccpb"
	spb "go.etcd.io/etcd/api/v3/mvccpb"
	clientv3 "go.etcd.io/etcd/client/v3"
	"time"
)

var (
	ErrKeyExists = errors.New("key already exists")
)

type DequeueResult struct {
	result string
	err    error
}

type Queue struct {
	ctx      context.Context
	prefix   string
	cli      *clientv3.Client
	dequeueC chan DequeueResult
}

func NewQueue(cli *clientv3.Client, prefix string) *Queue {
	q := &Queue{
		ctx:      context.TODO(),
		prefix:   prefix,
		cli:      cli,
		dequeueC: make(chan DequeueResult, 1),
	}
	go func() {
		// 先清空队列
		for {
			resp, err := q.cli.Get(q.ctx, q.prefix, clientv3.WithFirstRev()...)
			if err != nil {
				q.dequeueC <- DequeueResult{result: "", err: err}
				continue
			}
			kv, err := q.claimFirstKey(resp.Kvs)
			if err != nil {
				q.dequeueC <- DequeueResult{result: "", err: err}
				continue
			}
			if kv != nil {
				q.dequeueC <- DequeueResult{result: string(kv.Value), err: nil}
				continue
			}
			if resp.More {
				continue
			}
			break
		}
		// 开始watch
		wc := q.cli.Watch(q.ctx, q.prefix, clientv3.WithPrefix())
		for wresp := range wc {
			if wresp.Canceled {
				log.WithField("error", wresp.Err()).Fatal("dequeue watcher exit")
			}
			for _, ev := range wresp.Events {
				switch ev.Type {
				case mvccpb.PUT:
					ok, err := q.deleteRevKey(string(ev.Kv.Key), ev.Kv.ModRevision)
					//log.Debugln("dequeue", ok, err)
					if err != nil {
						q.dequeueC <- DequeueResult{
							result: "",
							err:    err,
						}
					} else if ok {
						q.dequeueC <- DequeueResult{
							result: string(ev.Kv.Value),
							err:    nil,
						}
					}
				}
			}
		}
	}()
	return q
}

func (q *Queue) putNewKv(key, val string, leaseID clientv3.LeaseID) (int64, error) {
	cmp := clientv3.Compare(clientv3.Version(key), "=", 0)
	req := clientv3.OpPut(key, val, clientv3.WithLease(leaseID))
	txnresp, err := q.cli.Txn(q.ctx).If(cmp).Then(req).Commit()
	if err != nil {
		return 0, err
	}
	if !txnresp.Succeeded {
		return 0, ErrKeyExists
	}
	return txnresp.Header.Revision, nil
}

func (q *Queue) Enqueue(val string) error {
	for {
		newKey := fmt.Sprintf("%s/%v", q.prefix, time.Now().UnixNano())
		_, err := q.putNewKv(newKey, val, clientv3.NoLease)
		if err == nil {
			return nil
		}
		if !errors.Is(err, ErrKeyExists) {
			return err
		}
	}
}

func (q *Queue) Dequeue() (string, error) {
	res := <-q.dequeueC
	return res.result, res.err
}

func (q *Queue) claimFirstKey(kvs []*spb.KeyValue) (*spb.KeyValue, error) {
	for _, k := range kvs {
		ok, err := q.deleteRevKey(string(k.Key), k.ModRevision)
		if err != nil {
			return nil, err
		} else if ok {
			return k, nil
		}
	}
	return nil, nil
}

// deleteRevKey deletes a key by revision, returning false if key is missing
func (q *Queue) deleteRevKey(key string, rev int64) (bool, error) {
	cmp := clientv3.Compare(clientv3.ModRevision(key), "=", rev)
	req := clientv3.OpDelete(key)
	txnresp, err := q.cli.Txn(context.TODO()).If(cmp).Then(req).Commit()
	if err != nil {
		return false, err
	} else if !txnresp.Succeeded {
		return false, nil
	}
	return true, nil
}
```


### 方式三：认证方式改为 TLS

上面的授权机制小节有提到，除了“无授权”、“用户名+密码”外，etcd 还提供另一种方式来进行授权，即“TLS 证书认证”。证书认证在稳定性、性能上都优于密码认证，同时因为它不需要下发 token，所以可以避免任何因为 token 失效而触发的问题。

TLS 连接需要三个证书：CA、Client、Client Key，以下是一个使用 TLS 连接服务器的 client 例子：

```go
tlsInfo := transport.TLSInfo{
	CertFile:      "client.pem",
	KeyFile:       "client-key.pem",
	TrustedCAFile: "ca.pem",
}
tlsConf, err := tlsInfo.ClientConfig()
if err != nil {
	log.Fatal(err)
}
cli, err := clientv3.New(clientv3.Config{
	Endpoints:   strings.Split(c.Addr, ";"),
	TLS:         tlsConf,
	DialTimeout: 5 * time.Second,
})
```

## 参考

* https://etcd.io/docs/v3.2/learning/auth_design/
* https://github.com/etcd-io/etcd/issues/12385
* https://github.com/etcd-io/etcd/pull/14322
* https://etcd.io/docs/v3.2/op-guide/security/