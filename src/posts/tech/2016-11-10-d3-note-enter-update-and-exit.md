---
permalink: '/posts/2016-11-10-d3-note-enter-update-and-exit.html'
title: 'D3 Note - Enter, Update and Exit'
date: 2016-11-10T11:43:10+00:00
categories:
  - JavaScript
tags:
  - D3

---



在 D3 的使用过程中，我们见得最多的应当是类似如下的代码：

```
let div = d3.select('body')
  .selectAll('p')
  .data([3, 6, 9, 12, 15])
  .enter()
  .append('p')
  .text(d => d);
```

将得到：

```
<body>
<p>3</p>
<p>6</p>
<p>9</p>
<p>12</p>
<p>15</p>
</body>
```

光看代码完全不能理解 D3 到底做了些什么，其实这里关键是 `enter` 的使用。

<!--more-->

## Overall

`enter` 其实是一个选择集（selection），与其对应的还有 `update` 与 `exit`，选择集中的元素由原始选择集与绑定的数据决定。

![](https://user-images.githubusercontent.com/5960988/48595775-3ac02200-e991-11e8-8a46-6f8ede2f504d.png)

## selection.enter

> Returns the enter selection: placeholder nodes for each datum that had no corresponding DOM element in the selection. The enter selection is determined by selection.data, and is empty on a selection that is not joined to data.
> 
> The enter selection is typically used to create “missing” elements corresponding to new data.

简述就是，`enter` 会根据现有 selection 与绑定的数据量，自动“补齐”所缺失的元素。

比如，例子中，如果 `.selectAll('p')` 返回的 selection 中包含 3 个元素，那么因为 data 的长度为 5，`enter` 就会补齐缺失的 2 个元素，并返回包含这三个补齐元素的 selection，接下来的操作，就是针对这个 selection 进行的。

因此，在进行 `enter` 操作时，一般会事先把相关现有元素尽数清除，以免出现漏操作的情况。

至于再对 `enter` 选择集进行 `append` 操作时为什么会追加到 body 节点上去，这里就涉及到另一个概念：`selection.update`

## selection.update

理解了 `enter`，`update` 就很简单了，顾名思义，所指就是已有的，能够与绑定 data 一一对应上的元素的选择集。

因此，实际上并没有 `selection.update` 这个方法，因为没有必要，当前选到的就是 `update` 集了。

至于为什么例子中的 `enter` 集能够追加到 `body` 中去，根据 D3 文档：

> If the specified type is a string, appends a new element of this type (tag name) as the last child of each selected element, or the next following sibling in the update selection if this is an enter selection.

当进行 `selection.append` 操作时，如果 selection 是一个 `enter` 集，那么 `append` 就会向相应 `update` 集的末尾追加。那么，自然，如果 `update` 集为空，就会往父元素内追加。

## selection.exit

> Returns the exit selection: existing DOM elements in the selection for which no new datum was found.

对于已有 DOM 元素但没有 data 与之绑定的集合，使用 `selection.exit` 来获取。

如果集合没有绑定 data，则返回空集合。如果多次调用 `exit`，之后的 `exit` 会返回空集合。

通常，对于 `exit` 集的操作，都是 `remove`：

```
selection.exit().remove()
```

&nbsp;
