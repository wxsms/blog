---

title: '比较简单的 GitHub 加速方式'
date: 2021-07-26T03:39:37.923Z
tags: []
---

在不想用全局 vpn 的情况下，可以用 host 加速：

1. 访问 [https://github.com.ipaddress.com/](https://github.com.ipaddress.com/)，获得 ip 地址
2. 访问 [http://github.global.ssl.fastly.net.ipaddress.com](http://github.global.ssl.fastly.net.ipaddress.com/#ipinfo)，获得 ip 地址
3. 将其添加到 host 文件内，如：

```
199.232.5.194 github.global.ssl.fastly.net
140.82.112.4 github.com
```

此办法也适用于其它部分网站，如 gitlab.com 等：

```
172.65.251.78 gitlab.com
```

附：开源的 host 切换软件 [SwitchHosts](https://github.com/oldj/SwitchHosts)

<!-- more -->
