---
title: '-webkit-overflow-scrolling'
date: 2019-07-25T02:01:20.712Z
tags: [css]
---

`-webkit-overflow-scrolling` CSS 属性可以让滚动元素在 ios 设备上获得接近原生的平滑滚动以及滚动回弹效果。

支持的值：

* `auto` 普通滚动行为，当手指离开屏幕时，滚动会立即停止（默认）
* `touch` 基于动量的滚动行为，当手指离开屏幕时，滚动会根据手势强度以相应的速度持续一段时间，同时会赋予滚动回弹的效果

<!-- more -->

一个例子：

```vue
<template>
  <section>
    <div class="scroll-touch">
      <p>
        This paragraph has momentum scrolling
      </p>
    </div>
    <div class="scroll-auto">
      <p>
        This paragraph does not.
      </p>
    </div>
  </section>
</template>

<style scoped>
  div {
    width: 100%;
    overflow: auto;
  }

  p {
    width: 200%;
    background: #f5f9fa;
    border: 2px solid #eaf2f4;
    padding: 10px;
  }

  .scroll-touch {
    -webkit-overflow-scrolling: touch; /* Lets it scroll lazy */
  }

  .scroll-auto {
    -webkit-overflow-scrolling: auto; /* Stops scrolling immediately */
  }
</style>
```

但是，这个属性在当容器内有 `position: fixed` 元素时会产生冲突，`fixed` 元素会在平滑滚动结束时才回到正确的位置，解决方案通常是重新整理组件树，使 `fixed` 元素不出现在滚动容器之内即可。

ref:

1. [https://stackoverflow.com/questions/29695082/mobile-web-webkit-overflow-scrolling-touch-conflicts-with-positionfixed](https://stackoverflow.com/questions/29695082/mobile-web-webkit-overflow-scrolling-touch-conflicts-with-positionfixed)
2. [https://stackoverflow.com/questions/25963491/position-fixed-and-webkit-overflow-touch-issue-ios-7](https://stackoverflow.com/questions/25963491/position-fixed-and-webkit-overflow-touch-issue-ios-7)
