---
title: 'MEAN.JS 在 0.5 版本下发现的 NG-REPEAT 闪动问题'
date: 2017-02-20 10:14:00
tags: [angularjs, meanjs]
---

如题，经过长期痛苦的观察以及 debug 过程，以下原因被一一排除：

* 浏览器差异问题
* 数据更新问题
* `ng-repeat` 没有添加 `track by key` 导致的性能问题
* Angular 版本问题
* MEAN.js 架构问题

**实际原因却是因为 MEAN.js 在全局引入了 `ngAnimate` 依赖。**（也算是一个架构问题？）

因此解决办法：

* 要么将全局依赖去掉，改为各自添加依赖
* 要么使用 `transition: none !important`

<!-- more -->