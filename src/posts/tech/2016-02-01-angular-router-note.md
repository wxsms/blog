---
permalink: '/posts/2016-02-01-angular-router-note.html'
title: Angular Router 学习笔记
date: 2016-02-01T17:21:59+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - Router
  - SPA

---



使用Angular Router可以很方便地构建SPA应用，同时它支持深度链接，支持各种浏览器操作（前进、后退、收藏等），非常有趣。使用过类似模块就会觉得它要比传统的路由方式，比如服务端的Forward，Redirect以及一般的JavaScript Redirect等，好用得多。特别是用户体验这一块，上升了很大的档次。

就在不久前我还开发了一个使用iframe与jQuery的SPA项目，当时由于是老板提供的所有前端页面所以也没多想。现在学过了Angular Router真是有些不堪回首的感觉。

<!--more-->

## 传统路由方式

<div class="table-responsive">
  <table class="table table-bordered table-hover">
    <tr>
      <td>
      </td>
      <td>
         <strong>Server Forward</strong>
      </td>
      <td>
         <strong>Server Redirect</strong>
      </td>
      <td>
         <strong>Client Redirect</strong>
      </td>
    </tr>
    <tr>
      <td>
         <strong>Request(s) </strong>
      </td>
      <td>
         1
      </td>
      <td>
         <span style="color: #ff0000;">2</span>
      </td>
      <td>
         1
      </td>
    </tr>
    <tr>
      <td>
         <strong>Browser URL Change</strong>
      </td>
      <td>
         <span style="color: #ff0000;">NO</span>
      </td>
      <td>
         YES
      </td>
      <td>
         YES
      </td>
    </tr>
    <tr>
      <td>
         <strong>Page Refresh </strong>
      </td>
      <td>
         YES
      </td>
      <td>
         YES
      </td>
      <td>
         YES
      </td>
    </tr>
    <tr>
      <td>
         <strong>Maintainable</strong>
      </td>
      <td>
         YES
      </td>
      <td>
         YES
      </td>
      <td>
         <span style="color: #ff0000;">NO</span>
      </td>
    </tr>
    <tr>
      <td>
         <strong>Browser Actions</strong>
      </td>
      <td>
         <span style="color: #ff0000;">NO</span>
      </td>
      <td>
         YES
      </td>
      <td>
         YES
      </td>
    </tr>
  </table>
</div>

以上是一个简单的对比，从请求次数、显示URL是否变化、页面是否刷新、是否可维护、是否支持浏览器动作这5个方面进行，可以看到彼此都有一些遗憾。由于Server Forward以及Client Redirect的限制实在太大，很多情况下我们用到的都是Server Redirect，但是两次请求是硬伤。并且以上所有方式都需要强制刷新页面。Wordpress博客使用的就都是Redirect方式。

## 前端路由

Angular Router支持两种使用方式：

  * #锚点
  * HTML5 API

其实在我看来很多情况下第一种较为朴素的方式已经足够用了。以下是一个简单的Demo：



独立页面链接：<a href="http://wxsm.space/others/examples/angular-router/" target="_blank">http://wxsm.space/others/examples/angular-router/</a>

点击Edit/Delete/Add/Show几个链接，可以发现下面的内容发生了变化。同时地址栏的URL也相应地变了。也可以尝试前进、后退、收藏等操作（在独立页面进行）。 代码如下：

```
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8"/>
    <title>$routeProvide example</title>
</head>

<body>
<div ng-app="pathApp">

    Choose your option:
    <br/>
    <br/>
    <a href="#/Book/Edit">Edit</a> |
    <a href="#/Book/Delete">Delete</a> |
    <a href="#/Book/Add">Add</a> |
    <a href="#/Book/Show">Show</a>

    <div ng-view></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.0.7/angular.min.js"></script>
<script>
    angular.module('pathApp', [], function ($routeProvider, $locationProvider) {
        $routeProvider
                .when('/Book/Edit', {
                    template: '<div>Edit</div>',
                })
                .when('/Book/Delete', {
                    template: '<div>Delete</div>',
                })
                .when('/Book/Show', {
                    template: '<div>Show</div>',
                })
                .when('/Book/Add', {
                    template: '<div>Add</div>',
                })
                .otherwise({
                    redirectTo: '/Book'
                });
    });
</script>
</body>

</html>
```

这个Demo为了简便使用了直接的HTML字符串来作为一个页面的内容，我们在实际使用的时候可以把它换成一个实际页面的地址，这样在点击一个链接的时候Angular Router就会异步地加载相应的页面并且填充到相应的`ng-view`节点中去。整个过程无需全局刷新。由此带来的好处是非常多的。我们不需要重新加载和渲染一些固定的板块（比如通常情况下一个网站的Header和Footer部分都是不会发生变化的，当然如果需要变化Angular Router也能做到），同时也可以真正地给页面切换添加一些酷炫的动画（CSS或者JS）。并且由于加载一个新页面只需要从服务器读取它的HTML内容而不需要如JS/CSS等静态文件（这些都将会在页面第一次打开的时候加载完毕），因此速度将会非常快。

需要注意的是，这里使用的是比较旧的AngularJS版本。在新版本中，Angular Router从AngularJS的核心代码内分离了出来，成为了一个叫做ngRoute的独立模块。我们需要同时引入AngularJS和ngRoute模块来启用Angular Router路由器。

## 关于$routeProvider与$route

这个路由功能是由Angular的一个服务提供者（service provider）实现的，它的名字就叫做`$routeProvider` 。Angular服务是由服务工厂创建出来的一系列单例对象，而工厂则是由服务提供者来创建。服务提供者必须实现一个`$get`方法，它就是该服务的工厂方法了。 当我们使用AngularJS的依赖注入给控制器注入一个服务对象的时候，Angular会使用`$injector`来查找相应的注入器。一旦找到了，它就会调用相应`$get`方法来或取服务对象的实例。有时候服务提供者在实例化服务对象之前需要其调用者提供一些参数。

Angular路由功能是由`$routeProvider`声明的，同时它也是`$route`服务的提供者。
