---
permalink: '/posts/2018-01-24-some-thougths-about-momentjs.html'
title: '关于 Moment.js 的一些思考'
date: 2018-01-24T06:40:18.456Z
tags: []
sidebar: false
draft: false

---




<!-- 「」 -->

[Moment.js](https://momentjs.com/) 是一个流行的基于 JavaScript 的时间处理工具库。应该是一个从 2011 年开始启动的项目，至今它的 [Github repo](https://github.com/moment/moment) 也有了 3w+ 的星星，可以说在前端界人尽皆知了。反正我自从用了它基本上就没再接触过其它的相关库。

但最近我却对它的看法却产生了些许改变。原因是，它的 API 设计给使用者埋下了巨大无比的坑，简单来说：“名不副实”。

<!-- more -->

具体看图吧：

![strange-moment-js](https://user-images.githubusercontent.com/5960988/48595809-41e73000-e991-11e8-8de0-d37e072df03c.png)

很明显，调用 Moment.js 的 API 产生了预期之外的副作用。函数在带有返回值的同时却又对原始值进行了修改，违反了基本的 OO 设计原则。

> **Command–query separation (CQS)** is a principle of imperative computer programming. It was devised by Bertrand Meyer as part of his pioneering work on the Eiffel programming language. **It states that every method should either be a command that performs an action, or a query that returns data to the caller, but not both.** In other words, Asking a question should not change the answer. More formally, methods should return a value only if they are referentially transparent and hence possess no side effects.

也就是说，设计一个函数，它应该：

* 要么进行操作（Mutable）；
* 要么进行返回（Immutable）；
* 但，以上两点不能同时进行。

这里的“返回”，我的理解不是所有类型的返回，而是特指与原始值相对应的返回。

比如说，在 JavaScript 世界中 `array.slice` 是一个 Immutable 类型的函数，它不会对输入值进行改变，而是返回一份 copy：

> The `slice()` method returns a shallow copy of a portion of an array into a new array object selected from begin to end (end not included). The original array will not be modified.

但 `array.splice` 则不同（它虽然也有返回值，但跟输入值并不是对应的关系了）：

> The `splice()` method changes the contents of an array by removing existing elements and/or adding new elements. Return value: An array containing the deleted elements.

同理还有 `array.push` / `array.pop` 等。

**而 Moment.js 是如何设计的呢？**

这里有一个 issue，通过它，基本可以看出来 Moment 有哪些 API 是有问题的：[make moment mostly immutable #1754](https://github.com/moment/moment/issues/1754)

比如一个简单的 `add` 方法，对日期进行“加”操作（比如日期加一天）。那么它应该是这样的：

* 要么直接对输入进行“加”操作；
* 要么产生一份复制值，对复制进行“加”操作并返回。

但是，Moment 真正的做法是，直接对输入进行“加”操作，并且返回。这样就很让人头疼了。

更过分的就是上图的例子，名如 `startOf` / `endOf` 这样的方法，看起来像是 Immutable 操作，实际上却还是 Mutable 的。所以说，如果用户使用了 Moment，那么所有的原始输入值基本上都是无法得到任何保证。你根本不知道输入值在什么时候就被修改了。

值得欣慰的是，在 Moment 发展了三年以后的 2014 年，终于有人提出了上述问题，并且被维护者认可并加入版本计划中了。但是，三年之后又三年，如今已经到了 2018，问题依旧没有得到解决。在 ES 发展如此迅速的时代，一个基本上处于垄断地位的流行库，以及一个三年都没能解决的问题，不知道是否还有救？

不过也许它已经完成曲线救国了（推倒重来总是比较简单）：https://github.com/moment/luxon

> Features: Immutable, chainable, unambiguous API.

不可否认 Moment.js 确实帮助开发者解决了很多问题，节省了大量时间。但是有一个问题：一个质量如此的库，是如何做到流行，如何拿到 3w 个 stars 的呢？是不是包括我在内的这些开发者，从根本上就存在软件开发基础知识的不足呢。
