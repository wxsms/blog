---
id: angular-tutorial-event-handlers
title: Angular 教程：事件处理
date: 2015-12-29T11:35:25+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中，你将给手机详细页面添加一个可点击的图片切换功能。

  * 手机列表视图现在显示了一张大图与几张较小的缩略图。当我们点击任意一张缩略图的时候大图都会被其取代。

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-9...step-10 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 控制器

`app/js/controllers.js`：

```
...
var phonecatControllers = angular.module('phonecatControllers',[]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get('phones/' + $routeParams.phoneId + '.json').success(function(data) {
      $scope.phone = data;
      $scope.mainImageUrl = data.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    };
  }]);
```

在`PhoneDetailCtrl`中，我们创建了`mainImageUrl`模型并把它的初始值设置为手机图片URL列表中的第一项。 同时我们也创建了一个`setImage`事件处理函数来改变`mainImageUrl`的值。

* * *

## 模板

`app/partials/phone-detail.html`：

```
<img ng-src="{{mainImageUrl}}" class="phone">

...

<ul class="phone-thumbs">
  <li ng-repeat="img in phone.images">
    <img ng-src="{{img}}" ng-click="setImage(img)">
  </li>
</ul>
...
```

我们将`mainImageUrl`模型绑定到了大图的`ngSrc`指令上。 同时我们给缩略图注册了一个`ngClick`事件处理器。当用户点击其中一张缩略图的时候，处理器将使用`setImage`事件处理函数来动态地改变`mainImageUrl`的值。

* * *

&nbsp;

## 测试

为了测试这项新功能，我们添加了两个端到端测试。其中一个用来验证大图在默认情况下是否设置成了所有图片中的第一张，另一个则用来验证当点击缩略图的时候大图是否正确地改变了。

`test/e2e/scenarios.js`：

```
...
  describe('Phone detail view', function() {

...

    it('should display the first phone image as the main phone image', function() {
      expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });


    it('should swap main image if a thumbnail image is clicked on', function() {
      element(by.css('.phone-thumbs li:nth-child(3) img')).click();
      expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

      element(by.css('.phone-thumbs li:nth-child(1) img')).click();
      expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });
  });
```

你可以通过执行`npm run protractor`来观察测试运行。 同时因为我们给`PhoneDetailCtrl`控制器添加了`mainImageUrl`模型，所以单元测试也需要做些重构。如下所示，为了让测试通过，我们创建了`xyzPhoneData`函数用来返回带`images`属性的正确的JSON数据。

`test/unit/controllersSpec.js`：

```
...
  beforeEach(module('phonecatApp'));

...

 describe('PhoneDetailCtrl', function(){
    var scope, $httpBackend, ctrl,
        xyzPhoneData = function() {
          return {
            name: 'phone xyz',
            images: ['image/url1.png', 'image/url2.png']
          }
        };


    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());

      $routeParams.phoneId = 'xyz';
      scope = $rootScope.$new();
      ctrl = $controller('PhoneDetailCtrl', {$scope: scope});
    }));


    it('should fetch phone detail', function() {
      expect(scope.phone).toBeUndefined();
      $httpBackend.flush();

      expect(scope.phone).toEqual(xyzPhoneData());
    });
  });
```

现在单元测试应该能通过了。

## 课外扩展

我们来给`PhoneDetailCtrl`添加一个新的控制方法：

```
$scope.hello = function(name) {
    alert('Hello ' + (name || 'world') + '!');
}
```

并且给`phone-detail.html`模板添加：

```
<button ng-click="hello('Elmo')">Hello</button>
```

## 总结

现在我们已经完成了图片切换功能，可以通过[step 11](/p/angular-tutorial-rest-and-custom-services/)来学习一种更好的抓取数据的方式。
