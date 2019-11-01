---
id: css-triangle
title: CSS 绘制三角形
date: 2016-02-15T10:58:33+00:00
categories:
  - CSS
tags:
  - CSS3

---



关于如何使用CSS中的border属性绘制各式各样的三角形。下面有一个国外友人制作的动画，对其原理进行了直观的阐释，我简单地做了点翻译。

<iframe height="265" style="width: 100%;" scrolling="no" title="Animation to Explain CSS Triangles" src="//codepen.io/wxsm/embed/zrbGpx/?height=265&theme-id=0&default-tab=css,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/wxsm/pen/zrbGpx/'>Animation to Explain CSS Triangles</a> by wxsm
  (<a href='https://codepen.io/wxsm'>@wxsm</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

&nbsp;

要点：

  * 元素不能有宽高（当然也可以稍作变化来绘制梯形）
  * 只有一边border显示颜色，其宽度即为三角形的高
  * 与其相邻的border设置为透明色，它们将决定三角形的形状

<!--more-->

更多的例子：

```
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8"/>
    <title>CSS Triangle</title>
    <style>
        .arrow-up {
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 5px solid black;
        }

        .arrow-down {
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 20px solid #f00;
        }

        .arrow-right {
            width: 0;
            height: 0;
            border-top: 60px solid transparent;
            border-bottom: 60px solid transparent;
            border-left: 60px solid green;
        }

        .arrow-left {
            width: 0;
            height: 0;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 10px solid blue;
        }
    </style>
</head>
<body>
<div class="arrow-up"></div>
<div class="arrow-down"></div>
<div class="arrow-left"></div>
<div class="arrow-right"></div>
</body>
</html>
```

效果：



以上的例子都是使用实体元素来绘制三角形，其实实际情况下使用伪元素的（before，after）会更多一些。
