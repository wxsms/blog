---
title: “渐进增强”与“优雅降级”
date: 2016-03-25T09:35:10+00:00
tags: [css]
---

“渐进增强”与“优雅降级”是 Web 页面两种不同的开发理念，为了简单起见，先给出定义（By W3C）：

> Graceful degradation Providing an alternative version of your functionality or making the user aware of shortcomings of a product as a safety measure to ensure that the product is usable. Progressive enhancement Starting with a baseline of usable functionality, then increasing the richness of the user experience step by step by testing for support for enhancements before applying them.

翻译：“优雅降级”的目的是为你的功能模块提供一种替代方案，或者让用户意识到某种产品（浏览器）的缺陷来保证你的产品的可用性。“渐进增强”是在一个最基本的可用功能之上，通过在拓展功能前检测（浏览器的）支持性逐步地提升用户体验。

这两种方案看起来好像没有什么太大区别，并且最终的结果貌似也是一样的。但是看完后面更多的解释和示例，就会更明白一些，其实这里面是真的有区别的。

一些博文将其简单地归结为如下内容：

```css
.transition {   /*渐进增强写法*/
  -webkit-transition: all .5s;
     -moz-transition: all .5s;
       -o-transition: all .5s;
          transition: all .5s;  
} 
.transition {   /*优雅降级写法*/ 
          transition: all .5s;
       -o-transition: all .5s;
     -moz-transition: all .5s;
  -webkit-transition: all .5s;
}
```

这个解释是**完全错误的**。实际上任何情况下我们都应该使用前者的 CSS 写法。

<!-- more -->

## 在不断变化的环境中开发

稍微接触过 Web 开发的同学都能发现，我们目前所面对的最大难题不是如何实现强大的功能，而是如何保证即使是不那么强大的功能也能够被所有（退一步说，大多数）用户正常地使用。

> The web was invented and defined to be used with any display device, in any language, anywhere you want. The only thing expected of end users is that they are using a browsing device that can reach out to the web and understand the protocols used to transmit information — http, https, ftp and so on.

正是因为可以访问 Web 的设备、语言、环境等因素太多太复杂，在极大促进 Web 发展的同时，也导致了以上困境。我们开发者无法对用户所使用的设备有任何期待。因此，我们无法保证 Web 应用上的所有功能都能够正确运行。

我们需要在未知中寻找出路，这就是“渐进增强”与“优雅降级”出现的原因。

## 二者概览

上面有对二者有一个简单的定义，这里再作一些扩展。

**优雅降级：**

首先确保使用现代浏览器的用户能够获得最好的用户体验，然后为使用老旧浏览器的用户优雅降级。降级的结果可能会导致功能不再那么美好，但是，只要能够为用户保留住访问网站的最后一点价值就算是达到了目的。让他们至少能看到正常的页面。

**渐进增强：**

相似，但又不一样。首先为所有浏览器都提供一个能够正常渲染并工作的版本，然后为更高级的浏览器构建高级功能。

换句话说，“优雅降级”是从复杂的现状开始，尝试去修复一些问题；而“渐进增强”则从最基础入手，为更好的环境提供扩展。“渐进增强”可以让你的基础更加牢固，并且始终保持向前看的姿态。

## 一个例子

光说真的很难理解，我们来看个例子。（By W3C）

**“打印此页”链接**

有时候我们会想让用户可以点击一个链接或按钮以打印整个页面，于是拍脑袋就有了如下代码：

```html
<p id="printthis">
  <a href="javascript:window.print()">Print this page</a>
</p>
```

这段语句在启用 JavaScript 并且支持 `print` 方法的浏览器中非常完美。然而，悲催的是，万一浏览器禁用了 JavaScript，或者根本就不支持，那么点击它就完全没有任何反应了。这就造成了一个问题，作为站点开发者，你写出这个链接就相当于向用户保证了这项功能，然而并没有，用户会感到困惑、被欺骗，并且责怪你提供了如此差的用户体验。

