---
id: github-pages-and-ssl
title: 'Github Pages and SSL'
date: 2016-12-05 17:00:00
categories:
  - Personal
tags:
  - Github, SSL
---

经过一些努力，把博客迁移到了 Github Pages，将域名改成了自定义，并且成功启用了 SSL，以下是步骤（就不截图了）。

## 部署代码

Github Pages 支持两种级别的部署：

1. **user / organization** 方式

    * repo 名字必须为 `<user-name or org-name>.github.io`
    * pages build branch 固定为 `master`
    * 部署后的发布域名即为 repo 名
2. **project** 方式
    * repo 名字没有限制
    * pages build branch 可以任意指定
    * 发布域名为 `<user-name or org-name>.github.io/<project-name>`

因此，如果要做个人页面则必然选择第一种方式。

因为 build branch 限制为 master，因此我一开始选择了重建 repo，实际上没有必要，可以直接 rename 旧的 repo

rename 后，到 repo settings -> options -> Github Pages，即可发现自动部署已经开始了。即刻访问 `<user-name or org-name>.github.io` 可以看到部署结果。

## 自定义域名

1. 在 repo settings -> options -> Github Pages -> Custom Domain 中，填入自己的域名，如 `wxsm.space`，保存
2. 在自己的域名供应商处修改域名解析，添加两条 A 记录（此处可以参考最新[文档](https://help.github.com/articles/setting-up-an-apex-domain/)）：
    * `192.30.252.153`
    * `192.30.252.154`
3. 等待记录生效
    
过一会就可以发现，使用自定义域名可以访问网站了，并且原 `<user-name or org-name>.github.io` 会重定向到自定义域名。

## 启用 SSL

这里是最麻烦的。虽然 Github Pages 原生支持 SSL，但是只针对 `*.github.io` 域名，对于自定义域名，无法直接启用。因此需要找一个支持 SSL 的 CDN 供应商。考虑到免费这个关键因素，选择了 CloudFlare（以下简称 CF）

1. 前往 CF 官网，注册账号，填入自己的域名，点几个 Continue
2. 到注册的最后一步时，需要将域名的 DNS 服务器切换为 CF 服务器（CF 会提供两个，两个都要填上），到原域名供应商处修改域名 DNS 服务器即可，24 小时内生效
3. 生效后可以打开网站查看是否正常。控制台页面上方有一个 Crypto Tab，点开，SSL 选择 `Flexible` 或者 `Full`，同样需要等待一段时间生效
4. 生效后即可以通过 `https` 访问网站了，如果需要强制 SSL，可以到 Page Rules Tab，添加一些记录，为某些域名段设置强制 SSL `Aways use https`

