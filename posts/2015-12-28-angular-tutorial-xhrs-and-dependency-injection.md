---
id: angular-tutorial-xhrs-and-dependency-injection
title: Angular 教程：异步加载和依赖注入
date: 2015-12-28T15:01:49+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
我已经受够了用hard-coded数据来写应用。。。现在我们来尝试使用Angular提供的[$http](https://docs.angularjs.org/api/ng/service/$http)服务来从后台抓取一个大一点的数据集。我们会使用[依赖注入](https://docs.angularjs.org/guide/di)的方式来给`PhoneListCtrl`控制器提供[服务](https://docs.angularjs.org/guide/services)。

  * 现在页面上有一个从服务端获取的包含20台手机设备的列表

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-4...step-5 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 数据

项目中的`app/phones/phones.json`文件是一个使用JSON格式储存的包含更多手机数据的数据集。如下是其中的一段：

```
[
 {
  "age": 13,
  "id": "motorola-defy-with-motoblur",
  "name": "Motorola DEFY\u2122 with MOTOBLUR\u2122",
  "snippet": "Are you ready for everything life throws your way?"
  ...
 },
...
]
```

* * *

## 控制器

我们通过使用Angular的`$http`服务来向服务端发送HTTP请求并且获取`app/phones/phones.json`文件中的数据。`$http`只是Angular内置的处理一般任务的众多服务的其中之一。当你需要使用它们的时候Angular会将它们注入到你需要的地方去。 服务（Service）是由Angular的[依赖注入系统](https://docs.angularjs.org/guide/di)管理的。依赖注入可以帮助我们更科学地构造应用程序（比如说把组件分为视图，数据与模型），以及让耦合度更低（各组件之间的依赖不是由组件自身去解决的，而是通过依赖注入系统）。
  
`app/js/controllers.js`：

```
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', function ($scope, $http) {
  $http.get('phones/phones.json').success(function(data) {
    $scope.phones = data;
  });

  $scope.orderProp = 'age';
});
```

`$http`会向服务器发送一次HTTP GET请求，请求的内容是`phones/phones.json`（url是相对于`index.html`文件的）。服务器通过提供文件中的数据来做出响应（当然响应数据也可以是由服务器动态生成的，对我们来说看到的都是一样的结果，在这个教程中考虑到简单性我们就直接使用了一个json文件）。`$http`方法返回了一个带`success`方法的[Promise](https://docs.angularjs.org/api/ng/service/$q)对象。我们通过调用这个方法来处理异步响应并且把数据交付给控制器之下的作用域，一个叫`phones`的数组。需要注意的是Angular会检测到响应类型是JSON并且为我们自动转换数据类型。 当需要使用一个Angular服务的时候，我们只需要声明我们需要的服务名并且把它们作为参数传入到控制器中去即可，如下：

```
phonecatApp.controller('PhoneListCtrl', function ($scope, $http) {...}
```

Angular依赖注入器会在控制器初始化的时候提供服务，同时也会照顾到服务所依赖的服务（服务通常会依赖于其它的服务）。

![](http://7xjbxm.com1.z0.glb.clouddn.com/tutorial_05.png)

### $前缀命名转换

你可以创建自定义的服务（实际上在本教程的step 11中将要这么做）。作为一种命名之间的转换，Angular的内置服务，比如scope以及其它的一些API名字中有一个`$`前缀。
  
`$`前缀存在的意义是为了区分Angular所提供的内置服务。为了不引起冲突，最好不要给自定义的模型或者服务等任何东西加上`$`前缀。

如果你深入查看scope服务的话，你会发现一些属性使用了`$$`前缀。这些属性应当被认为是私有变量，你不应该尝试去读取或者修改它们。

### 最小化的注意事项

鉴于Angular依靠辨别控制器中函数构造器的参数名字来完成依赖注入，如果你将`PhoneListCtrl`控制器的JavaScript代码最小化的话，则与此同时函数的参数也会被最小化，因此依赖注入器就无法正确地识别这些注入声明了。 我们可以通过在声明函数的同时也声明依赖名来解决这个问题（提供不会被最小化的字符串）。目前有两种方式来做到这一点：

  * 给控制器创建一个包含字符串数组的`$inject`属性。数组中的每一个字符串代表着一个相应的将要被注入的服务名。如下所示： 

```
function PhoneListCtrl($scope, $http) {...}
PhoneListCtrl.$inject = ['$scope', '$http'];
phonecatApp.controller('PhoneListCtrl', PhoneListCtrl);
```

  * 使用内联声明，在原先提供控制器函数的地方提供一个数组。数组包含一连串的服务名，最后则是函数本身： 
  
```
function PhoneListCtrl($scope, $http) {...}
phonecatApp.controller('PhoneListCtrl', ['$scope', '$http', PhoneListCtrl]);
```

以上两种方法对Angular来说都是一样的，所以实际使用哪一种取决于你项目的风格就可以了。 当使用第二种方法的时候，一般情况下会用匿名函数构造器来内联地注册控制器：

```
phonecatApp.controller('PhoneListCtrl', ['$scope', '$http', function($scope, $http) {...}]);
```

根据以上的观点，我们对`PhoneListCtrl`做了如下改动。
  
`app/js/controllers.js`：

```
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }]);
```

* * *

## 测试

因为我们开始使用依赖注入并且控制器也有所依赖了，所以在测试中构造相同的控制器变得稍微麻烦了一些。我们可以通过给它`new`一个假的`$http`实现。然而，Angular已经给我们的单元测试提供了一位`$http`演员。我们通过使用`$httpBackend`服务中提供的方法来配置一个假的服务器响应。
  
`test/unit/controllersSpec.js`：

```
describe('PhoneCat controllers', function() {

describe('PhoneListCtrl', function(){
  var scope, ctrl, $httpBackend;

  // Load our app module definition before each test.
  beforeEach(module('phonecatApp'));

  // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
  // This allows us to inject a service but then attach it to a variable
  // with the same name as the service in order to avoid a name conflict.
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('phones/phones.json').
        respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

    scope = $rootScope.$new();
    ctrl = $controller('PhoneListCtrl', {$scope: scope});
  }));
```

注意：因为我们在测试环境中加载了Jasmine和`angular-mocks.js`，所以可以使用[module](https://docs.angularjs.org/api/ngMock/function/angular.mock.module)以及[inject](https://docs.angularjs.org/api/ngMock/function/angular.mock.inject)方法来接入/配置注入器。 我们根据以下方法在测试环境中创建控制器：

  * 我们使用`inject`方法将[$rootScope](https://docs.angularjs.org/api/ng/service/$rootScope)，[$controller](https://docs.angularjs.org/api/ng/service/$controller)和[$httpBackend](https://docs.angularjs.org/api/ng/service/$httpBackend)服务实例注入到Jasmine的`beforeEach`方法内。这些实例来自于每次测试前都临时创建的注入器。这保证了每个测试都将处于同样的起跑线上并且测试结果不会相互影响
  * 我们使用`$rootScope.$new()`方法给控制器创建了一个新的作用域（scope）
  * 我们调用了注入的`$controller`函数，给它传入了控制器的名字`PhoneListCtrl`以及创建好的scope作为参数

目前的代码使用了`$http`服务来获取手机列表数据，因此在创建`PhoneListCtrl`子作用域之前，我们需要告诉测试代码去期望一个来自控制器的请求：

  * 给`beforeEach`方法注入`$httpBackend`服务。这个服务可以看成是原服务的一个演员，来扮演生产环境中发生的XHR以及JSONP请求。这个演员可以使测试代码避免与真正的API与全局状态发生关联，两者都将对测试造成不可预知的影响
  * 使用`$httpBackend.expectGET`方法来告诉`$httpBackend`服务去期待一个将要到来的HTTP请求并且告诉它如何回复。注意的是在我们调用`$httpBackend.flush`方法以前它是不会真正做出响应的

现在我们可以下一个断言了，在获得响应之前`scope`作用域中不会存在`phones`模型：

```
it('should create "phones" model with 2 phones fetched from xhr', function() {
  expect(scope.phones).toBeUndefined();
  $httpBackend.flush();

  expect(scope.phones).toEqual([{name: 'Nexus S'},
                               {name: 'Motorola DROID'}]);
});
```

  * 我们调用`$httpBackend.flush()`方法将浏览器中的请求队列处理了。这将导致`$http`服务返回的promise对象被训练过的响应解决。通过[mock $httpBackend](https://docs.angularjs.org/api/ngMock/service/$httpBackend)文档来查看为什么这一步是必须的
  * 我们同时下了验证`phone`模型存在的断言

最后，我们来验证`orderProp`的默认值是正确的：

```
it('should set the default value of orderProp model', function() {
  expect(scope.orderProp).toBe('age');
});
```

你现在应该能从Karma终端中看到如下输入：

```
Chrome 22.0: Executed 2 of 2 SUCCESS (0.028 secs / 0.007 secs)
```

## 课外扩展

在`index.html`的底部添加如下绑定来查看json格式的数据：

```
<pre>{{phones | filter:query | orderBy:orderProp | json}}</pre>
```

在`PhoneListCtrl`中，对HTTP响应做一些预处理，将手机数量限制为从头开始的5条记录。在`$http`回调中添加如下代码：

```
$scope.phones = data.splice(0, 5);
```

## 总结

现在你知道使用Angular服务是多么简单的一件事了（这得感谢Angular的依赖注入）。在[step 6](/p/angular-tutorial-templating-links-and-images/)中你将会学习的是如何给手机列表添加一些图片和连接。
