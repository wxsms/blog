---
id: d3-note-scale
title: 'D3 Note - Scale'
date: 2016-11-22 09:00:00
categories:
  - JavaScript
tags:
  - D3
---

之前做的柱状图例子：

```js
let data = [250, 210, 170, 100, 190]

let rectWidth = 25

svg.selectAll('rect')
 .data(data)
 .enter()
 .append('rect')
 .attr('y', (d, i) => height - d)
 .attr('x', (d, i) => i * rectWidth)
 .attr('height', d => d)
 .attr('width', rectWidth - 2)
 .attr('fill', 'steelblue')
```

有一个严重的问题，就是没有比例尺的概念，柱状图的高度完全由数据转换成像素值来模拟。这明显是不科学的：如果数据的值过小或过大，作出来的图就会很奇怪，同时也无法做到非线性的映射。

就跟地图需要比例尺一样，绝大多数的数据图表也需要比例尺。

> Scales are a convenient abstraction for a fundamental task in visualization: mapping a dimension of abstract data to a visual representation.

**比例尺 - Scale - “将某个维度的抽象数据做可视化映射”**

至于可视化映射的具体实现，`d3-scale` 模块提供了许多方案，大致可以分为两类：

* Continuous Scales（连续映射）
* Ordinal Scales（散点映射）

<!--more-->

## Continuous Scales

Continuous Scales（连续映射）将连续的、定量的 **Input Domain**（定义域）映射为一个连续的 **Output Range**（值域）。如果 Range 也是一个数值范围，那么映射操作可以被反转（即从值域到定义域）。

连续值映射是一个抽象的概念，不能直接构造。因此，`d3-scale` 提供了一些具体实现，如线性、次方、对数等。

一个简单的例子：

```js
let x = d3.scaleLinear()
    .domain([10, 130])
    .range([0, 960]);

x(20); // 80
x(50); // 320
```

这里构造了一个 `scaleLinear` （线性比例尺），并设置了输入及输出范围。构造器将会返回一个函数，这个函数接受输入值，并且返回对应的输出值。

如果输入值超出了预定义的范围，那么自然而然地，函数返回的输出值也会超出范围。但是，D3 提供了一个选项 `clamp`, 可以将输出范围保持在定义值内：

```js
x.clamp(true);
x(-10); // 0, clamped to range
```

Output Domain 除了可以为数字，也可以是其它东西。比如颜色：

```js
let color = d3.scaleLinear()
    .domain([10, 100])
    .range(["brown", "steelblue"]);

color(20); // "#9a3439"
color(50); // "#7b5167"
```

同时，Continuous Scales 也支持**插值**（interpolate）操作，这是 D3 的另一个模块。

### Linear Scales

**线性比例尺**，顾名思义，输出值对于输入值而言是线性变化的。

> y = ax + b

### Power Scales

**次方比例尺**，与 Linear Scales 类似，但是需要多加一个参数：`exponent` （次方）

> y = mx^k + b

```js
pow.exponent([exponent]) // default 1
```

在需要做次方根的时候，使 `exponent = 0.x` 就可以了，对于 0.5 这个特值，D3 还提供了快捷方式：`d3.scaleSqrt()`，这将直接构造 `exponent = 0.5` 的 Power Scale

### Log Scales

**对数比例尺**，与 Power Scales 类似，参数变为 `base` （底数）

> y = m log(x) + b

因为 log(0) = -∞，Log Scales 的 Input Domain 不能够跨越 0，即要么全为正，要么全为负

### Identity Scales

**全等比例尺**，特殊的线性比例尺。定义域与值域完全相等。因此，它的 `invert` 方法也就是它本身。

> y = x

### Time Scales

**时间比例尺**，线性比例尺的变体。例子：

```js
let x = d3.scaleTime()
    .domain([new Date(2000, 0, 1), new Date(2000, 0, 2)])
    .range([0, 960]);

x(new Date(2000, 0, 1,  5)); // 200
x(new Date(2000, 0, 1, 16)); // 640
x.invert(200); // Sat Jan 01 2000 05:00:00 GMT-0800 (PST)
x.invert(640); // Sat Jan 01 2000 16:00:00 GMT-0800 (PST)
```

