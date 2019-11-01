---
id: javascript-event-delegation
title: JavaScript 事件代理
date: 2016-04-01T11:38:12+00:00
categories:
  - JavaScript

---



jQuery 曾经存在 3 种绑定事件的方法：bind / live / delegate，后来 live 被砍掉了，只留下 bind 与 delegate，它们之间的区别是，通过 bind 方法绑定的事件，只对当前存在的元素生效，而通过 delegate 则可以绑定“现在”以及“将来”的所有元素。

为“将来”元素绑定事件的适用场景还是挺多的。比如一个列表，或者一个表格，它可能会动态地被插入或者移除一些子元素，然后每个元素都需要有一个点击事件，这样的话我们就需要保证“现在”已存在的元素以及“将来”可能被添加进去的元素都能够正常工作。怎么办呢，我们总不能每插入一个元素就给它绑一次事件吧（事实上我以前没少干这事），因此 jQuery 就为我们提供了后者的方法。

一开始我觉得很奇怪，像 delegate 这样的方法是怎么实现的呢？通过监听 DOM 树变化吗？性能开销会不会特别大？后来知道了 JavaScript 有一种机制叫事件代理（event delegation），也就是本文要说的东西，才明白，原来一切都很简单。

<!--more-->

## 事件代理及其工作原理

何为代理呢，大概就是，你把你要做的事情告诉我，我帮你做，我就是你的代理。

那么事件代理，顾名思义，在一个元素上触发的事件，由另一个元素去处理，后者就是前者的事件代理。

大概就是这么回事。那么，如何实现呢？

这里就涉及两个关于 JavaScript 事件的知识：事件冒泡（event bubbling）以及目标元素（target element）：

  * 当一个元素上触发事件的时候，比如说鼠标点击了一个按钮，同样的事件将会在它的所有祖先元素上触发。这就是所谓的事件冒泡。
  * 所有事件的目标元素都将是最原始触发它的那个特定元素，就比如说那个按钮，其引用将被储存在事件对象内。

因此，我们可以做到：

  * 给一个节点绑定事件
  * 等待其子孙节点的冒泡事件
  * 判断事件实际来源
  * 做出相应处理

这就是事件代理的工作原理。

## 有什么用

一个典型的场景是，如果一个表格有 100 行 100 列，你需要给每一个单元格都添加点击事件，怎么办？

当然可以说一次性把它们全选出来，绑定事件不就完了。但是，内存 BOOM，浏览器 BOOM

用事件代理就简单多了，给 table 绑一次事件，然后等它们冒泡上来就行了。

还有就是动态添加的元素。比如某一时刻 table 被添加了一行，那么新的一行其事件同样能冒泡并且被 table 上的事件处理器接收到。

## 代码

Talk is cheap, show me the code.

```
//Some browser diff issue handler
function getEventTarget(e) {
  e = e || window.event;
  return e.target || e.srcElement;
}

//Easy event handler on 'table' element
function editCell(e) {
  var target = getEventTarget(e);
  if(target.tagName.toLowerCase() === 'td') {
    // DO SOMETHING WITH THE CELL
  }
}
```

&nbsp;
