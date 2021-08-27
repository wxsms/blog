---

title: '比较简单的 GitHub 加速方式'
date: 2021-07-26T03:39:37.923Z
tags: []
---

在不想全局 vpn 的情况下，可以用 host 加速。

该方法主要利用 [github.com/ineo6/hosts](https://github.com/ineo6/hosts) 的 hosts 文件，国内镜像 [gitee.com/ineo6/hosts](https://gitee.com/ineo6/hosts)。

<!-- more -->

## 方法一：手动

手动复制 hosts 的内容，并粘贴至对应操作系统的 hosts 文件内。

## 方法二：自动

1. 下载开源的 host 切换软件 [SwitchHosts](https://github.com/oldj/SwitchHosts)
2. 新建一条规则：
   1. 方案名：随便
   2. 类型：远程
   3. URL 地址：[https://gitee.com/ineo6/hosts/raw/master/hosts](https://gitee.com/ineo6/hosts/raw/master/hosts)
   4. 自动更新：随便，或 1 小时
3. 保存，保存后可以先手动刷新一次
4. 启用即可


