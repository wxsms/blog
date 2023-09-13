---
title: 静态文件 Docker 镜像问题一则
date: 2023-03-23 17:41:39
tags: [docker,javascript]
---

今天想要打包一个 Docker 镜像，里面只包含一些静态的前端文件。为了使体积足够小，想到的方案是把命令全部集中在一个 RUN 上，类似这样：

```dockerfile
FROM node

WORKDIR /usr/src/app
COPY . .

RUN yarn --frozen-lockfile --check-files --ignore-engines && \
    yarn build && \
    rm -rf node_modules
```

但是打包出来的镜像，死活都是 2.2G，node 镜像自身 900MB，静态文件总共才 10MB+，run container 进去查看 node_modules 也确实删掉了，百思不得其解。一度以为是 Docker 出了 bug，遂升级 Docker，但仍不能解决。

折腾了一下午后，尝试去掉 `rm -rf node_modules`，观察到打出来的镜像 2.8G，突然觉得是不是还有什么东西没删干净，然后很快就想到了 yarn 的缓存。添加 `yarn cache clean` 后，打出来的镜像来到 910MB。世界终于清净了。
