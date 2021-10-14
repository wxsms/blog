---
title: '用 PM2 代理静态文件'
date: 2017-12-05T11:10:49.100Z
tags: [nodejs]
---

命令 (2.4.0+)：

```
$ pm2 serve <path> <port>
```

举例：

```
$ pm2 serve /dist 80
```

默认情况下，如果页面未找到，它将显示 `404.html` 目录中的文件 (**无法**配置)。
