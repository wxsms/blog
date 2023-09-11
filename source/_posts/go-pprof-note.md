---
title: Go 语言性能调试与问题分析工具：pprof 用法简介
date: 2023-09-11 16:01:04
tags: [go,pprof]
---

[pprof](https://github.com/google/pprof) 是 Google 开发的一款用于数据分析和可视化的工具。

最近我编写的 go 程序遇到了一次线上 OOM，于是趁机学习了一下 Go 程序的性能问题排查相关知识。其基本路线是：先通过内置的 `net/http/pprof` 模块生成采集数据，然后在使用 pprof 命令行读取并分析。Go 语言目前已经内置了该工具。

本文不会介绍 pprof 的太多细节，只关注主要流程（主要的是太细的我现在也不会）。

<!-- more -->

## 数据采集

由于 Go 语言内置了对 pprof 的支持，因此无需额外安装其它依赖，只需要在程序入口处引入相关包，并且启动一个服务即可：

```go
package main

import (
    "net/http"
    _ "net/http/pprof"
    // ...
)

func main() {
    go func() {
        // pprof 服务器，将暴露在 6060 端口
        if err := http.ListenAndServe(":6060", nil); err != nil {
            panic(err)
        }
    }()

    // ...
}
```

需要注意的是 pprof 服务需要使用独立的协程运行，否则会阻塞代码运行。添加这段代码后，程序除了运行原本的逻辑外，还将额外监听一个端口（此处为 6060），在本地运行程序，打开 [http://localhost:6060/debug/pprof/](http://localhost:6060/debug/pprof/)，将看到如下界面：

![](f03c5ccb2076423c9ae6ba75aa6f4747.png)

数据采集服务即启动成功。

::: tip
我刚开始看到这段代码的时候有点好奇：为什么它的 `handler` 传了 `nil`，但是却能够启动一个 debug 服务呢？

后来仔细看了一下源码后就发现，handler 如果传 nil 的话，即默认为 `DefaultServeMux`：

```go
// net/http/server.go
type Server struct {
    // ...
    Handler Handler // handler to invoke, http.DefaultServeMux if nil
    // ...
}

func (sh serverHandler) ServeHTTP(rw ResponseWriter, req *Request) {
    handler := sh.srv.Handler
    if handler == nil {
        handler = DefaultServeMux
    }
    // ...
}

// HandleFunc registers the handler function for the given pattern
// in the DefaultServeMux.
// The documentation for ServeMux explains how patterns are matched.
func HandleFunc(pattern string, handler func(ResponseWriter, *Request)) {
    DefaultServeMux.HandleFunc(pattern, handler)
}
```

而 `net/http/pprof/pprof.go` 在 init 函数中，向 `DefaultServeMux` 注册了几个路径：

```go
// net/http/pprof/pprof.go

func init() {
    http.HandleFunc("/debug/pprof/", Index)
    http.HandleFunc("/debug/pprof/cmdline", Cmdline)
    http.HandleFunc("/debug/pprof/profile", Profile)
    http.HandleFunc("/debug/pprof/symbol", Symbol)
    http.HandleFunc("/debug/pprof/trace", Trace)
}
```

因此，如果启动一个 handler 为 nil 的 http 服务，即默认会添加上 pprof 的一系列路由。
:::


这个 web 界面上面有一些链接，每个链接代表一个监控项目，页面下方也对它们做了一些解释。直接点进去的话，会展示一些数据，但是目前这些数据比较原始，可读性不佳。但好消息是，后面可以通过 pprof 命令行对它们进行进一步的分析。

## 指标解释

除了 `cmdline` 和 `trace` 以外，上面的每一个链接都代表一种指标。常用指标如下：

* profile：CPU 占用率
* heap：当前时刻的内存使用情况
* allocs：所有时刻的内存使用情况，包括正在使用的及已经回收的
* goroutine：目前的 goroutine 数量及运行情况
* mutex：锁争用情况
* block：协程阻塞情况

## pprof 命令行工具

程序运行一段时间后，我们就可以通过 `pprof` 命令行来进行数据分析了。打开一个终端环境，输入 `go tool pprof http://localhost:6060/debug/pprof/allocs` 并按下回车，就能看到如下界面：

![](ab39c95412bb488f8878c13a72a2ae84.png)

此时即连接成功。接下来在终端中操作，将展示命令行启动时刻的监控数据。输入 `help` 可以展示所有的命令，输入 `help [command]` 可以展示具体命令的帮助界面。

现在回到上面那个链接 `http://localhost:6060/debug/pprof/allocs`，观察一下它的构成：

1. 首先，是一个常规的 host+port 组合，由于我们在本地启动服务且指定监听 6060 端口，因此这里填写 `localhost:6060`。但是它同样也支持远程连接。即对部署在服务器上的程序进行分析。只要遵循同样的格式，以及保证路径可访问即可；
2. 然后跟随的是一个 `/debug/pprof/` 路径，此为固定值；
3. 最后是一个 `allocs`，这个代表某一种监控指标。回到刚刚的那个 web 界面，除了 `cmdline` 以外，每一个链接都代表一种指标，可以在此处直接填入，即可更换分析目标。

如果要退出 pprof，可以输入 `exit` 并回车。

下面介绍几个常用命令。

### top：列出数据

要列出当前资源的占用情况，可以在 pprof 中使用 top 命令：

![](b3732fa081ba444c815af0f4d7992ce8.png)

默认会按照资源占用率从高到低，显示 10 条数据。

它上面的每项指标（flat/flat%/sum/cum/cum%）通常来说并不需要特别在意其具体含义，只需要知道数值越大则资源占用情况越严重即可。结果默认按照 flat 排序。

### list：显示详情

当发现某个函数资源占用情况可疑时，可以通过 `list 函数名` 定位到具体的代码位置。举例：

![](011d3b578be449a796e550d80e9e364f.png)

### web：可视化分析

在使用 web 命令之前需要做一个准备工作：安装 [Graphviz](https://graphviz.gitlab.io/download/) 工具，并将它添加到系统 path 中。

直接在命令行输入 `web`，pprof 将打开一个浏览器，并展示一个可视化的分析界面：

![](3ab1a1946c2949c982d6a645c4cf0f95.png)

其中，方块越大，线条越粗，则代表资源占用情况（相对来说）越严重。并且在 web 界面上将显示函数的完整调用链路。

## pprof 的另一种使用方式

可以通过 `go tool pprof -http=:8888 http://localhost:6060/debug/pprof/allocs` 命令直接打开一个 web 界面，这个 web 界面将拥有与命令行类似的功能，并且可以显示火焰图。同样，这个命令需要先安装 [Graphviz](https://graphviz.gitlab.io/download/) 工具。


