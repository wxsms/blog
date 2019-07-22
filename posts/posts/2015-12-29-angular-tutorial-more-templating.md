---
id: angular-tutorial-more-templating
title: Angular 教程：更多的模板
date: 2015-12-29T08:44:23+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中，你将实现当用户点击手机列表中的一条记录时显示的详细视图。

  * 当你点击列表中的一条记录时，页面会显示一个带有该记录详细信息的视图

为了实现这个目标，我们使用[$http](https://docs.angularjs.org/api/ng/service/$http)来抓取数据并刷新`phone-detail.html`视图模板。 最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-7...step-8 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 数据

除了`phones.json`以外，`app/phones/`目录还包含了每台手机设备详细信息的JSON文件：

`app/phones/nexus-s.json`：

```
{
  "additionalFeatures": "Contour Display, Near Field Communications (NFC),...",
  "android": {
      "os": "Android 2.3",
      "ui": "Android"
  },
  ...
  "images": [
      "img/phones/nexus-s.0.jpg",
      "img/phones/nexus-s.1.jpg",
      "img/phones/nexus-s.2.jpg",
      "img/phones/nexus-s.3.jpg"
  ],
  "storage": {
      "flash": "16384MB",
      "ram": "512MB"
  }
}
```

这些文件使用了同样的格式来为手机设备描述一些各种各样的属性。我们会在详细视图中展现它们。

* * *

## 控制器

我们扩展了`PhoneDetailCtrl`控制器，在其中使用`$http`服务来抓取JSON文件，就跟获取手机列表的方式一模一样：

`app/js/controllers.js`：

```
var phonecatControllers = angular.module('phonecatControllers',[]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get('phones/' + $routeParams.phoneId + '.json').success(function(data) {
      $scope.phone = data;
    });
  }]);
```

为了构建HTTP请求的URL，我们使用到了`$route`服务从当前路由中提取到的`$routeParams.phoneId`

* * *

## 模板

之前临时加入的TBD模板现在被一些包含手机详细信息的列表与绑定取代了。注意我们是如何使用Angular表达式以及`ngRepeat`来将手机数据从模型映射到视图上的。

`app/partials/phone-detail.html`：

```
<img ng-src="{{phone.images[0]}}" class="phone">

<h1>{{phone.name}}</h1>

<p>{{phone.description}}</p>

<ul class="phone-thumbs">
  <li ng-repeat="img in phone.images">
    <img ng-src="{{img}}">
  </li>
</ul>

<ul class="specs">
  <li>
    <span>Availability and Networks</span>
    <dl>
      <dt>Availability</dt>
      <dd ng-repeat="availability in phone.availability">{{availability}}</dd>
    </dl>
  </li>
    ...
  <li>
    <span>Additional Features</span>
    <dd>{{phone.additionalFeatures}}</dd>
  </li>
</ul>
```

* * *

## 测试

我们为`PhoneListCtrl`编写了一个类似于step 5的单元测试。

`test/unit/controllersSpec.js`：

```
beforeEach(module('phonecatApp'));

  ...

  describe('PhoneDetailCtrl', function(){
    var scope, $httpBackend, ctrl;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/xyz.json').respond({name:'phone xyz'});

      $routeParams.phoneId = 'xyz';
      scope = $rootScope.$new();
      ctrl = $controller('PhoneDetailCtrl', {$scope: scope});
    }));


    it('should fetch phone detail', function() {
      expect(scope.phone).toBeUndefined();
      $httpBackend.flush();

      expect(scope.phone).toEqual({name:'phone xyz'});
    });
  });
...
```

你现在应该可以在Karma终端看到以下输出：

```
Chrome 22.0: Executed 3 of 3 SUCCESS (0.039 secs / 0.012 secs)
```

同时我们也添加了一个端到端测试，验证当页面跳转到Nexus S详细视图的时候页头是不是真的显示了Nexus S

`test/e2e/scenarios.js`：

```
...
  describe('Phone detail view', function() {

    beforeEach(function() {
      browser.get('app/index.html#/phones/nexus-s');
    });


    it('should display nexus-s page', function() {
      expect(element(by.binding('phone.name')).getText()).toBe('Nexus S');
    });
  });
...
```

你可以通过执行`npm run protractor`来观察测试运行。

## 课外扩展

使用[Protractor API](http://angular.github.io/protractor/#/api)编写一个测试，验证我们在Nexus S详细页上显示了4张标题图片。

## 总结

现在手机详细视图已经到位了，在[step 9](/p/angular-tutorial-filters/)中我们将学习如何编写自定义的过滤器。
