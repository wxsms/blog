---
permalink: '/posts/2017-03-30-uiv-release.html'
title: '基于 Vue 2 与 Bootstrap 3 的组件库 uiv 发布啦'
date: 2017-03-30 12:03:00
categories:
  - JavaScript
tags:
  - Vue
  - Bootstrap

---




一点微小的工作。

Demo: [https://uiv.wxsm.space](https://uiv.wxsm.space)

Github: [https://github.com/wxsms/uiv](https://github.com/wxsms/uiv)

NPM: [https://www.npmjs.com/package/uiv](https://www.npmjs.com/package/uiv)

项目使用 MIT 许可，随便用。

<!--more-->

## 简单介绍

做这个东西的初衷是，想要一些简单的、基础的、常用的基于 Vue 2 与 Bootstrap 3 的可重用组件。因为我还有一个目标：一个灵活健壮的、类似 MEAN.js 这样的 Vue + Node.js + MongoDB 的 Seed 项目。没有一个简单的组件库，项目无法进行。

其实现在社区有很多开源作品了，但是简单来说，就是觉得不是很满意，怎么说呢：

* VueStrap 这个作品虽然出现的比较早也比较全，然而貌似止步在 Vue 1 了，更新比较慢，不客气地说，里面很多组件其实是不好用的。只要稍稍对比下 Angular UI Bootstrap 就能发现差距，有些东西从设计上就有问题。
* Bootstrap-Vue 这个作品是基于 Bootstrap 4 的，不知道为什么，就是不太喜欢。
* Material Design 的作品有两三个，但实际使用上，感觉还是 Bootstrap 的应用场景更多，也更轻量。
* 至于 ElementUI，做得非常好非常全，然而是自立门户做的，跟 Bootstrap 与 Material 都没有关联。

我想要的是：

* 能够完全使用到 Bootstrap CSS
* 很多方面只要像 Angular UI Bootstrap 靠齐就行，毕竟经过了 Angular 1 时代的考验，事实证明它是最好用的
* 最小的体积
* 纯净的依赖，没有除了 Vue 与 Bootstrap CSS 以外的东西
* 主流浏览器支持

好吧，说白了就是想自己做。跟前辈们做的东西好与不好无关。反正开源作品，人畜无害。

做着做着，于是就有了这个东西。感谢静纯的参与，帮我完成了一部分工作。

## 项目现状

目前已完成的组件有：

* Alert （警告）
* Carousel （轮播）
* Collapse （收缩与展开）
* Date Picker （日期选择）
* Dropdown （下拉）
* Modal （模态框）
* Pagination （分页）
* Popover （弹出框）
* Tabs （标签页）
* Time Picker （时间选择）
* Tooltip （提示）
* Typeahead （自动补全）

共 12 个。

依赖只有 Vue 2 与 Bootstrap 3，最终打包压缩 + Gzip 后体积约 9 KB，应该算是比较轻比较小的啦。

所有组件在主流浏览器（Chrome / Firefox / Safari）与 IE 9 / 10 / 11 下都经过了测试，暂时没有发现问题。当然，由于 IE 9 不支持 Transition 属性，因此是没有动画效果的，不过功能正常，不影响使用流程。

当然，除了以上的浏览器环境测试以外，还进行了完善的单元测试，组件代码测试覆盖率达到 99%（Github 与项目主页上的测试率标签显示为 97%，因为其中包括了文档源码，与实际组件无关）。可以保证在大多数情况下正常工作。

## Road Map

接下来要做的事：

* 把自动化的 E2E 测试搞起来，目前项目使用的自动测试只有单元测试，无法自动测试不同的浏览器，这个很重要，保证项目在跨浏览器上的质量
* 收集一些意见与反馈，完善一下现有的东西
* 将 Date Picker 与 Time Picker 组合
* Multi Select （多选组件）
* 等等等等......

有问题请提 issue，一定尽快解决。同时也欢迎 PR

最后，欢迎使用。
