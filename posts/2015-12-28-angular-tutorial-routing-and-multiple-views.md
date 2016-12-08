---
id: angular-tutorial-routing-and-multiple-views
title: Angular 教程：多页面与路由
date: 2015-12-28T20:26:38+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - Router
---
在这一步中，你将学习如何使用布局模版以及通过Angular的`ngRoute`模块来给应用添加路由功能。

  * 当你现在访问`app/index.html`的时候页面被重定向到了`app/index.html/#/phones`，并且手机列表将在此展示
  * 当你点击其中一条手机链接的时候，浏览器将显示一个手机详细信息页面，同时URL相应地更新

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-6...step-7 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 依赖

这一步中添加的路由功能是由Angular的`ngRoute`模块提供的，该模块没有包含在Angular框架的核心内容中。 我们使用[Bower](http://bower.io/)来安装客户端依赖。更新`bower.json`配置文件来包含新的依赖：

```
{
  "name": "angular-phonecat",
  "description": "A starter project for AngularJS",
  "version": "0.0.0",
  "homepage": "https://github.com/angular/angular-phonecat",
  "license": "MIT",
  "private": true,
  "dependencies": {
    "angular": "1.4.x",
    "angular-mocks": "1.4.x",
    "jquery": "~2.1.1",
    "bootstrap": "~3.1.1",
    "angular-route": "1.4.x"
  }
}
```

新的依赖项`"angular-route": "1.4.x"`会告诉Bower去安装1.4.x版本的angular-route组件。我们必须使用Bower来下载以及安装该组件。 如果你已经全局安装了bower，你可以使用`bower install`指令。但在这个项目中我们有预设的指令来完成相同的事情：

```
npm install
```

* * *

## 多视图，路由以及布局模板

我们的应用慢慢地成长并开始变得复杂起来了。在这一步之前，应用提供给用户的只有一个视图（所有手机的列表），并且所有模板代码都在`index.html`文件中。现在我们将要给应用添加一个显示列表中手机细节的视图。

为了添加细节视图，我们可以扩展`index.html`视图以包含新的模板代码，但这么做的话项目很快就会变得异常糟糕。所以我们将要做的是把`index.html`变成一个“布局模版”。这个模板可以理解为应用程序中所有其它模板的母版，至于其它的“局部模板”则将根据当前的“路由”（当前展示给用户的视图）选择性地加载到母版中来。

Angular的应用路由是由[$routeProvider](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider)声明的，它是[$route](https://docs.angularjs.org/api/ngRoute/service/$route)服务的提供者。这个服务的目的是让控制器，视图模版以及当前浏览器URL地址之间的连接变得更简单一些。我们可以使用这个功能来实现[深度链接](http://en.wikipedia.org/wiki/Deep_linking)，从而允许用户使用浏览器的前进后退以及书签等功能。

## 依赖注入，注入器和提供者

正如我们所知，依赖注入（DI）是AngularJS的核心，所以对其工作原理稍加理解是很有必要的。 在应用程序被引导的时候，Angular会创建一个注入器，它会寻找并且注入所有被应用程序所需求的服务。注入器本身完全不知道诸如`$http`或者`$route`的服务具体做了些什么。实际上，在被正确配置之前，注入器甚至不知道这些服务是否存在。 注入器只是按部就班地做了以下事情：

  * 读取应用所声明的模块
  * 注册所有在模块声明中定义的提供者（Provider）
  * 当需要的时候，给模块注入指定的函数以及任何需要的依赖（服务），它们将被提供者懒加载

提供者是一个提供（创建）服务实例并且暴露配置接口以控制服务的创建过程与实际行为的对象。对于`$route`服务而言，`$routeProvider`暴露的API允许你为自己的应用定义路由。

> 注意：提供者只能够注入到`config`函数内。因此你不能给`PhoneListCtrl`注入`$routeProvider`

Angular模块通过移除应用的全局状态以及提供配置注入器的方法来解决以上问题。与AMD或者require.js截然相反的是，Angular模块并没有尝试去解决脚本加载顺序以及脚本懒加载的问题。这些目标都是完全独立的，同时所有的模块系统都能共存并且实现它们的目标。 查看[理解依赖注入](https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection)来深入了解Angular的DI系统。

* * *

## 模板

`$route`服务通常结合[ngView](https://docs.angularjs.org/api/ngRoute/directive/ngView)指令使用。`ngView`指令的作用是根据当前路由将视图模版加载到布局模板中去。

> 注意：从Angular 1.2版本开始，`ngRoute`作为一个独立的模块，必须要额外加载`angular-route.js`文件，我们刚才已经通过Bower下载了它

`app/index.html`：

```
<!doctype html>
<html lang="en" ng-app="phonecatApp">
<head>
...
  <script src="bower_components/angular/angular.js"></script>
  <script src="bower_components/angular-route/angular-route.js"></script>
  <script src="js/app.js"></script>
  <script src="js/controllers.js"></script>
</head>
<body>

  <div ng-view></div>

</body>
</html>
```

我们给index模板添加了两个`<script>`标签来为应用程序加载JavaScript文件：

  * `angular-route.js`：定义了Angular的`ngRoute`模块，它将给我们提供路由功能
  * `app.js`：这个文件现在将担任应用的路由模块

需要注意的是我们把之前`index.html`模板中的大部分代码都移除了，取而代之的只有一个带有`ng-view`标签的div元素。移除的代码被移动到了`phone-list.html`模板中去：

`app/partials/phone-list.html`：

```
<div class="container-fluid">
  <div class="row">
    <div class="col-md-2">
      <!--Sidebar content-->

      Search: <input ng-model="query">
      Sort by:
      <select ng-model="orderProp">
        <option value="name">Alphabetical</option>
        <option value="age">Newest</option>
      </select>

    </div>
    <div class="col-md-10">
      <!--Body content-->

      <ul class="phones">
        <li ng-repeat="phone in phones | filter:query | orderBy:orderProp" class="thumbnail">
          <a href="#/phones/{{phone.id}}" class="thumb"><img ng-src="{{phone.imageUrl}}"></a>
          <a href="#/phones/{{phone.id}}">{{phone.name}}</a>
          <p>{{phone.snippet}}</p>
        </li>
      </ul>

    </div>
  </div>
</div>
```

同时我们给手机详细视图临时添加了一个简单的模板：

`app/partials/phone-detail.html`：

```
TBD: detail view for <span>{{phoneId}}</span>
```

需要注意的是我们使用了`phoneId`表达式，这将在`PhoneDetailCtrl`中定义。

* * *

## App模块

为了完善应用程序的架构，我们使用了`ngRoute`模块，并且将控制器都移动到了它们自己所属的模块`phonecatControllers`内（如下所示）。 我们给`index.html`添加了一个`angular-route.js`引用，同时在`controllers.js` 中创建了一个新的`phonecatControllers` 模块。但我们所要做的将不仅限于此。我们需要给应用添加模块依赖。通过在phonecatApp中列出这两个模块作为依赖，我们就可以使用它们提供的指令和服务了。

`app/js/app.js`：

```
var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'phonecatControllers'
]);

...
```

注意传入到`angular.module`方法中的第二个参数`['ngRoute', 'phonecatControllers']`，这个数组中列出的是`phonecatApp`将要依赖到的模块。

```
...

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/phones', {
        templateUrl: 'partials/phone-list.html',
        controller: 'PhoneListCtrl'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }]);
```

在`phonecatApp.config()`方法中，我们请求给配置方法注入`$routeProvider`，并使用`$routeProvider.when()`方法来定义我们的路由。 我们的应用路由定义如下：

  * `when('/phones')`：当URL匹配到`/phones`时，页面将会显示手机列表视图。Angular会使用`phone-list.html`模板和`PhoneListCtrl`控制器来构造这个它
  * `when('/phones/:phoneId')`：当URL匹配到`/phones/:phoneId`（`:phoneId`是URL的一个参数）时，页面将会显示手机详细视图。 Angular会使用`phone-detail.html`模板和`PhoneDetailCtrl`来构造它
  * `otherwise({redirectTo: '/phones'})`：当浏览器地址没有匹配上我们定义的路由时重定向到`/phones`

我们复用了在前面的教程中构建的`PhoneListCtrl`控制器，并且在`app/js/controllers.js`文件中为手机详细视图创建了一个空白的`PhoneDetailCtrl`控制器。 注意在第二条路由定义中使用到的`:phoneId`参数。`$route`服务会将`/phones/:phoneId`声明当成一个模板来使用。所有使用`:`前缀声明的变量都会被提取到`$routeParams`对象中去。

* * *

## 控制器

`app/js/controllers.js`：

```
var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);
```

注意到我们创建了一个名为`phonecatControllers`的新模块。对一些小型AngularJS应用而言或许一个模块就够用了，但是随着应用的增长，将代码重构到不同的模块中去是非常普遍的做法。对大型应用来说，你很可能会为应用的每一个主要功能都创建不同的模块。 因为我们的教学应用相对来说比较小，所以我们把所有的控制器添加到`phonecatControllers`模块中就完事了。

* * *

## 测试

为了验证应用的正确性，我们编写了一些端到端测试来验证当URL发生变化时应用是否渲染了正确的视图。

```
...
   it('should redirect index.html to index.html#/phones', function() {
    browser.get('app/index.html');
    browser.getLocationAbsUrl().then(function(url) {
        expect(url).toEqual('/phones');
      });
  });

  describe('Phone list view', function() {
    beforeEach(function() {
      browser.get('app/index.html#/phones');
    });
...

  describe('Phone detail view', function() {

    beforeEach(function() {
      browser.get('app/index.html#/phones/nexus-s');
    });


    it('should display placeholder page with phoneId', function() {
      expect(element(by.binding('phoneId')).getText()).toBe('nexus-s');
    });
  });
```

你可以通过执行`npm run protractor`来观察测试运行

## 课外扩展

尝试给`index.html`添加一个`{{orderProp}}`绑定，你会发现即使正处在手机列表视图中它也没有引发任何改变。这是因为`orderProp`模型只在`PhoneListCtrl`管理的作用域中可见。如果你把同样的绑定添加到`phone-list.html`模板内它就会如预期一般地工作了。

## 总结

既然已经设置好了路由与手机列表视图，我们就可以准备通过[step 8](/p/angular-tutorial-more-templating/)来实现详细视图了。
