---
id: angular-tutorial-static-template
title: Angular 教程：静态模版
date: 2015-12-23T17:52:43+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
为了更好地说明 Angular 是如何扩展标准 HTML 的，我们创建了一个纯静态的 HTML 页面，然后通过实践将它转换成 Angular 可以识别的动态模板，它们将表现出一样的数据集。 在这一步教程中你会给HTML页面添加两条手机设备的基本信息。

  * 页面现在包含一个关于两台手机的列表

最重要的改动如下所示。你可以在 [GitHub](https://github.com/angular/angular-phonecat/compare/step-0...step-1 "See diff on Github") 上查看它与之前的代码有何区别。

`app/index.html`：

```
<ul>
  <li>
    <span>Nexus S</span>
    <p>
      Fast just got faster with Nexus S.
    </p>
  </li>
  <li>
    <span>Motorola XOOM™ with Wi-Fi</span>
    <p>
      The Next, Next Generation tablet.
    </p>
  </li>
</ul>
```

## 课外扩展

尝试给静态页面`index.html`再加多点东西，比如：

```
<p>Total number of phones: 2</p>
```

## 总结

这节教程给应用添加了一个由静态 HTML 组成的列表。现在我们可以通过 [step 2](/p/angular-tutorial-angular-templates/) 来学习如何使用 Angular 来动态地生成同样的列表。
