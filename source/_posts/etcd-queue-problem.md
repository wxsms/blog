---
title: etcd 队列引发的问题一则及源码解析
tags:
  - go
  - etcd
date: 2024-01-12 15:14:16
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

按照 #14995 的说法（create a new client each time before watching），经过我的实践，答案是：这个做法不一定可行，取决于使用场景。

其主要原因是，在创建一个新的 client 的过程中，client 和 server 需要进行一定的连接建立、授权认证等初始化工作，这些工作的耗时非常惊人，可能会达到几百毫秒。这样一来，如果我需要为进入服务器的每一个请求启动一个 watch 进程，那么每一个请求都可能会被拖慢几百毫秒。同时由于用户名+密码授权的过程耗费大量的 etcd server 计算性能，在请求量较大时，etcd server 可能会被频繁的授权工作拖累，出现耗时增加甚至崩溃的情况。

因此，我觉得这并不是一个“very easy workaround”。

### 方式二：修改队列源码，只在启动时 Watch

既然每次都创建新 client 不现实，那么很容易想到另一个办法：既然不能在服务运行的过程中动态 watch，那我在启动时只 watch 一次是不是就好了？答案是：确实可行。

队列代码修改后，大致思路如下，我们使用一个 channel 来作为 Dequeue 时的通信手段，在程序启动时，先通过 get 获取到所有的元素，一个一个消费完后，启动 Watch 来观测后续其它元素的入队：

```go
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
```

虽然自己实现的队列能够解决问题，但是稳定性可能相比 clientv3 内部的实现会有些许欠缺。在可能的情况下还是希望尽量使用 clientv3 的实现。


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

服务端修改为 TLS 认证后，只需要按上述方法同步修改客户端创建的过程即可，其它代码可以一行不动，完美！

## etcd 队列源码赏析

抛开上面遇到的问题不谈，etcd clientv3 中实现的“多读多写”分布式队列还是很值得学习的。队列源码文件位于 `client/v3/experimental/recipes/queue.go`，其暴露的接口如下：
 
```go
package recipe // import "go.etcd.io/etcd/client/v3/experimental/recipes"

type Queue struct {
        // Has unexported fields.
}
    Queue implements a multi-reader, multi-writer distributed queue.

func NewQueue(client *v3.Client, keyPrefix string) *Queue
func (q *Queue) Dequeue() (string, error)
func (q *Queue) Enqueue(val string) error
```

该 package 非常简洁，只暴露了三个函数：创建队列，出队和入队。下面一一解读。

### NewQueue

```go
func NewQueue(client *v3.Client, keyPrefix string) *Queue {
	return &Queue{client, context.TODO(), keyPrefix}
}
```

`NewQueue` 函数接收一个 client 实例指针和一个 `keyPrefix` 字符串（可以认为是队列名），返回一个队列实例指针。队列实例还额外创建了一个 `context` 实例，但是并没有允许使用者自定义该参数。这里貌似是一个值得商榷的点：从 `context.TODO` 也可以看出。正常来说，`context` 实例应该在调用 `Enqueue` 或 `Dequeue` 的时候单独传入，这样才能发挥它的预期作用（配置超时时间等）。

### Enqueue

```go
func (q *Queue) Enqueue(val string) error {
	_, err := newUniqueKV(q.client, q.keyPrefix, val)
	return err
}
```

`Enqueue` 函数的实现非常简单：从 `newUniqueKV` 这个函数来看，是根据 `keyPrefix` 和 `value` 来创建了一个唯一的键值对。然而 etcd 要怎么在“多写”的环境下保证键的唯一性呢？继续深入 `newUniqueKV` 函数：

```go
func newUniqueKV(kv v3.KV, prefix string, val string) (*RemoteKV, error) {
	for {
		newKey := fmt.Sprintf("%s/%v", prefix, time.Now().UnixNano())
		rev, err := putNewKV(kv, newKey, val, v3.NoLease)
		if err == nil {
			return &RemoteKV{kv, newKey, rev, val}, nil
		}
		if err != ErrKeyExists {
			return nil, err
		}
	}
}
```

原来 `newUniqueKV` 是通过一个循环，不断尝试用 `prefix/时间戳` 为 key 去创建 KV：

1. 如果创建成功了，则返回键值对；
2. 如果出错了：
   1. 出现了 `ErrKeyExists` 错误，代表这个 key 已经被使用了，因此回到循环开始处继续尝试创建；
   2. 出现了其它任意错误，返回错误信息。

这里其实还有一个知识点：etcd 的储存模式是 MVCC (Multi-Version Concurrency Control，即多版本并发控制)。也就是说，如果对同一个键进行多次写，etcd 本身并不会报 `ErrKeyExists` 错，而是会为这个 key 创建一个新的版本号和值。那么这里 `putNewKV` 要如何保证创建该 key 时它必须是不存在的呢？继续深入源码：

