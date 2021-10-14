---
title: Windows 无法删除 Node_modules 文件夹的解决方案
date: 2016-07-28T16:56:40+00:00
tags: [nodejs,windows,npm]
---

在 Windows 操作系统下开发 NodeJS 项目的时候经常会遇到无法删除 Node_modules 文件夹的尴尬（因为依赖过多，文件路径长度爆炸），解决办法如下。

<!-- more -->

全局安装 `rimraf` 模块到系统下：

```
npm install -g rimraf
```

CD 到相应文件夹，执行如下指令：

```
rimraf node_modules
```

等待其完成即可。

其实这个模块也可以用来删除其它无法正常删除的东西，挺好用的。Node 用习惯了以后可以为系统提供许多便利，比如说现在我都不怎么使用系统自带的计算器了，直接 WIN + R + NODE 就可以得到一个 Node 环境下的计算器，非常快捷。
