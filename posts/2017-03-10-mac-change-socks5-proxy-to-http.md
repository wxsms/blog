---
id: 'mac-change-socks5-proxy-to-http'
title: 'Mac Change SOCKS5 Proxy to HTTP'
date: 2017-03-10 12:00:00
categories:
  - OSX
tags:
  - Proxy
---

有些指令不支持 SOCKS5 方式的代理，因此要用到 HTTP 代理，需要一个将 Archsocks 代理转化成 HTTP 代理的工具。

这里先通过 SOCKS5 代理使用 `brew` 安装一个代理工具 `polipo`：

```bash
ALL_PROXY=socks5://127.0.0.1:9500 brew install polipo
```

在 Document 下创建一个 polipo.config 文件，内容：

```
socksParentProxy = "127.0.0.1:9500"
socksProxyType = socks5
proxyAddress = "::0"
proxyPort = 8123
```

安装完成后，在终端中输入下面的指令：

```bash
polipo -c ~/Documents/polipo.config
```

看到下面的输出，这样 HTTP 代理服务器就起来了：

```bash
Established listening socket on port 8123.
```

可以在浏览器中打开 `http://localhost:8123` 确认启动信息以及配置等。确认无误后，就可以用 `npm config set proxy` 指令来为 npm 配置代理了。

（其实下载可以用 `cnpm`，这里主要解决的是 `npm publish` 的问题）