```go
// putNewKV attempts to create the given key, only succeeding if the key did
// not yet exist.
func putNewKV(kv v3.KV, key, val string, leaseID v3.LeaseID) (int64, error) {
	cmp := v3.Compare(v3.Version(key), "=", 0)
	req := v3.OpPut(key, val, v3.WithLease(leaseID))
	txnresp, err := kv.Txn(context.TODO()).If(cmp).Then(req).Commit()
	if err != nil {
		return 0, err
	}
	if !txnresp.Succeeded {
		return 0, ErrKeyExists
	}
	return txnresp.Header.Revision, nil
}
```

先看注释：`putNewKV` 尝试创建一个 key，且只有在这个 key 不存在的情况下才会成功。

这里其实利用了 etcd 提供的事务（`kv.Txn`）功能，etcd 设计了一套易读且强大的事务接口：

```go
cmp := v3.Compare(v3.Version(key), "=", 0)
req := v3.OpPut(key, val, v3.WithLease(leaseID))
txnresp, err := kv.Txn(context.TODO()).If(cmp).Then(req).Commit()
```

字面意义理解：如果 `cmp` 条件成立（`key` 的 `version` 为 `0`，即当前不存在这个 `key`），则执行 `req`（创建这个 `key`），然后提交（`Commit`）。结合 `newUniqueKV` 中的 `for` 循环来看，这其实是一把乐观锁。

`Enqueue` 函数到这里就结束了：该函数通过创建一个 `key` 来代表元素入队，同时通过乐观锁的方式，保证了多写的情况下一个 `key` 不会被重复入队。一个看似简单的函数，里面包含了很多知识点！

### Dequeue

`Dequeue` 是队列的另一个核心函数，同时也是本次实践中出现问题的函数。它的源码：

```go
// Dequeue returns Enqueue()'d elements in FIFO order. If the
// queue is empty, Dequeue blocks until elements are available.
func (q *Queue) Dequeue() (string, error) {
	// TODO: fewer round trips by fetching more than one key
	resp, err := q.client.Get(q.ctx, q.keyPrefix, v3.WithFirstRev()...)
	if err != nil {
		return "", err
	}

	kv, err := claimFirstKey(q.client, resp.Kvs)
	if err != nil {
		return "", err
	} else if kv != nil {
		return string(kv.Value), nil
	} else if resp.More {
		// missed some items, retry to read in more
		return q.Dequeue()
	}

	// nothing yet; wait on elements
	ev, err := WaitPrefixEvents(
		q.client,
		q.keyPrefix,
		resp.Header.Revision,
		[]mvccpb.Event_EventType{mvccpb.PUT})
	if err != nil {
		return "", err
	}

	ok, err := deleteRevKey(q.client, string(ev.Kv.Key), ev.Kv.ModRevision)
	if err != nil {
		return "", err
	} else if !ok {
		return q.Dequeue()
	}
	return string(ev.Kv.Value), err
}
```

先看注释：`Dequeue` 会将入队的元素按 FIFO （先入先出）的顺序出队，如果当前没有可出队的元素则会阻塞直到出队成功。

出队的流程总结：

1. 尝试通过 `keyPrefix` 为前缀获取一个元素，其中 `WithFirstRev` 指定获取最老的修订版本号（即最早入队的元素）；
2. 尝试“claim”获取到的这个 key，“claim”的方式即删除：
   1. 如果该客户端成功执行了删除，则认为出队成功，返回元素；
   2. 如果没有成功删除（在“多读”的场景下，代表这个元素被其它客户端“claim”了），但还有更多元素可以获取，则递归调用自己，重复上述流程
3. 如果即没有成功“claim”，也没有更多元素可以获取了，则启动一个 watch 进程，开始监听新创建的元素，同时函数在这里阻塞
4. 监听到新元素后，同样的，尝试将该元素删除：
   1. 如果成功删除，则认为出队成功，返回元素
   2. 如果删除失败（在“多读”的场景下，代表这个元素被其它客户端出队了），则递归调用自己，重复上述流程

`claimFirstKey` 中调用了 `deleteRevKey` 来删除元素，该函数同样利用了事务来确保不重复删除（不重复出队）：

```go
// deleteRevKey deletes a key by revision, returning false if key is missing
func deleteRevKey(kv v3.KV, key string, rev int64) (bool, error) {
	cmp := v3.Compare(v3.ModRevision(key), "=", rev)
	req := v3.OpDelete(key)
	txnresp, err := kv.Txn(context.TODO()).If(cmp).Then(req).Commit()
	if err != nil {
		return false, err
	} else if !txnresp.Succeeded {
		return false, nil
	}
	return true, nil
}
```

同样的，由于 MVCC 的特殊性，这里需要通过在删除前比较 key 的 `ModRevision` （即最新版本号），确保执行删除时该版本号没有发生变化，然后才执行删除。这是因为在 etcd 中，删除一个 key 并不会真正将它物理意义上的删除，而是在版本数据库中插入一条“删除”的记录，并且修改版本号。如果不做事务判断，则有可能出现重复删除（重复出队）的情况。

## 参考

* https://etcd.io/docs/v3.2/learning/auth_design/
* https://github.com/etcd-io/etcd/issues/12385
* https://github.com/etcd-io/etcd/pull/14322
* https://etcd.io/docs/v3.2/op-guide/security/
* https://github.com/etcd-io/etcd/blob/main/client/v3/experimental/recipes/queue.go