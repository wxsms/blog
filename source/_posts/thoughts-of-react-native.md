---
title: 'Thoughts of ReactNative'
date: 2018-04-27T08:24:25.520Z
tags: [javascript,reactnative]
---

使用 ReactNative 开发半年有余，本文是作为一些简单的感想。

官网简介：

> Build native mobile apps using JavaScript and React.

简约，不简单。看着很牛逼，但实际用起来总是差了点意思。

总而言之：帮你节省时间的同时，隐藏着无处不在的坑。

<!-- more -->

## 关于框架本身

一个东西要辩证地看：ReactNative 的伟大之处在于它的定位，再一次验证了一句古老的预言：一切能用 JavaScript 实现的东西，终将被 JavaScript 实现。然而就目前的状态来看，还有许多问题。

使用 ReactNative 的目的是：让不会写原生 App 的人，通过 JavaScript 以及 React 也能编写出原生 App，并且跨 ios / Android 平台，乍一看相当美好。然而实际用过以后会发现，这其实是一个悖论，因为：

如果开发者真的完全对原生开发一窍不通，那么他根本不应该使用 ReactNative，因为他一旦遇到问题将完全没有任何解决能力，除了 Google -> Try -> Fail -> Google 直到成功（大部分时候也许是“看起来成功”）以外毫无办法。

使用一项技术的前提是，至少对其有所了解。而普通 JavaScript 用户使用 ReactNative，简直就像是在对着一个黑盒子编程，没有任何可靠性可言。这也是我在开发初期的真实情况：出 bug 了，不知道为什么，解决了，也不知道为什么。处于一种非常恐慌的状态。

也许你会说，[Electron](https://electronjs.org/) 不也是这种模式吗？那我为什么没有吐槽它呢？是的，他们俩“看起来”是一样的，但是实际上又完全不一样：

* Electron App 实际上是一个 Hybrid App，开发者写的 HTML 代码不需要经过任何处理，直接使用浏览器内核解析、显示，整个过程是透明的、可控的
* ReactNative App 是一个真正的 Native App，开发者写的任何组件都会先被转化为原生组件，然后才显示给用户，而这个转化过程是一个黑盒子，是不可控的

因此，理想与现实总是存在差距。ReactNative 开发者不能闭门造车，一定要不断地深入底层，才能真正明白自己“在干嘛”以及“该怎么干”。这也正是悖论所在：既然如此，我为什么不从一开始就使用原生方式编写 App 呢？当然，使用 ReactNative 还有另一个重要原因，即提供跨平台开发的可能性。但要知道，它在节省大量时间的同时，也给项目组带来了大量的限制和坑。

## 关于这个项目

ReactNative 毫无疑问是一个相当庞大的项目。

目前 ReactNative 还没有发布 1.0 版本，也就是说项目依旧在发展期。目前来说，我觉得**最大的一个问题是项目升级问题**。项目保持快速发展当然很棒，但是如何能够让现有的版本升级到最新版本呢？这对于实力不强的开发者来说几乎是不可能事件。

主要原因：

* MINOR version 会包含大量 breaking changes，无痛升级不存在的
* 也许要同时升级 React 版本
* 第三方库不一定兼容，尤其是涉及底层的

另一方面，**向 ReactNative 提 PR 可要比向其它 JavaScript 项目提 PR 门槛要高得多**：JavaScript / ios / Android 你至少得会其中两个才行。

我说这个不是为了别的。我在 issues 下面最常看到的一句话就是：

> Hi there! This issue is being closed because it has been inactive for a while. Maybe the issue has been fixed in a recent release, or perhaps it is not affecting a lot of people. Either way, we're automatically closing issues after a period of inactivity. Please do not take it personally!

可以说相当无情了。关闭一个 issue 的原因，可以是 `maybe`，可以是 `perhaps`，极少有 `resolved`，这就是现状。

我理解它是一个开源项目，开发者的时间有限，更没有义务。但这可以为使用者提供一些参考。ReactNative 存在超大量诸如此类的 issue，没有被 fix，更没有 fix 计划，有很大一部分其实是非常基础的诉求，比如图文混排，这在 Android 平台下已然是不可能事件。

因此，综上来说，如果你对 ios/ Android 并不精通，那你一旦遇到棘手的问题，只能祈祷：

* 还有更多、非常多的人遇到了跟你同样的问题
* 并且引发了激烈的讨论
* 并且成功地被开发者修复了
* 并且没有跨很多版本

否则还是歇着吧。

## 掉坑总结

正如上文所言，**ReactNative App 最主要的功能之一是 Layout 绘制，而它自带的黑盒子属性，也正是最大的坑之所在**。

简单来说，你写了一个控件，如果不经过测试的话：

1. 你不知道它是否能在 ios 下正常表现、工作
2. 你也不知道它是否能在 Android 下正常表现、工作
3. 你更不知道它是否能在两个平台之间保持一致

**总而言之，如果你不真的去试试，那你什么都不知道**。也许它在 ios 下完全正常，在 Android 就直接崩溃了。

ReactNative 提供了许多基础的跨平台组件，但是他们基本上都各有各的坑，更有组合坑。比如：

* `<Text>` 中不能有 `<View>` （Android 崩溃）
* `<Text>` 中不能有 `<Image>` （Android 显示异常）
* `<Image>` 不能同时使用 `borderRadius` 与 `backgroundColor` 样式 （Android 显示异常）
* `overflow` 样式在 Android 下无效，始终表现为 `hidden`
* 等等...

（冰山一角）

以上所说的“异常”，是无法通过适配得到解决的异常，也就是说你一定不能这么用。这些有的在文档里会标为“已知问题”，有的则没有，如果你是一个新手，那么处处都存在着惊喜等待你去发掘。

除此以外，还有一个显著问题就是，**在 ReactNative 的世界中，Debug 是不完全可靠的**。因为它在 Debug 时用的是开发电脑上的 chrome 附带的 JavaScript 引擎，而在真正运行时则使用手机内置浏览器的 JavaScript 引擎。虽然大部分时候你感觉不到差异，但是一旦出现了差异则往往是致命的。

## 更新

### 2020/10/05

> MINOR version 会包含大量 breaking changes，无痛升级不存在的

关于这一点，目前我理解了：因为 React Native 至今还是 0.x 版本，没有发布正式版。也就是说，不保证 minor 版本号能够兼容。

时隔两年，再回来看当年写的这篇文章，感觉写得还是挺对的。当然上面提到的一小部分问题，在今天的版本已经被修复了。不过总体的问题依然存在，在享受双端开发的快感同时，就必须要接受它带来的诸多问题和限制。
