---
permalink: '/posts/2017-10-27-better-documents.html'
title: 'Better Documents'
date: 2017-10-27T06:43:01.255Z
categories: [Web-Front-end]
tags: [Vue,Github,Webpack,Markdown,User-Experience]
sidebar: false
draft: false

---

[[toc]]


这篇文章记录了我是如何一步步地把 [https://github.com/wxsms/uiv](https://github.com/wxsms/uiv) 这个项目的用户文档变得更优雅的。实际上，如何以一种**高效又优雅**的方式编写**实例文档**一直是我的一个疑惑，比如主要的问题体现在：

* 如何使文档更易读？
* 如何使文档更易于维护？
* 如何减少编写文档的工作量？
* 实例代码无可避免地需要手工维护吗？

最后一点是让我最头疼的地方。举个例子，我想要给用户展示一个组件的使用方式，以下代码可以在页面上创建一个 Alert：

```html
<alert type="success"><b>Well done!</b> You successfully read this important alert message.</alert>
```

那么，我总要给用户一个相对应的**实例**吧。我要在我的文档上面就创建一个这样的 Alert，同时告诉用户说你可以这么用。这是一个很普遍的展示方式，那么问题就在这里了，我是否要将**同样的代码写两次**呢？

一开始我确实就是这么做的，虽然我知道这不科学，不高效，更不优雅。但我实在是想不到更好的办法了。

但是，现在，我已经（几乎）把以上的问题都解决了。

<!--more-->

## Stage-1

写文档这件事，实际上跟写文章差不多，写作体验很重要。

在最开始的时候，项目文档是直接用 Vue 文件编写的，没有经过任何处理，没有经验的我甚至还作死地加入了 i18n，可以说是非常有趣了。以至于到最近，在没有发生这次重构之前，我根本不想动它们。

可以想象，我给关键字句加个粗要手写 `<b>...</b>`，标记一点代码要用 `<code>...</code>`，每写一段话都要注意标签标签标签，文档里充斥这些东西，烦不胜烦。

这阶段的文档，存在的问题主要有：

* 难以编写
* 无法在网站以外的地方阅读（因为是 Vue 源码）
* 给项目增加了许多额外代码
* 手工维护的实例代码

## Stage-2

以上提到的写作体验令人作呕，经过了漫长的时间后，在这一阶段得到了解决。某次机缘巧合，我发现了这样一个工具，它可以通过 webpack 将 Markdown 格式的文本直接转换成为 Vue 组件：[vue-markdown-loader](https://github.com/QingWei-Li/vue-markdown-loader)

比如：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        loader: 'vue-markdown-loader'
      }
    ]
  }
};
```

这样一来，就可以通过 `import [*].md` 的方式，得到一个内含 Markdown 内容（已转 HTML）的 Vue 组件。可以直接在页面上用了！

如果不考虑**实例**部分的话，这就已经完美了。准确地说，如果一开始就不需要实例这种东西，那么我肯定会直接用 Gitbook 了。也不需要这个 markdown to vue 来做什么。

---------

经过了长时间的折磨的我身心疲惫，最终还是决定尝试一下。

然而，就在这个尝试的过程中惊喜地发现：**它居然还可以执行 Markdown 中的 Code block 中的代码！**

这是什么鬼。一开始发现这个的时候我还是很惊讶的。仿佛打开了新世界的大门。

**在后来的不断尝试 - 失败 - 尝试的过程中，我发现了它更多的 Feature：**

* 可以执行 Code blocks 中的代码（`<script>`）
* 可以执行 Code blocks 中的样式（`<style>`）
* 可以通过插件给文档 header 加锚点

**但是，也发现了以下问题：**

* 多个 Code blocks 中的 `<style>` 可以合并，但 `<script>` 不行，**它始终只会执行所找到的第一段 `<script>`**

通过查阅 `vue-loader` 的文档发现，这是 `.vue` 文件本身的限制：支持多个 `<template>`，多个 `<style>`，**一个 `<script>`**

也就是说，如果页面上有多个实例需要展示的话，给给。

如果这个问题能够解决的话，再结合我本身的需求，以下内容也需要实现：

* 将实例代码中的 `<template>` 模板插入到其代码块之前，让其成为 Markdown 文件的一部分，然后 Vue 就会自动将它们统统实例化

---------

**其实到了这里，也就是这两个问题需要解决了。**

首先是**模板插入**的问题。这个其实不难，在 Markdown 完成渲染前，通过一些手段找到这些需要渲染的模板，然后手动插入。幸而 loader 提供了 `preprocess` 钩子，让我能直接完成这件事情。

然后，关于 `<script>` 这块，我尝试了好久好久，实在是没办法。但是又真的舍不得因为这仅仅一个问题丢弃以上的那么多的好处。于是就想到了一个折中的办法：禁用 loader 的自动执行代码功能，并手动组装代码块。然而一个悲催的问题又出现了：禁用自动代码执行后，`<style>` 也无法自动执行了。

解决方案：我需要在 `preprocess` 中将 Code blocks 里面的 `<style>` 块全部切出来，贴到 code blocks 的外面（比如文件结尾处）去。一开始我还尝试了将它们的内容合并成为一个 `<style>`，后来发现其实不需要，因为 `vue-loader` 本身就支持一个文件多个 `<style>` 节点。

最后的最后，轮到了 `<script>` 的组装。我尝试了很久的自动合并，比如将它们的 export 内容转为 object 再 merge 啦，function 转为 object 再 merge 啦，toString 再 merge 啦，等等等等，然而各种方式都以失败告终。结论是：我无法将数个字符串代码块直接合并，也无法转为 object 再合并再转回字符串。实在的实在是没办法了，hard code 吧。

---------

至此，一个新的解决方案就出现了。简单来说，编写一篇文档，我需要做以下的事情：

* 用 Markdown 写文档以及实例代码
* 实例代码块中加入约定的标志
* 注意同一个 Markdown 中的实例代码块的 `<script>` 不能相互冲突
* 做完所有事情以后，用我自己的智商和爱将所有的实例代码合并成一份

大功告成。

虽然依然有些麻烦，但相比与 Stage-1，我至少解决了以下的大事：

* 文档编写体验大幅度提升！
* 文档可以在网站以外的地方被阅读（如 Github）
* 实例的 `<template>` 与 `<style>` 代码无需再有特殊照顾
* 维护工作量大大减少

依然存在的问题是：

* 实例的 `<script>` 代码需要维护两份，而且不能彼此冲突

## Stage-3

虽然解决了 80% 的问题，但 Stage-2 依然不完美。我始终想要解决最后一个问题：**无需特殊照顾的实例 `<script>`**

想要达到这个目标，有一个完美的办法就是：**将实例也作为子组件来插入到 Markdown 父组件中去**。这样一来，同一页面的实例代码无法冲突的问题也就一并解决了。

显然，通过目前的 loader 无法达到我想要的效果，它只能够简单地将代码插入 Markdown，并不能构建子组件。因此，要解决这个问题，**我需要自己造轮子**。

......

------------

于是就有了：

[https://github.com/wxsms/vue-md-loader](https://github.com/wxsms/vue-md-loader)

关于这个轮子，它是原有 markdown-loader 的一个替代品，**并且能够解决以上提出的所有问题**。

除了完善的原有 Markdown 转换功能以外，它还可以将 Markdown 中的实例代码，比如：

```html
<template>
  <div class="cls">{{msg}}</div>