## Sequential Scales

**Sequential Scales** 与 **Continuous Scales** 类似，区别是，这个比例尺的值域是由 `interpolator` 决定的，不可控制。同时，`invert`, `range`, `rangeRound` 以及 `interpolate` 都不可用。

D3 提供了一系列的颜色插值器，因此其应用场景多与连续的颜色值域有关。

## Quantize Scales

**Quantize Scales** 与 **Linear Scales** 类似，区别是，其值域是离散的。定义域将基于值域元素的个数被切割为**相等的线段**，输出值为线段到值域的**一对一映射**。

> y = m round(x) + b

例子：

```js
let color = d3.scaleQuantize()
    .domain([0, 1])
    .range(["brown", "steelblue"]);

color(0.49); // "brown"
color(0.51); // "steelblue"
```

## Quantile Scales

**Quantile scales** 与 **Quantize Scales** 类似，区别是，其值域是“离散连续的”，即“**离散的连续片段**”。

首先，构造器会对定义域进行排序操作，然后根据值域元素的个数切分为**相等的片段**。如果无法等分，多余的元素将被加入到最后一组。

如：

```js
let quantile = d3.scaleQuantile()
  .domain([1, 1, 2, 3, 2, 3, 16])
  .range(['blue', 'white', 'red']);

quantile(3)   // will output "red"
quantile(16)  // will output "red"
```

解析：

其定义域将先被排序，而后被切分为 3 个片段：`[1, 1], [2, 2], [3, 3, 16]`

此时，如果执行 `quantile.quantiles()`，将得到一个数组 `[2, 3]`，长度为值域长度减一。假设将其赋值为 `quantiles`，其含义为：

* 定义域中小于 `quantiles[0]` 的值的，将被划分到第一个片段
* 大于等于数组元素 `quantiles[0]` 的值但是小于数组元素 `quantiles[1]` 的值的，将被划分到第二个片段
* 以此类推

划分线段后，定义域就与值域成为一一对应的关系了。因此就有了以上结果。

## Threshold Scales

**Threshold scales** 与 **Quantile Scales** 类似，区别是，我们将往 `domain` 中 直接传入与前者类似的 `quantiles`，也就是说，真正的定义域不做限制，限制的是它**划分片段的方式**。

例子：

```js
let color = d3.scaleThreshold()
    .domain([0, 1])
    .range(["red", "white", "green"]);

color(-1);   // "red"
color(0);    // "white"
color(0.5);  // "white"
color(1);    // "green"
color(1000); // "green"
```

## Ordinal Scales

**Ordinal Scales**（散点映射）

与连续映射不同，散点映射接受**离散的定义域与值域**。比如在一个博客中把不同的标签映射到一组颜色上去等。如果值域的元素量比定义域少，那么值域会“重复使用”。如：

```js
let ordinal = d3.scaleOrdinal()
  .domain(["apple", "orange", "banana", "grapefruit"])
  .range([0, 100]);

ordinal("apple"); // 0
ordinal("orange"); // 100
ordinal("banana"); // 0
ordinal("grapefruit"); // 100
```

### Band Scales

**Band Scales** 与 **Ordinal Scales** 类似，区别是，其**值域是连续的数值**。例子：

```js
let band = d3.scaleBand()
  .domain(["apple", "orange", "banana", "grapefruit"])
  .range([0, 100]);

band("apple"); // 0
band("orange"); // 25
band("banana"); // 50
band("grapefruit"); // 75
```

Band Scales 提供了一些实用方法，用于控制映射的结果。比如获取 Band Width，强制转换整数，添加 Padding 等。

### Point Scales

**Point Scales** 是 **Band Scales** 的特例，它的 **Band Width 始终为 0**

```js
let point = d3.scalePoint()
  .domain(["apple", "orange", "banana", "grapefruit"])
  .range([0, 100]);

point("apple"); // 0
point("orange"); // 33.333333333333336
point("banana"); // 66.66666666666667
point("grapefruit"); // 100
```
