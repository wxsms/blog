---

title: '高效 CSS 与 Reflow & Repaint'
date: 2016-03-30T14:16:25+00:00
categories:
  - CSS

---



## 高效 CSS

如何编写高效 CSS 其实是一个过时的话题。

这方面曾经存在许多真知灼见，比如说 CSS 选择器的解析方向是从子到父，比如说 ID 选择器是最快的，不应该给 Class 选择器加上 Tag 限制，尽量避免使用后代选择器等。但是，随着浏览器解析引擎的发展，这些都已经变得不再那么重要了。MDN 上阐述高效 CSS 的文章也已经被标记为过时。

Antti Koivisto 是 Webkit 核心的贡献者之一，他曾说：

> My view is that authors should not need to worry about optimizing selectors (and from what I see, they generally don’t), that should be the job of the engine.

因此，如果把“高效 CSS”的含义限制为“高效 CSS 选择器”的话，那么实际上现在它已经不是开发者需要关心的问题了。我们需要做的事情变得更“政治正确”：保证功能与结构的良好可维护性即可。

那么 CSS 的性能还能通过什么方式提升呢？这就是下面的内容。

<!-- more -->

## Reflow & Repaint

### 概览

Reflow （回流）和 Repaint（重绘）是浏览器的两种动作。

  * Repaint 会在某个元素的外观发生变化，但没有影响布局时触发。比如说 `visibility`  / `outline`  / `background-color`  等 CSS 属性的变化将会触发 Repaint
  * Reflow 在元素变化影响到布局时触发

显然，Reflow 的代价要比 Repaint 高昂得多，它影响到了页面部分（或者所有）的布局。一个 元素的 Reflow 动作同时也会触发它的所有后代 / 祖先 / 跟随它的 DOM 节点产生 Reflow

比如说：

```html
<body>
<div>
	<h4>Hello World</h4>
	<p><strong>Welcome: </strong>......</p>
	<h5>......</h5>
	<ol>
		<li>......</li>
		<li>......</li>
	</ol>
</div>
</body>
```

对这一小段 HTML 来说，如果 `<p>` 元素上产生了 Reflow，那么 `<strong>` 将会受到影响（因为它属于前者的后代元素），当然也跑不了 `<div>` 和 `<body>` （祖先元素），`<h5>` 和 `<ol>` 则躺枪：没事跟在别人后面干啥呢。

因此，大多数的 Reflow，其实都导致了整个页面重新渲染。这对于计算能力稍低的设备（如手机）来说是非常困难的。我经常发现桌面计算机上运行良好的动画效果到了手机上就看起来很痛苦。

### Reflow 的触发点

  * Window resizing
  * 改变字体
  * 增删样式表
  * 内容改变，比如用户在输入框中输入
  * 触发 CSS 伪类，比如 `:hover`  等
  * 更改 class 属性
  * 脚本操作 DOM
  * 计算 `offsetWidth` 与 `offsetHeight`
  * 更改 style 属性
  * &#8230;&#8230;

### 如何优化

恩。。。看了这么多发现，要完全避免 Reflow 还是比较困难的。那么我们至少可以有一些办法去减少它们的影响吧。

以下的方法都是收集于一些国外作者的博客。

#### 尽量选择 DOM 树底层的元素去修改 Class

比如说，不要选择类似 Wrapper 这样的元素去修改 Class，而尽量找更加底层的元素。因为 Reflow 会影响所有后代祖先以及后邻，这么干可以尽量地减少 Reflow 的影响，从而提高 CSS 渲染性能。

#### 避免设置多个内联样式

这里的意思其实是说不要使用 JS 来给元素按部就班地设置样式 —— 因为每一次样式变化都会引起一次 Reflow，最好把样式整合为一个 Class 然后一次性加到元素上面去。

还有另外一种解决办法是在设置样式前先将其脱离正常文档流，比如 `display` 属性设为 `none`，然后所有设置都完成后再变回来。这样也是可以接受的。

#### 如果要使用动画尽量选择 Position 为 Fixed 或 Absolute 的元素

动画的每一帧都会引起 Repaint 或者 Reflow，最好是可以让它脱离正常文档流，这样就绝对不会引起大规模持续的 Reflow

#### 不要选用 Table 布局

虽然我们已经有很多理由不去使用 table 布局了，但这又是另外一个 —— 任意一个单元格的小改动都很有可能触发整个布局所有节点的变化，带来巨大的性能开销。

&nbsp;