</template>
<script>
  export default {
    data () {
      return {
        msg: 'Hello world!'
      }
    }
  }
</script>
<style>
  .cls {
    color: red;
    background: green;
  }
</style>
<!-- some-live-demo.vue -->
```

变成类似这样的结构：

```html
<some-live-demo/>
<pre><code>...</code></pre>
```

> A **Vue component** with all it's `<template>`, `<script>` and `<style>` settled will be **inserted before it's source code block**.

毫无疑问，它**支持同一文件中的多个代码块**。

关于这个插件，其实就是一个典型的、简单的 webpack loader，将一个 markdown 文件转换成了可以被 `vue-loader` 识别并加载的 vue 文件。

它的实现思路主要有：

* 将实例代码块中的 `<style>` 直接截取，并放到 Markdown 组件下
* 将实例代码块中的 `<script>` 中 `export default` 的内容截取，并作为各自的 Component options
* 加上相应代码块中的 `<template>` 中的内容，稍微组装一下，它就成为了一个 Vue component
* 在 Markdown 组件中局部注册该 component，并将它插入到代码块的前面去
* 对于 `export default` 外部的内容，把它们抽取出来，集中放到 Markdown 组件下

以上这些操作，全部通过字符串与正则操作就足以完成了。

然而可以发现，这里面仍有一些有待解决的问题：

* `<style>` 有可能冲突
* `export default` 之外的内容有可能冲突

这两个问题目前也还没有想到有效的解决办法。但是，就目前来说，满足我的需求已经完全足够了。遗留问题通过后续的开发来逐步解决吧。

----------------

至此，优雅地编写项目文档的全部要素就齐备了：

* 纯文档编写体验（Markdown）
* 文档可以在网站以外的地方被阅读（如 Github）
* 实例代码均无需特殊照顾，所有过程自动完成
* 没有维护压力

**Enjoy!**
