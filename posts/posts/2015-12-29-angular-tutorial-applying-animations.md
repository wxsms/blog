---
id: angular-tutorial-applying-animations
title: Angular 教程：添加动画
date: 2015-12-29T16:00:39+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - Animation
---
在这最后一步中，我们将通过在模板代码中添加一些CSS以及JavaScript动画来让Web应用看起来更酷炫一点。

  * 我们通过使用`ngAnimate`模块来在应用程序中启用动画
  * 我们也会使用一些通用的`ng`指令来自动配置动画的切入时机
  * 在注册了动画效果后，标准的DOM操作将会触发相应的动画（比如说通过`ngRepeat`插入以及移除节点，或者在`ngClass`中添加或移除CSS类）

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-11...step-12 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 依赖

动画功能由Angular的`ngAnimate`模块提供，该模块没有包含在Angular的核心框架中。在此我们还使用了`jQuery`来做一些额外的JavaScript动画效果。 我们使用[Bower](http://bower.io/)来安装客户端的依赖。通过更新 `bower.json` 配置文件来加入新的依赖项：

```
{
  "name": "angular-seed",
  "description": "A starter project for AngularJS",
  "version": "0.0.0",
  "homepage": "https://github.com/angular/angular-seed",
  "license": "MIT",
  "private": true,
  "dependencies": {
    "angular": "1.4.x",
    "angular-mocks": "1.4.x",
    "jquery": "~2.1.1",
    "bootstrap": "~3.1.1",
    "angular-route": "1.4.x",
    "angular-resource": "1.4.x",
    "angular-animate": "1.4.x"
  }
}
```

  * `"angular-animate": "1.4.x"`告诉Bower需要安装1.4.x版本的angular-resource组件
  * `"jquery": "~2.1.1"`告诉Bower需要安装2.1.1版本的jQuery，需要注意的是这并不是一个Angular模块，它是标准的jQuery库。我们可以使用Bower来安装各种各样的第三方工具

我们使用Bower来下载以及安装这些组件，通过执行：

```
npm install
```

> 警告：如果在你上一次运行 npm install 之后Angular发布了新版本的话，在运行 install 的时候可能就会遇到问题（因为angular.js的版本发生了冲突）。解决方法是在执行 install 之前先删除bower_components 目录。

&nbsp;

> 注意：如果你已经全局安装了bower，你可以使用 install 指令。但在这个项目中我们有预设的 install 指令来完成相同的事

* * *

## ngAnimate的工作机制

如果想要了解关于AngularJS中动画的运行机制的话，可以先阅读[AngularJS动画指导](https://docs.angularjs.org/guide/animations)。

* * *

## 模板

我们需要在HTML模板代码中添加对`angular-animate.js`文件的依赖。`angular-animate.js`文件中定义了`ngAnimate`模块，它的作用是让应用能够注意到一些动画的存在。

`app/index.html`：

```
...
  <!-- for CSS Transitions and/or Keyframe Animations -->
  <link rel="stylesheet" href="css/animations.css">

  ...

  <!-- jQuery is used for JavaScript animations (include this before angular.js) -->
  <script src="bower_components/jquery/dist/jquery.js"></script>

  ...

  <!-- required module to enable animation support in AngularJS -->
  <script src="bower_components/angular-animate/angular-animate.js"></script>

  <!-- for JavaScript Animations -->
  <script src="js/animations.js"></script>

...
```

> **重要**：当使用Angular 1.4版本的时候必须确保同时使用的jQuery版本大于或等于2.1；官方不确保jQuery 1.x是被完全支持的。确保在加载所有的AngularJS脚本以前先加载jQuery，反之Angular将不会检测到jQuery的存在，动画效果也就会出现一些问题。

我们现在可以同时在CSS代码（`animations.css`）以及JavaScript代码（`animations.js`）中创建动画了。但在这之前，就像使用`ngResource`，我们先来创建一个依赖于`ngAnimate`的新模块。

* * *

## 模块与动画

`app/js/animations.js`：

```
angular.module('phonecatAnimations', ['ngAnimate']);
// ...
// this module will later be used to define animations
// ...

```

然后我们把它附加到应用中去。

`app/js/app.js`：

```
// ...
angular.module('phonecatApp', [
  'ngRoute',

  'phonecatAnimations',
  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices',
]);
// ...
```

现在应用可以检测动画了。我们来做些动画吧！

* * *

## 带有CSS动画的ngRepeat

我们先来给`phone-list.html`页面中的`ngRepeat`指令加点CSS动画。首先我们给循环体添加一些额外的CSS类，然后我们就可以把它和我们定义的CSS动画挂上钩了。

`app/partials/phone-list.html`：

```
<!--
  Let's change the repeater HTML to include a new CSS class
  which we will later use for animations:
-->
<ul class="phones">
  <li ng-repeat="phone in phones | filter:query | orderBy:orderProp"
      class="thumbnail phone-listing">
    <a href="#/phones/{{phone.id}}" class="thumb"><img ng-src="{{phone.imageUrl}}"></a>
    <a href="#/phones/{{phone.id}}">{{phone.name}}</a>
    <p>{{phone.snippet}}</p>
  </li>
</ul>
```

看到我们是怎么给它加上`phone-listing`CSS类的了吗？在HTML中写这么点代码就完全足够了。 接下来是真正的CSS Transition动画代码。

`app/css/animations.css`：

```
.phone-listing.ng-enter,
.phone-listing.ng-leave,
.phone-listing.ng-move {
  -webkit-transition: 0.5s linear all;
  -moz-transition: 0.5s linear all;
  -o-transition: 0.5s linear all;
  transition: 0.5s linear all;
}

.phone-listing.ng-enter,
.phone-listing.ng-move {
  opacity: 0;
  height: 0;
  overflow: hidden;
}

.phone-listing.ng-move.ng-move-active,
.phone-listing.ng-enter.ng-enter-active {
  opacity: 1;
  height: 120px;
}

.phone-listing.ng-leave {
  opacity: 1;
  overflow: hidden;
}

.phone-listing.ng-leave.ng-leave-active {
  opacity: 0;
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
```

如你所见，`phone-listing`CSS类用来与一些动画钩子结合使用了。钩子会在动画事件发生时被添加或者删除。

  * `ng-enter`类会在新元素添加到列表并且渲染到页面中时触发
  * `ng-move`类会在元素在列表中移动时触发
  * `ng-leave`类会在元素从列表中移除时触发

手机列表中的元素会根据传入`ng-repeat`指令中的数据被添加或者移除。举例说，如果过滤器的值发生了变化，那么这些元素会在列表中动画式的出场或退场。 在这里，重点是要注意到当动画发生时，两组CSS类会被添加到元素上：

  1. `starting`类意味着动画开始时的样式
  2. `active`类意味着动画结束时的样式

starting样式的类名由`ng-`前缀和当时触发的事件名（比如`enter`，`move`或者`leave`）组成，所以`enter`事件会与`ng-enter`类挂钩。 active样式的类名与starting类一模一样，除了`-active`后缀。这两种CSS命名转换允许开发者构建完整的，从开始到结束的所有动画。

在上面的例子中，当元素被添加进列表时，它们的高度会从****变成**120**个像素，并且在被移除之前会重新变回****像素。同时它们还有一个不错的淡出淡入效果。所有这些都是由以上的CSS Transition声明来控制的。 虽然绝大多数主流浏览器对CSS Transition和CSS动画都有着不错的支持，但请不要忘记IE爸爸，如果你想要让动画效果可以支持到更老旧一些的浏览器的话，可以考虑使用基于JavaScript的动画，我们会在下面的内容中介绍。

* * *

## 带有CSS Keyframe动画的ngView

接下来我们给`ngView`在路由转换的时候添加一个动画。 在开始之前，我们给HTML添加一个新的CSS类，就跟刚才所做的一样。这一次我们把它添加到包含`ng-view`指令的元素中去。为了做到这些，我们对HTML代码做了少许改动，这样我们在视图转换的时候可以有更多的控制权。

`app/index.html`：

```
<div class="view-container">
  <div ng-view class="view-frame"></div>
</div>
```

通过这个改动，`ng-view`指令将被包含在一个拥有`view-container`CSS类的父节点中。这个CSS类给节点添加了一个`position: relative`类，因此在动画效果执行时`ng-view`的位置是通过这个父节点计算得出的。 做完这些工作后，我们就可以给它添加一些CSS动画了。

`app/css/animations.css`：

```
.view-container {
  position: relative;
}

.view-frame.ng-enter, .view-frame.ng-leave {
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.view-frame.ng-enter {
  -webkit-animation: 0.5s fade-in;
  -moz-animation: 0.5s fade-in;
  -o-animation: 0.5s fade-in;
  animation: 0.5s fade-in;
  z-index: 100;
}

.view-frame.ng-leave {
  -webkit-animation: 0.5s fade-out;
  -moz-animation: 0.5s fade-out;
  -o-animation: 0.5s fade-out;
  animation: 0.5s fade-out;
  z-index:99;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@-moz-keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@-webkit-keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@-moz-keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@-webkit-keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* don't forget about the vendor-prefixes! */
```

这些代码中除了页面切换时的淡出淡入效果以外没什么丧心病狂的东西。唯一特别的事情是我们使用了绝对定位来对新页面（由`ng-enter`
  
标记）与旧页面（由`ng-leave`
  
标记）在交叉动画的过程中进行定位。因此当旧页面即将被移除的时候，在它淡出的同时新页面也将同时在与其相同的顶端位置上淡入。 一旦leave动画结束元素就会被移除，同理一旦enter动画结束`ng-enter`以及`ng-enter-active`CSS类也会从元素中被移除，然后它就会由其本身的CSS代码来重新渲染和定位（所以一旦动画结束就不存在有失优雅的绝对定位了）。在路由变化的整个过程中这些都会是非常流畅的，页面将表现得非常自然而不是各种闪现。 添加的CSS代码（start和end类）与给`ng-repeat`添加的代码非常相似。每次新页面加载完成的时候`ng-view`都会创建一个自身的副本，下载模板然后追加内容。这么做可以保证所有的视图都包含在一个HTML元素中，于是动画就会变得更容易控制。

更多的CSS动画请参考[文档](http://docs.webplatform.org/wiki/css/properties/animations)。

* * *

## 带JavaScript动画的ngClass

我们来给应用添加另一种动画。打开`phone-detail.html`页面，我们已经完成了一个不错的图片切换功能。通过点击缩略图我们可以改变显示在详细页面上的大图。但我们要怎么给它加点动画呢？

首先我们先来思考一下。从根本而言，当点击略缩图时，我们是通过改变大图的状态来反应这一次点击的。在HTML世界中最好的反应状态的方法就是使用CSS类。就像我们之前所做的通过CSS类来定义动画，这次动画将在CSS类本身发生变化时启动。 无论选中的缩略图在何时发生变化都将导致状态的变化，同时我们将给大图添加一个`.active`CSS类来执行动画效果。 我们先来处理`phone-detail.html`页面。需要注意的是显示大图的方式已经发生了变化。

`app/partials/phone-detail.html`：

```
<!-- We're only changing the top of the file -->
<div class="phone-images">
  <img ng-src="{{img}}"
       class="phone"
       ng-repeat="img in phone.images"
       ng-class="{active:mainImageUrl==img}">
</div>

<h1>{{phone.name}}</h1>

<p>{{phone.description}}</p>

<ul class="phone-thumbs">
  <li ng-repeat="img in phone.images">
    <img ng-src="{{img}}" ng-mouseenter="setImage(img)">
  </li>
</ul>
```

就像略所图一样，我们使用一个循环器来显示了**所有**大图，但我们并不会给它添加任何与循环有关的动画。不同的是我们使用`ng-class`指令来做了一个判断，当且仅当`active`类为真时它才会被添加到元素上去，然后元素会显示为可见。除此以外它们就将处于隐藏的状态。对于我们目前的情况来说，总会有一张图片是拥有`active`
  
类的，因此任何时候都会有仅有一张图片在视图上是可见的。 当`active`类被添加到元素上的时候，`active-add`和`active-add-active`类会在此之前被AngularJS触发。同理当移除类时，`active-remove`和`active-remove-active`类也会在恰当的时机被添加到元素上去。 为了保证手机图片在页面一开始加载的时候能够正确地显示，我们给详细页添加了一些CSS样式。

`app/css/app.css`：

```
.phone-images {
  background-color: white;
  width: 450px;
  height: 450px;
  overflow: hidden;
  position: relative;
  float: left;
}

...

img.phone {
  float: left;
  margin-right: 3em;
  margin-bottom: 2em;
  background-color: white;
  padding: 2em;
  height: 400px;
  width: 400px;
  display: none;
}

img.phone:first-child {
  display: block;
  }
```

你可能会觉得我们要做的不过是创建另一个CSS动画。虽然确实可以这么做，但既然有这么个机会我们就可以学习如何使用JavaScript来编写动画。

`app/js/animations.js`：

```
var phonecatAnimations = angular.module('phonecatAnimations', ['ngAnimate']);

phonecatAnimations.animation('.phone', function() {

  var animateUp = function(element, className, done) {
    if(className != 'active') {
      return;
    }
    element.css({
      position: 'absolute',
      top: 500,
      left: 0,
      display: 'block'
    });

    jQuery(element).animate({
      top: 0
    }, done);

    return function(cancel) {
      if(cancel) {
        element.stop();
      }
    };
  }

  var animateDown = function(element, className, done) {
    if(className != 'active') {
      return;
    }
    element.css({
      position: 'absolute',
      left: 0,
      top: 0
    });

    jQuery(element).animate({
      top: -500
    }, done);

    return function(cancel) {
      if(cancel) {
        element.stop();
      }
    };
  }

  return {
    addClass: animateUp,
    removeClass: animateDown
  };
});
```

注意到我们使用了[jQuery](http://jquery.com/)来实现动画效果。Angular并不需要jQuery来完成JavaScript动画，但我们还是用了它，因为如何编写一个JavaScript动画库并不在本教程的范围之内。更多关于`jQuery.animate`的信息请查看[jQuery文档](http://api.jquery.com/animate/)。

`addClass`和`removeClass`回调函数会在元素添加或者移除所注册的CSS类（`.phone`）的时候被调用。当`.active`类被添加到元素上（通过`ng-class`指令）的时候，`addClass`JavaScript回调就会在被当作参数而传入到其中的元素（element上执行。最后一个传入的参数是`done`回调函数。`done`函数的目的是可以通过调用它让Angular知道这次JavaScript动画已经执行完了。`removeClass`回调除了触发的时机不同以外，工作方式和上面一模一样。

在JavaScript回调内，我们通过操作DOM来创建动画。在上面的代码中我们使用了`element.css()`和`element.animate()`来操作DOM，回调函数把新元素放在了距离原位置**500**个像素的地方，然后把旧元素和新元素同时地向上移动**500**个像素。因此这个动画看起来就跟传送带一样。当`animate`函数完成所有事情以后，它就会调用`done`方法。 需要注意的是`addClass`和`removeClass`都返回了一个函数。这个**可选**函数将在动画被取消（另一个动画发生在同一元素上）时触发，当然也包括动画自然完成的情况。函数将被传入一个布尔类型的参数，开发者可以根据它来判断动画是否被取消了。这个函数可以用来给动画做一些收尾工作。

## 总结

就这样了！我们在超短的时间内构建了一个Web应用。你可以继续在代码中进行深入的探索，并且使用`git checkout`随时退回到之前步骤的状态下。
