---
id: 'serve-static-with-pm2'
title: 'Serve static with PM2'
date: 2017-12-05T11:10:49.100Z
categories: [JavaScript]
tags: [PM2]
sidebar: false
draft: false

---




Command (2.4.0+):

```
$ pm2 serve <path> <port>
```

For example:

```
$ pm2 serve /dist 80
```


By default, it displays `404.html` from the serving directory when that happens (NOT configurable).
