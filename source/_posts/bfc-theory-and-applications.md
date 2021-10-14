---
title: BFC 原理及应用
date: 2016-03-28T17:43:35+00:00
tags: [css]
---

## 什么是 BFC

BFC（Block formatting context）是 CSS 中的一个概念，先来看一下定义 （By MDN）：

> A **block formatting context** is a part of a visual CSS rendering of a Web page. It is the region in which the layout of block boxes occurs and in which floats interact with each other.

大意就是，BFC 是 Web 页面通过 CSS 渲染的一个块级（Block-level）区域，具有独立性。

BFC 对浮动元素的定位与清除都很重要：

  * 浮动元素的定位与清除规则只适用于同一 BFC 中的元素
  * 不同 BFC 中的浮动元素不会相互影响
  * 浮动元素的清除只适用于同一 BFC 中的元素

<!-- more -->

## 如何生成 BFC

一个元素要成为 BFC，必须具备以下特征之一：

  * 根元素，或者包含根元素的元素
  * 浮动元素（`float` 属性不为`none`）
  * 绝对定位元素（`position` 属性为 `absolute` 或 `fixed`）
  * 行内块级元素（`display` 属性为 `inline-block`）
  * 表格单元格或者标题（`display` 属性为 `table-cell` 或 `table-caption`）
  * 元素的 `overflow` 属性不为 `visible`
  * Flex 元素（`display` 属性为 `flex` 或 `inline-flex`）

## BFC 的应用

### 自适应双栏布局

之前一直困扰我的一个问题是，如何使用 CSS 实现一个双栏布局，其中一栏宽度固定，另一栏则自动根据父节点剩余宽度填满容器呢？

因为 CSS 2.x 是不支持计算的，所以不使用 `calc` 的话，还真的好像没什么办法的样子。

然而，通过使用 BFC 却可以很容易地达到效果。

先来看一个没有 BFC 的例子：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BFC Example</title>
    <style>
        .aside {
            width: 100px;
            height: 150px;
            float: left;
            background: #f66;
        }

        .main {
            height: 200px;
            background: #fcc;
        }
    </style>
</head>
<body>
<div class="aside"></div>
<div class="main"></div>
</body>
</html>
```

效果：

![](https://static.wxsm.space/blog/48595796-3f84d600-e991-11e8-8d0f-1834be558e41.jpg)

在这种情况下，二者共享了同一个 BFC，即 `body` 根元素，因此，右边元素的定位受到了浮动的影响。

我们给 `.main` 添加一个属性，让它成为独立的 BFC：

```css
.main {
    overflow: hidden;
}
```

效果：

![](https://static.wxsm.space/blog/48595797-3f84d600-e991-11e8-9fa6-61ba2b6a3514.jpg)

这就是一个自适应两栏布局了。主栏的宽度是随父节点而自动变化的。

### 清除内部浮动

写 CSS 代码的时候经常会遇到一个问题：如果一个元素内部全部是由浮动元素组成的话，那么它经常会没有高度，即“不能被撑开”。

我们可以通过在所有浮动元素的最后清除浮动来解决问题，但通过 BFC 的方式其实更简单。

只需要通过任意方式将浮动元素的容器转换为 BFC（比如添加 `overflow: hidden` 属性），即使不清除浮动，其依然能被正常“撑开”。

就像这样：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BFC Example</title>
    <style>
        body {
            width: 660px;
        }

        .parent {
            background: #fcc;
            overflow: hidden;
        }

        .child {
            border: 5px solid #f66;
            width: 200px;
            height: 200px;
            float: left;
        }
    </style>
</head>
<body>
<div class="parent">
    <div class="child"></div>
    <div class="child"></div>
</div>
</body>
</html>
```

效果：

![](https://static.wxsm.space/blog/48595798-3f84d600-e991-11e8-9663-c217a3190220.jpg)

### 清除 margin 重叠

场景：我们连续定义两个 `div`，并且都给予 `margin: 100px` 属性，实际上它们之间的距离也将是 100px 而非 200px，因为 margin 重叠了。

如果不想让 margin 出现这种重叠的情况，依然可以使用 BFC：给二者都各自套上一个 BFC 容器（或者其中之一），因为 BFC 的独立性，内部布局不会产生对外影响，外部也不会产生对内影响，所以二者的 margin 属性都能生效，最终就能得到 200px 的间距。

这个就不举实际例子了。
