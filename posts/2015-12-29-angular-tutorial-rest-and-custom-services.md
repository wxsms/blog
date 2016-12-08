---
id: angular-tutorial-rest-and-custom-services
title: Angular 教程：REST 和自定义服务
date: 2015-12-29T14:01:43+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - RESTful
---
在这一步中，应用程序抓取数据的方式将会改变。

  * 我们定义了一个代表着[RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer)客户端的自定义服务。通过这个客户端我们可以用更简洁的方式向服务器发起数据请求，不再与低层次的[$http](https://docs.angularjs.org/api/ng/service/$http)接口，HTTP方法与URL等打交道

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-10...step-11 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 依赖

RESTful功能由Angular的`ngResource`模块提供，该模块没有包含在Angular的核心框架中。 我们使用[Bower](http://bower.io/)来安装客户端的依赖。通过更新`bower.json`配置文件来加入新的依赖项：

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
    "angular-resource": "1.4.x"
  }
}
```

新的依赖项`"angular-resource": "1.4.x"`告诉Bower需要安装1.4.x版本的angular-resource组件。通过以下命令下载并安装依赖：

```
npm install
```

> 警告：如果在你上一次运行`npm install`之后Angular发布了新版本的话，在运行`bower install`的时候可能就会遇到问题（因为angular.js的版本发生了冲突）。解决方法是在执行`npm install`之前先删除`app/bower_components`目录。

&nbsp;

> 注意：如果你已经全局安装了bower，你可以使用`bower install`指令。但在这个项目中我们有预设的`npm install`指令来完成相同的事情

* * *

## 模板

`app/js/services.js`文件将包含一些自定义服务的代码，所以我们要把它添加到布局模版中。同时我们也要加载`angular-resource.js`文件，它包含了ngResource模块。

`app/index.html`：

```
...
  <script src="bower_components/angular-resource/angular-resource.js"></script>
  <script src="js/services.js"></script>
...
```

* * *

## 服务

我们通过自己创建的服务来与服务器上的手机数据打交道：

`app/js/services.js`：

```
var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);
```

我们通过使用工厂（Factory）方法以及模块（Module）API来注册一个自定义服务。我们给它传递了两个参数：服务名（Phone）以及工厂方法。工厂方法的构造与控制器非常相似，它们都能通过方法参数来接受注入。在这个服务中我们声明了一项对`$resource`服务的依赖。`$resource`服务可以让我们使用更少的代码以更简洁的方式来创建RESTful客户端。这个客户端可以取代低层次的`$http`服务在应用中的作用。

`app/js/app.js`：

```
...
angular.module('phonecatApp', ['ngRoute', 'phonecatControllers','phonecatFilters', 'phonecatServices']).
...
```

我们需要给`phonecatApp`主模块添加对`phonecatServices`模块的依赖。

* * *

## 控制器

我们通过使用`Phone`服务替代低层次的`$http`服务来简化子控制器（`PhoneListCtrl`和`PhoneDetailCtrl`）。对于暴露的RESTful数据资源来说，Angular的`$recource`服务比`$http`服务用起来更简单，并且代码也更容易看懂了。

`app/js/controllers.js`：

```
var phonecatControllers = angular.module('phonecatControllers', []);

...

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone', function($scope, Phone) {
  $scope.phones = Phone.query();
  $scope.orderProp = 'age';
}]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone', function($scope, $routeParams, Phone) {
  $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
    $scope.mainImageUrl = phone.images[0];
  });

  $scope.setImage = function(imageUrl) {
    $scope.mainImageUrl = imageUrl;
  }
}]);
```

注意在`PhoneListCtrl`中我们使用：

```
$scope.phones = Phone.query();
```

替代了：

```
$http.get('phones/phones.json').success(function(data) {
  $scope.phones = data;
});
```

这是一个查询所有手机设备的简写。 这里有一个重点，就是我们在调用Phone服务的时候不会给它传入任何的回调函数。虽然结果看起来像是同步返回的一样，然而并不是。同步返回的实际上不是数据，而是“未来（Future）”——一个在XHR响应返回的时候将会被数据填充的对象。因为Angular的数据绑定特性，我们可以用这个“未来”对象给模板做绑定。那么在数据真正到来的时候，视图也就会自然而然地更新了。 有时候仅仅依靠这个未来的对象并不能完成我们想要的所有工作，因此在本例中，我们还是给它添加了一个回调参数来处理服务器响应。比如`PhoneDetailCtrl`，我们在回调函数中设置了`mainImageUrl`的值。

* * *

## 测试

因为我们使用了ngResource模块，所以想要让测试通过的话就必须要更新一下Karma配置文件了：

`test/karma.conf.js`：

```
files : [
  'app/bower_components/angular/angular.js',
  'app/bower_components/angular-route/angular-route.js',
  'app/bower_components/angular-resource/angular-resource.js',
  'app/bower_components/angular-mocks/angular-mocks.js',
  'app/js/**/*.js',
  'test/unit/**/*.js'
],
```

我们修改了一下单元测试来验证新服务是否使用了HTTP请求并且是否工作正确。同时测试也会验证控制器与服务之间的连接是否正确。 <a style="line-height: 1.5;" href="https://docs.angularjs.org/api/ngResource/service/$resource">$resource</a>服务自动地给响应体添加了更新以及删除数据的方法。所以如果我们使用标准的`toEqual`匹配器的话，测试将会失败。这是因为测试数据并没有和响应体完全一模一样。为了解决这个问题，我们使用一个新定义的`toEqualData`[Jasmine匹配器](http://jasmine.github.io/1.3/introduction.html#section-Matchers)。`toEqualData`匹配器在比较两个对象的时候会只比较其属性而忽略对象所携带的方法。

`test/unit/controllersSpec.js`：

```
describe('PhoneCat controllers', function() {

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('phonecatApp'));
  beforeEach(module('phonecatServices'));


  describe('PhoneListCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/phones.json').
          respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

      scope = $rootScope.$new();
      ctrl = $controller('PhoneListCtrl', {$scope: scope});
    }));


    it('should create "phones" model with 2 phones fetched from xhr', function() {
      expect(scope.phones).toEqualData([]);
      $httpBackend.flush();

      expect(scope.phones).toEqualData(
          [{name: 'Nexus S'}, {name: 'Motorola DROID'}]);
    });


    it('should set the default value of orderProp model', function() {
      expect(scope.orderProp).toBe('age');
    });
  });


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
      expect(scope.phone).toEqualData({});
      $httpBackend.flush();

      expect(scope.phone).toEqualData(xyzPhoneData());
    });
  });
});
```

现在你应该能在Karma终端内看到以下输出：

```
Chrome 22.0: Executed 5 of 5 SUCCESS (0.038 secs / 0.01 secs)
```

## 总结

现在我们见识了如何构建一个自定义的服务来作为RESTful客户端，下一步[step 12](/p/angular-tutorial-applying-animations/)（最后一步）我们将会学习如何让应用程序动起来（加点特效）。
