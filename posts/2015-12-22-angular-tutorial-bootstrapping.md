---
id: angular-tutorial-bootstrapping
title: Angular 教程：起步
date: 2015-12-22T09:10:52+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中，你将对本项目中最重要代码有所了解，以及学习如何启动使用 angular-seed 打包过的开发服务器，并且让应用程序在浏览器上跑起来。 在此之前，请确认你已经配置好了开发环境并且所有依赖包都已经安装好。参考[开发环境搭建教程](/p/angular-tutorial-phonecat-tutorial-app/)。

在`angular-phonecat`目录中执行以下命令：

```
git checkout -f step-0
```

这条命令会将工作空间重置到和这一步教程相关的状态下。 在这以后每开始一步新的教程你都需要将 step-number 中的数字替换成当前教程的序号，这会导致没有保存的修改丢失。 如果你还没有安装过项目中的依赖，可以执行以下命令：

```
npm install
```

为了让我们的应用程序在浏览器中跑起来，我们要打开一个独立的终端或者命令行，然后执行`npm start`命令来启动 Web 服务器。

现在可以用浏览器打开 <http://localhost:8000/app/> 看到一个简单的页面了。 如果你在切换 Branch 之前已经运行过了一次项目，无需重启服务器，刷新页面即可。

在浏览器中你可以看到一个简单的页面：&#8221;Nothing here yet!&#8221;。这句话是使用以下代码实现的。代码中包含了一些接下来的教程中会用到的 Angular 要素。

`app/index.html`：

```
<!doctype html>
<html lang="en" ng-app>
<head>
  <meta charset="utf-8">
  <title>My HTML File</title>
  <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
  <link rel="stylesheet" href="css/app.css">
  <script src="bower_components/angular/angular.js"></script>
</head>
<body>

  <p>Nothing here {{'yet' + '!'}}</p>

</body>
</html>
```

* * *

## 代码做了些什么？

### ngApp 指令（Directive）

```
<html ng-app>
```

<p class="lang:default highlight:0 decode:1 inline:1 ">
  <code>ng-app</code>属性代表了一个名字为<code>ngApp</code>的指令（Angular 使用小写带破折号的spinal-case来表示它的自定义属性，使用驼峰命名法camelCase来表示与属性一致并且是其实现的指令）。
</p>

我们把该指令标志在了 html 元素节点上，Angular 就会认为这就是应用程序的根节点。这给了开发者一定的自由度，我们可以选择使用 Angular 去驱动整个 HTML 页面，或者只是其中的一小部分。

### 引入 AngularJS 脚本

```
<script src="bower_components/angular/angular.js">
```

这段代码加载了`angular.js`脚本，脚本注册了一个会在浏览器加载完页面内容后触发的回调事件。当回调事件触发时，Angular 会在页面上查找`ngApp`指令，如果找到了，它就会随着定义了`ngApp`指令的 DOM 节点引导应用程序。

### 使用双花括号绑定表达式

```
Nothing here {{'yet' + '!'}}
```

这个简单的例子包含了 Angular 模版功能的两个核心特色：

  * 使用双花括号`{{ }}`作为“绑定”的标志
  * 在“绑定”之中使用简单的表达式`'yet' + '!'`

“绑定”会告诉 Angular 它应该计算花括号内表达式的值，然后替代“绑定”文本本身并且插入到 DOM 中去。

我们会在接下来的教程中发现，比起在学习 Angular 之前的一次性插入，绑定的表现内容将会随着表达式的值的变化而发生连续不断的改变。

Angular 表达式是由 Angular 在当前模型作用域（model scope）的上下文（context）中计算的，类似于一小片 JavaScript 的代码。区别于使用全局上下文（window）。 根据以上的逻辑，一旦模板被 Angular 解释，HTML 页面就会显示：&#8221;Nothing here yet!&#8221;

* * *

## 引导 AngularJS 应用

使用`ngApp`指令来自动引导 AngularJS 应用在大多数情况下都是简单实用的。在有较高需求的时候（比如说使用 script loaders 的情况下），可以使用[手动方法](https://docs.angularjs.org/guide/bootstrap)来引导。 在应用程序被引导的过程中会发生 3 件重要的事情：

  1. 为了使用依赖注入，创建了一个[注入器（injector）](https://docs.angularjs.org/api/auto/service/$injector)
  2. 注入器为应用创建[根作用域](https://docs.angularjs.org/api/ng/service/$rootScope)，它将成为应用模型的上下文
  3. Angular 开始从标志了`ngApp`的根节点编译DOM，处理途中发现的所有指令以及绑定

一旦应用程序被引导完成后，它将开始监听将要到来的，可能会改变模型（Model）的浏览器事件（比如鼠标点击，键盘点击或者收到的 HTTP 响应）。一旦有类似的事件发生，Angular 会检测它是否造成了 model 的改变，如果发现了改变，Angular 会通过更新所有受到影响的绑定来把它们反映到视图上。

现在我们的应用程序的结构非常简单。模板只包含了一条指令以及一个静态绑定，模型也是空的。在接下来的教程中就会发生变化。

![](http://7xjbxm.com1.z0.glb.clouddn.com/tutorial_00.png)

* * *

&nbsp;

## 关于项目中的一些文件来源

工作目录中大多数的文件来自于 [angular-seed](https://github.com/angular/angular-seed) 项目，该项目的目的是用来引导新的 Angular 项目。seed 预配置了通过 bower 安装 Angular 框架以及通过 npm 安装相关工具的一些代码。 为了适应本教程，我们对 seed 项目做了一些改动：

  * 去掉了样例应用
  * 往`app/img/phones/`中添加了一些设备的图片
  * 往`app/phones/`中添加了一些设备细节数据（JSON）
  * 往`bower.json`中添加了一项 [Bootstrap](http://getbootstrap.com/) 的依赖

## 课外扩展

尝试给`index.html`添加一些新的表达式，比如和数学有关的：

```
<p>1 + 2 = {{ 1 + 2 }}</p>
```

## 总结

现在我们可以开始[step 1](/p/angular-tutorial-static-template/)，给应用添加一些内容了。
