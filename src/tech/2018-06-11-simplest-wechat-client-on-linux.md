---
permalink: '/posts/2018-06-11-simplest-wechat-client-on-linux.html
title: 'Simplest Wechat Client on Linux'
date: 2018-06-11T07:26:45.443Z
tags: [Linux]
sidebar: false
draft: false

---




微信没有为 Linux 提供桌面客户端，可用的替代方式有：

1. 使用[网页版微信](https://wx.qq.com/)
2. 使用第三方客户端，如 [electronic-wechat](https://github.com/geeeeeeeeek/electronic-wechat)
3. 自己动手，将网页版微信封装为桌面应用程序

但是每种方式都有不尽人意的地方。网页版总是嵌入在浏览器中，用起来不太方便；第三方客户端安全性无法保证；自己做一个客户端又太麻烦。

然而，实际上还有一种更简单的方式：通过 Chrome 将网页直接转化为桌面应用。

步骤：

1. 使用 Chrome 打开[网页版微信](https://wx.qq.com/)
2. 右上角设置，`More tools` -> `Create shortcut...`
3. 然后就可以在 Chrome Apps 中找到微信了

通过此方式创建的 Apps 同时拥有桌面应用的表现以及网页版的功能，并且可以将它固定到 Dock 栏，以及独立于浏览器运行，只能用「完美」两个字形容。

除微信外，其它缺少 Linux 客户端但有网页客户端的应用亦可如法炮制，如有道云笔记等。
