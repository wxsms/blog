---
id: angular-tutorial-angular-templates
title: Angular 教程：动态模版
date: 2015-12-24T17:30:38+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
现在我们可以用 AngularJS 把页面变成动态的了，同时使用一个小测试来验证我们将要添加的代码正确性。 一个应用可以有很多种组织形式，对于 Angular 应用来说，使用 MVC 设计模式来解耦代码应该是比较合适的。接下来我们会使用一小点 Angular/JavaScript 代码来给应用添加模型，视图以及控制器。

  * 手机设备列表现在是由动态数据生成的了

最重要的改动如下所示。你可以在 [GitHub](https://github.com/angular/angular-phonecat/compare/step-1...step-2 "See diff on Github") 上查看它与之前的代码有何区别。

* * *

## 视图与模板

在 Angular 世界中，**视图**可以理解为**模型**在 HTML **模板 **上的投影。这意味着无论模型在何时发生变化，Angular 都会通过刷新被影响的绑定节点来更新视图。

视图现在由以下 Angular 模板组成：
  
`app/index.html`：

```
<html ng-app="phonecatApp">
<head>
  ...
  <script src="bower_components/angular/angular.js"></script>
  <script src="js/controllers.js"></script>
</head>
<body ng-controller="PhoneListCtrl">

  <ul>
    <li ng-repeat="phone in phones">
      <span>{{phone.name}}</span>
      <p>{{phone.snippet}}</p>
    </li>
  </ul>

</body>
</html>
```

现在 Hard Code 的手机列表被 [ngRepeat](https://docs.angularjs.org/api/ng/directive/ngRepeat) 指令以及两条 [Angular表达式](https://docs.angularjs.org/guide/expression) 替代了：

  * `<li>`元素中的`ng-repeat="phone in phones"`是 Angular 的循环指令。它会告诉 Angular 为 &#8216;phones&#8217; 中的每个 &#8216;phone&#8217; 使用`<li>`元素中的模板来创建一个`<li>`元素
  * 被双花括号包围的表达式（`{{phone.name}}`与`{{phone.snippet}}`）会被表达式得出的值所替代

我们给`<body>`元素添加了一个名叫`ng-controller`的新指令，这会将`PhoneListCtrl`控制器关联到`<body>`节点中，此时：

  * 双花括号中的表达式（`{{phone.name}}`与`{{phone.snippet}}`）将与`PhoneListCtrl`控制器中建立的模型绑定

注意：我们使用`ng-app="phonecatApp"`指定了一个名为`phonecatApp`的 [Angular模块](https://docs.angularjs.org/api/ng/type/angular.Module)，这个模块中将包含`PhoneListCtrl`控制器。

![](https://user-images.githubusercontent.com/5960988/48595811-427fc680-e991-11e8-8a47-09a71f5f5ce7.png)

* * *

## 模型与控制器

数据**模型**（一个由对象组成的简单数组）现在在`PhoneListCtrl`**控制器**内被初始化了。**控制器**是一个简单的、带`$scope`参数的函数构造器。
  
`app/js/controllers.js`：

```
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', function ($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.'},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.'},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.'}
  ];
});
```

在此我们定义了一个名为`PhoneListCtrl`
  
的控制器，同时在 Angular 模块中注册它。注意我们在`<html>`
  
标签上定义的`ng-app`
  
指令现在为这个 Angular 应用指定了引导模块为`phonecatApp`模块。

虽然这个控制器此时并没有做什么事情，但是它起着至关重要的作用。这个控制器通过提供数据模型的上下文来允许我们在模型与视图中创建数据绑定。

  * `<body>`标签上的 [ngController](https://docs.angularjs.org/api/ng/directive/ngController) 指令引用了控制器的名字：`PhoneListCtrl`（在`controllers.js`文件中）
  * `PhoneListCtrl`将手机数据附加到被注入进来的`$scope`上。scope 是在应用程序被定义时创建的根作用域的一个后代。这个控制器的作用域对`<body ng-controller="PhoneListCtrl">`标签内的所有绑定都是有效的。

### 作用域

在 Angular 中作用域的概念很关键。

作用域可以视为使模板，模型以及控制器在一起工作的粘合剂。Angular 使用作用域以及模板，模型，控制器中所包含的信息来保持模型与视图的分离与同步。任何对模型的改动都会反映到视图上；任何对视图的改变也会反映到模型上。 通过 [Angular作用域文档](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 来学习更多关于作用域的知识。

* * *

## 测试

Angular 分离控制器与视图的方式使得测试代码将更容易编写。如果控制器是可以通过全局命名空间访问的，我们就可以简单地使用一个`scope`演员对象来实例化它：

```
describe('PhoneListCtrl', function(){

  it('should create "phones" model with 3 phones', function() {
    var scope = {},
        ctrl = new PhoneListCtrl(scope);

    expect(scope.phones.length).toBe(3);
  });

});
```

这个测试实例化了`PhoneListCtrl`，并且通过验证作用域中包含 3 条记录来验证了手机数组的正确性。代码十分简洁。

### 测试非全局的控制器

一般来说，没有人会想要把控制器直接挂载到全局命名空间上。

实际上你可以看到我们把通过使用一个匿名函数构造器把它注册在了`phonecatApp`模块下。 在这个例子中，Angular 提供了一个名为`$controller`的服务，它将为你根据名字获取到相应的控制器。以下是通过`$controller`完成的与之前相同的测试：

`test/unit/controllersSpec.js`：

```
describe('PhoneListCtrl', function(){

  beforeEach(module('phonecatApp'));

  it('should create "phones" model with 3 phones', inject(function($controller) {
    var scope = {},
        ctrl = $controller('PhoneListCtrl', {$scope:scope});

    expect(scope.phones.length).toBe(3);
  }));

});
```

  * 在每一次测试之前我们都告诉 Angular 要加载`phonecatApp`模块
  * 告诉 Angular 要为测试方法注入`$controller`服务
  * 使用`$controller`来实例化`PhoneListCtrl`
  * 通过这个实例，我们就可以验证手机数组的正确性了

### 编写和执行测试

Angular 开发者偏好于使用 Jasmine&#8217;s Behavior-driven Development (BDD) 框架来编写测试。虽然 Angular 并没有要求使用 Jasmine，我们还是使用 Jasmine v1.3 来编写了教程中的所有测试。

你可以从 [Jasmine主页](http://jasmine.github.io/) 以及 [Jasmine文档](http://jasmine.github.io/1.3/introduction.html) 中学习 Jasmine

Angular-seed 项目使用 [Karma](http://karma-runner.github.io/) 来执行单元测试，你可以通过执行`npm install`来确保 Karma 以及它所必须的插件都已经被安装。

使用`npm test`来执行单元测试并且监听文件的改动：

  * Karma 会自动启动新的 Chrome 和 Firefox 浏览器进程，忽略并且让它们在后台运行就好了。Karma 会使用这些浏览器来执行测试
  * 如果你只安装了 Chrome 或者 Firefox 的其中一款浏览器，请在运行测试前修改 Karma 配置文件。找到`test/karma.conf.js`，并且修改其中的`browsers`属性，比如说你只安装了 Chrome： 

```
...
  browsers: ['Chrome'],
  ...
```

  * 你将在终端中看到类似以下的输出，可以发现测试通过了（或者并没有）： 

```
info: Karma server started at http://localhost:9876/
  info (launcher): Starting  browser "Chrome"
  info (Chrome 22.0): Connected on socket id tPUm9DXcLHtZTKbAEO-n
  Chrome 22.0: Executed 1 of 1 SUCCESS (0.093 secs / 0.004 secs)
``` 

* 如果想要重新执行一遍测试，只需要修改任意源代码或者`test.js`文件即可。Karma 会监听到改动然后重新执行测试。这一定很贴心吧~

> 当 Karma 启动的时候务必不要将浏览器窗口最小化。在一些操作系统中，分配给最小化的浏览器的内存是有限的，这会导致 Karma 的执行速度非常慢。

## 课外扩展

尝试给`index.html`再添加些绑定，比如说：

```
<p>Total number of phones: {{phones.length}}</p>
```

在控制器中创建一个新的属性并且将它绑定到模板上，比如说：

```
$scope.name = "World";
```

然后给`index.html`添加绑定：
    
```
<p>Hello, {{name}}!</p>
```

刷新浏览器，看看它说的是不是“Hello, World!”

更新单元测试`./test/unit/controllersSpec.js`来映射上一步的改动，比如说：

```
expect(scope.name).toBe('World');
```

给`index.html`添加一个循环器来构造一个简单的表格：

```
<table>
  <tr><th>row number</th></tr>
  <tr ng-repeat="i in [0, 1, 2, 3, 4, 5, 6, 7]"><td>{{i}}</td></tr>
</table>
```

现在通过在绑定中给i加1来把表格变成从 1 开始的：
    
```
<table>
  <tr><th>row number</th></tr>
  <tr ng-repeat="i in [0, 1, 2, 3, 4, 5, 6, 7]"><td>{{i+1}}</td></tr>
</table>
```

附加题：
    
尝试使用嵌套的`ng-repeat`来创建一个 8&#215;8 的表格。

将`expect(scope.phones.length).toBe(3)`改成`toBe(4)`看看单元测试是不是没有通过。

## 总结

你现在拥有了一个 MVC 构造形态的动态应用了，并且在开发过程中编写了单元测试。现在我们可以通过 [step 3](/p/angular-tutorial-filtering-repeaters/) 来学习如何给应用添加关键字搜索功能。