为了减轻问题的严重程度，开发者通常会使用**优雅降级**的策略：

告诉用户这个链接可能会不起作用，或者提供替代方案。一般来说我们会使用 `noscript` 元素来达到目的，就像这样：

```html
<p id="printthis">
  <a href="javascript:window.print()">Print this page</a>
</p>
<noscript>
  <p class="scriptwarning">
    Printing the page requires JavaScript to be enabled. 
    Please turn it on in your browser.
  </p>
</noscript>
```

这就是优雅降级的一种体现 —— 我们告诉用户发生了错误并且如何去修复。但是，这有一个前提，用户必须是：

  * 知道什么是 JavaScript
  * 知道怎么启用它
  * 有权限去启用它
  * 愿意去启用它

下面这种方式可能会更好些：

```html
<p id="printthis">
  <a href="javascript:window.print()">Print this page</a>
</p>
<noscript>
  <p class="scriptwarning">
    Print a copy of your confirmation. 
    Select the "Print" icon in your browser,
    or select "Print" from the "File" menu.
  </p>
</noscript>
```

这样上面所说的问题就都解决了。然而它的前提是所有浏览器都提供了“打印”功能。并且，事实依然没有任何改变：我们提供了一些可能完全没用的功能，并且需要做出解释。实际上这个“打印此页”链接完全就是没有必要存在的。

如果我们换一种方式，使用“**渐进增强**”法，则步骤如下。

首先我们考虑是否有一种方式可以不用写脚本实现打印功能，事实上并没有，因此我们从一开始就不应该选择“链接”这种 HTML 元素来使用。如果一项功能依赖 JavaScript 来实现，那就应该用 button

第二步，告诉用户去打印这个页面，就这么简单：

```html
<p id="printthis">Thank you for your order. Please print this page for your records.</p>
```

注意，这无论在什么情况下都一定是适用的。接下来，我们使用“循序渐进”的 JavaScript 来给支持此功能的浏览器添加一个打印按钮：

```html
<p id="printthis">Thank you for your order. Please print this page for your records.</p>
<script type="text/javascript">
(function(){
  if(document.getElementById){
    var pt = document.getElementById('printthis');
    if(pt && typeof window.print === 'function'){
      var but = document.createElement('input');
      but.setAttribute('type','button');
      but.setAttribute('value','Print this now');
      but.onclick = function(){
        window.print();
      };
      pt.appendChild(but);
    }
  }
})();
</script>
```

注意到何为“循序渐进”了吗：

  * 使用自执行匿名函数包装法，不留下任何影响
  * 测试 DOM 方法的支持性，并且尝试获取节点
  * 测试节点是否存在，`window` 对象以及 `print` 方法是否存在
  * 如果全都没问题，我们就创建这个功能按钮
  * 把按钮添加到需要的位置上去

我们永远不给用户提供不能工作的 UI —— 只在它真正能工作时才显示出来。

## 适用场景

**优雅降级**适用场景：

  * 当你在改进一个旧项目但时间有限的时候
  * 当你没有足够的时间使用渐进增强法去完成项目的时候
  * 当你要做的产品比较特别，比如说对性能要求特别高的时候
  * 当你的项目必须要有一些基础功能的时候（地图，邮箱等）

其余的所有情况下，**渐进增强**都能让用户与你都更开心：

  * 不管环境如何，你的产品都能工作
  * 当新技术或浏览器发布的时候，你只需在原有基础上扩展功能，而无需修改最基础的解决方案
  * 技术可以更“用得其所”，而不仅仅是为了实现功能
  * 维护方便

## 总结

“渐进增强”与“优雅降级”最终都是为了实现一个目标：让所有用户都能够使用我们的产品。“渐进增强”方案看起来更优雅，但它需要更多的时间与资源去达成。“优雅降级”可以看成是现有产品的补丁：易于开发但难以维护。

注：本文大部分内容来自 <a href="https://www.w3.org/wiki/Graceful_degradation_versus_progressive_enhancement" target="_blank">W3C</a>
