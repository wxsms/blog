---
title: 关于
comments: false
sidebar: false
toc:
    enable: false
---

## 我

**郭凯瑞**，常用的网名是“wxsm”，出自《大话西游》里的“长夜漫漫，**无心睡眠**”。至于用这个名字的具体原因已不可考了，现在仍在沿用只是一种习惯性动作。

码农一枚，以 Web 前端和 Node.js 为主，也会点 php/python/golang。毕业后曾就职于东方海外航运、西山居游戏，目前在珠海金山办公上班。同时我也是 JetBrains 系列产品忠实用户（由此可知，我是一个从某种方面来说不喜欢折腾的人。包括这个博客从最开始的自己从零开始开发，到 Wordpress，再到 Vuepress，最后到现在的 hexo，也是如此）。

克罗恩病患者，详见{% post_link my-crohns-disease-and-treatment-records '这篇文章' %}。

::: tip
如有必要，可以通过侧边栏的邮件地址联系我。
:::

## 这个网站

这个网站主要用作我的个人文章记录，比如一些技术文章、生活随想或日常琐事。

写文章的习惯已经很多年了，但是小时候写的文章，现在感觉很多都已经不再适合拿出来看，因此这里保留的大概是从上大学以后写的文章。

我几乎不转载其它地方的文章，除非是我觉得写得非常好的、有翻译价值的外网文章，会自行翻译并转载过来。


## 我的一些开源项目

### jquery-2048

[https://github.com/wxsms/jquery-2048](https://github.com/wxsms/jquery-2048)

顾名思义，这是一个用 jQuery 写的 2048 小游戏。2016 年有一段时间这个游戏特别火，我也经常玩。那时候又刚好在自学前端，因此就用当时最流行的技术做了这么个东西。

当时我作为一个新手，它的代码非常丑陋，设计也不合理，但基本能流畅运行。除了有一个小问题：如果玩得太快的话，方块的显示可能会错位。

### 珠海公交巴士实时地图

[https://github.com/wxsms/zh-bus-realtime](https://github.com/wxsms/zh-bus-realtime)

刚毕业的时候，有一段时间经常需要搭公交。珠海的公交有实时运行图，但是并不是十分好用：比如我从一个站坐到另一个站，有非常多的线路可以选择，但珠海公交的官方系统不能同时查看多条线路的车。只能一条一条地换着看。并且也没有地图可以直观地看到下一趟车离我有多远。

于是我就做了这么一个系统：它可以同时监视任意条线路，并且能够在瓦片地图上显示它们的实时位置。它甚至可以记住我的常用线路，需要时完成一键查询。非常好用。

可惜后来珠海公交貌似对它的 API 做了一些调整，尝试了一段时间均无法成功调用，因此这个项目就到此为止了。

### uiv

[https://github.com/uiv-lib/uiv](https://github.com/uiv-lib/uiv)

这个项目从 2017 年开始做，是一个 Vue 2 实现的 Bootstrap 3 组件库。当时的情况见{% post_link uiv-release '这篇博文' %}。它同时也是我第一个花了好几年时间认真在做的开源项目。

在这些年来不断维护的过程中，它已经非常完善了。为了保证它的质量，我花了大量的时间编写了大量的单元测试，至今它的整体覆盖率依然在 90% 以上。

然而随着时代的发展，大家越来越倾向于使用更加大而全的组件库，Bootstrap 在国内用的人也逐渐变少了起来。因此这个 lib 基本属于半停更的状态。但是即便如此，我最近依然为它加上了最新的 Vue.js 3 支持，并且用 Vitepress 重新组织了文档。

### vue-md-loader

[https://github.com/wxsms/vue-md-loader](https://github.com/wxsms/vue-md-loader)

一个 webpack loader，可以将 Markdown 以及其内部的代码块转换为 Vue 组件。开发背景见{% post_link better-documents '这篇博文' %}。

这是一个 uiv 组件库的衍生产物，当时还没有 Vuepress 这样的 SSG 工具，我需要一个工具来帮我在 markdown 中插入 live demo。当然现在我们已经有更好的替代品了。

### vuepress-theme-mini

[https://github.com/wxsms/vuepress-theme-mini](https://github.com/wxsms/vuepress-theme-mini)

这是我为 VuePress 开发的一个非常轻量级的博客主题，它继承自默认主题，添加了一个首页和一个文章归档页，以及集成了一套评论系统。

博客迁往 hexo 后，它基本停更了。

### IBD 日记

[https://github.com/wxsms/food-diary](https://github.com/wxsms/food-diary)

一个微信小程序，可以帮助 IBD ([wiki](https://en.wikipedia.org/wiki/Inflammatory_bowel_disease)) 病人记录每日饮食、状况与用药记录。

最多的时候，这个小程序一天大概有五六十个独立用户在使用。一开始用的是微信的免费云计算额度，后来很遗憾的是，微信取消了免费套餐，强制要求升级并按月付费（并且很贵），因此它就下架了。

### bv2mp3

[https://github.com/wxsms/bilibili-video2mp3](https://github.com/wxsms/bilibili-video2mp3)

一款基于 Node.js 和 ffmpeg 的 bilibili 视频下载器，并且可以将下载的视频自动转为 mp3。

众所周知 b 站的音乐播放器并不好用，所以就有了它。详见{% post_link bv2mp3 '这篇博文' %}。
