---
title: 'D3 Note - Interpolate'
date: 2016-12-05 14:17:00
tags: [d3]
---

`d3-interpolate` 是 D3 的核心模块之一，与比例尺有些类似，`interpolate` （插值）所做的也是一些数值映射的工作。区别是，`interpolate` 的定义域始终是 **0 ~ 1**，并且始终为线性的。所以，更多时候它用来与 D3 的一些其他模组集成使用（如 transition, scale 等）。

<!-- more -->

举个例子：

```js
let i = d3.interpolateNumber(10, 20); // 10 as a, and 20 as b
i(0.0); // 10
i(0.2); // 12
i(0.5); // 15
i(1.0); // 20
```

返回的函数 `i` 称作 `interpolator` （插值器）。给定值域 **a** 与 **b**，并且传入 **[0, 1]** 这个闭区间内的任意值，插值器将返回对应的结果。通常情况下，**a 对应参数 0，b 对应参数 1**

跟比例尺一样，插值器也可以接受其他类型的参数，如：

```js
d3.interpolateLab("steelblue", "brown")(0.5); // "rgb(142, 92, 109)"
```

甚至对象、数组：

```js
let i = d3.interpolate({colors: ["red", "blue"]}, {colors: ["white", "black"]});
i(0.0); // {colors: ["rgb(255, 0, 0)", "rgb(0, 0, 255)"]}
i(0.5); // {colors: ["rgb(255, 128, 128)", "rgb(0, 0, 128)"]}
i(1.0); // {colors: ["rgb(255, 255, 255)", "rgb(0, 0, 0)"]}
```

## d3.interpolate

`interpolate` 模块提供了很多子方法，然而，大多数情况下，直接调用这个就足够了。因为 D3 会根据传入的数据类型自动匹配子方法（注意：是基于参数 **b** 的数据类型）。

决定算法：

1. 如果 b 是 `null`, `undefined` 或 `boolean`，则函数返回的是常量 b
1. 如果 b 是数字，则使用 `interpolateNumber` 方法
1. 如果 b 是颜色或者可以转换为颜色的字符串，则使用 `interpolateRgb` 方法
1. 如果 b 是时间，则使用 `interpolateDate` 方法
1. 如果 b 是字符串，则使用 `interpolateString` 方法
1. 如果 b 是数组，则使用 `interpolateArray` 方法
1. 如果 b 可以强转为数字，则使用 `interpolateNumber` 方法
1. 使用 `interpolateObject` 方法
1. 基于 b 的类型，将 a 强转为相同类型

各个方法可以直接查看文档获取用法，大同小异。比较有趣的是 `interpolateString`，它可以检测字符串中的数字，并且做类似这样的事情：

> For example, if a is "300 12px sans-serif", and b is "500 36px Comic-Sans", two embedded numbers are found. The remaining static parts of the string are a space between the two numbers (" "), and the suffix ("px Comic-Sans"). The result of the interpolator at t = 0.5 is "400 24px Comic-Sans".

至于插值函数的用处，比较多，举一个例子：**d3-transition** 有一些平滑动画的实现函数需要用到插值，比如说地球的动画滚动效果：

```js
d3.transition()
  .duration(1000)
  .tween('rotate', () => {
    let r = d3.interpolate(projection.rotate(), [-geo[0], -geo[1]])
    return (t) => {
      rotateGlobeByAngle(r(t))
    }
  })
  .on('end', () => {
     // do something...        
  })
```
