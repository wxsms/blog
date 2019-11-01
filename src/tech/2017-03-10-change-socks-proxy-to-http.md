---
id: 'change-socks-proxy-to-http'
title: 'Change SOCKS Proxy to HTTP'
date: 2017-03-10 12:00:00
categories: [Software]
tags: [Proxy, OSX, Windows, HTTP]
sidebar: false

---




## OSX

Use `brew` to install `polipo` via socks proxy:

```bash
$ ALL_PROXY=socks5://127.0.0.1:9500 brew install polipo
```

Create `polipo.config` file under `Document`:

```
socksParentProxy = "127.0.0.1:9500"
socksProxyType = socks5
proxyAddress = "::0"
proxyPort = 8123
```

Start polipo server:

```bash
$ polipo -c ~/Documents/polipo.config
Established listening socket on port 8123.
```

Verify it at `http://localhost:8123`.

## Windows

Use [privoxy](http://www.privoxy.org/) tool. Download: [http://www.privoxy.org/sf-download-mirror/Win32/](http://www.privoxy.org/sf-download-mirror/Win32/)

Install it, find the config file at `\Privoxy\config.txt`, append following to the bottom of it:

```
forward-socks5 / 127.0.0.1:9500 .
```

(Mind the dot at the end)

The default port is `8118`, search from the config file to replace it.
