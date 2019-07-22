---
id: d3-note-basis
title: 'D3 Note - Basis'
date: 2016-10-25T10:40:44+00:00
categories:
  - JavaScript
tags:
  - D3
---

# D3 Note - Basis

D3 (Data-Driven Documents) 是一个 JavaScript Library，用来做 Web 端的数据可视化实现以及各种绘图。

> **D3.js** is a JavaScript library for manipulating documents based on data. **D3** helps you bring data to life using HTML, SVG, and CSS.

学习 D3 需要很多预备知识：

  1. HTML / DOM
  2. CSS
  3. JavaScript (better with jQuery)
  4. SVG

HTML / CSS 不必多说，因为 D3 含有大量链式操作函数以及选择器等，因此如果有 jQuery 基础将轻松很多。此外，由于一般采用 SVG 方式进行绘图，所以 SVG 基础知识也需要掌握。

虽然必须的预备知识如此之多，但 D3 的定位其实是 Web 前端绘图的底层工具，所谓底层，即是操作复杂而功能强大者。

<!--more-->

## 关于 SVG

SVG (Scalable Vector Graphics) 是一种绘图标准，已经被绝大多数的现代浏览器所支持。SVG 采用 XML 语法定义图像，可直接嵌入 HTML 中使用。

SVG 的特点是矢量绘图（与 Canvas 不同），除了预设样式以外同时也支持 CSS 样式。

比如，画一个园圈，坐标为 (100, 50)，半径为 40px，拥有 2px 的黑色 border，以及红色填充：

```
<svg>
    <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red"/>
</svg>
```

SVG 有一些预定义的形状元素，可被开发者使用和操作：

  * 矩形 `<rect>`
  * 圆形 `<circle>`
  * 椭圆 `<ellipse>`
  * 线 `<line>`
  * 折线 `<polyline>`
  * 多边形 `<polygon>`
  * 路径 `<path>`

其中，`path` 是功能最强大者，使用 `path` 可以构成所有图形。

## 选择器

### 选择元素

D3 使用与 jQuery 类似的选择器来获取 HTML 元素。常用的方法有：

  * `d3.select(selector)`
  * `d3.selectAll(selector)`

（参数既可以传 selector 也可以直接传 HTML Element ）

顾名思义，`selectAll` 就是选择所有符合条件的元素了，那么 `select` 选择的是符合条件的第一个元素。如：

```
d3.select('body') //选择 body 元素

d3.selectAll('p') //选择所有 p 元素

d3.selectAll('.className') //选择所有 class 包含 className 的元素
```

更多就不说了。

### 操作选择

选择器返回的是一组**选择**（selection），这组**选择**可以进行一些操作，如：

  * 在此选择的基础上继续选择；
  * 改变属性；
  * 改变样式；
  * 绑定事件；
  * 插入、删除；
  * 绑定数据。

大多数操作都与 jQuery 十分类似，同时也支持链式操作，不再赘述。只是这个“绑定数据”操作稍有特别。

## 数据绑定

通过 D3 可以把数据“绑定”到 HTML 元素上，绑定的目的主要是为了方便一些需要相应数据才能进行的元素操作（如：更改元素大小、位置等）。

绑定数据有两个方法：

  * `datum`: 将一个数据绑定到选择上；
  * `data`: 将一个数组绑定到选择上，数组的各项分别与选择的各项一一对应。

下面引用一个例子来说明这二者的不同。假设有如下三个节点：

```
<p>Apple</p>
<p>Pear</p>
<p>Banana</p>
```

### datum

执行以下代码：

```
let str = 'datum';
let p = d3.selectAll('p');

p.datum(str);
p.text((d, i) => `Element ${i} bind with ${d}`);
```

将得到：

```
Element 0 bind with datum
Element 1 bind with datum
Element 2 bind with datum
```

在对选择进行操作时，传入的**值**可以是**值**，也可以是函数。当传入函数时，D3 会向函数注入两个参数，分别是 d (data) 与 i (index)，代表当前元素绑定的数据与其索引。

### data

执行以下代码：

```
let strArr = ['data0', 'data1', 'data2'];
let p = d3.selectAll('p');

p.data(strArr);
p.text((d, i) => `Element ${i} bind with ${d}`);
```

将得到：

```
Element 0 bind with data0
Element 1 bind with data1
Element 2 bind with data2
```

可以看到，数组中的 3 个项分别与 3 个 p 元素绑定到了一起。因此，可以将 `datum` 看作是 `data` 函数的一个特例，实际开发中使用更多的是 `data` 函数。

## 实践：简单柱状图

先定义一个 SVG 画布，并将它插入到 HTML 的 body 中去：

```
let width = 300,
  height = 300；

let svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);
```

在这里，画布的宽高都为 300 像素。

然后，定义一组数据：

```
let data = [250, 210, 170, 100, 190];
```

最后使用以上数据画出柱状图，柱子使用 SVG 预定义的 `rect` 元素：

```
let rectWidth = 25;

svg.selectAll('rect')
 .data(data)
 .enter()
 .append('rect')
 .attr('y', (d, i) => height - d)
 .attr('x', (d, i) => i * rectWidth)
 .attr('height', d => d)
 .attr('width', rectWidth - 2)
 .attr('fill', 'steelblue');
```

`rectWidth` 表示柱子的宽度，至于坐标、宽高则分别通过 x / y 以及 height / width 属性来控制，效果如下：

![](https://user-images.githubusercontent.com/5960988/48595801-401d6c80-e991-11e8-97c6-580489b7aeab.gif)

可以发现，这里并没有指定需要插入的 `rect` 个数，但 D3 却根据数据量自动地把图画出来了，这个工作是通过 `enter` 语句完成的。关于其工作原理，下回分解。
