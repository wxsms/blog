---
id: angular-tutorial-two-way-data-binding
title: Angular 教程：双向绑定
date: 2015-12-26T18:01:24+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中，你将会通过添加一个新的模型变量给手机列表增加一个动态排序功能 。这个功能通过给循环器添加一个新的属性实现，然后让数据绑定来自动完成其余的工作。

  * 现在除了搜索框，应用还显示了一个允许用户对手机列表进行排序的下拉框

<!--more--> 最重要的改动如下所示。你可以在

[GitHub](https://github.com/angular/angular-phonecat/compare/step-3...step-4 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 模板

`app/index.html`：

```
Search: <input ng-model="query">
Sort by:
<select ng-model="orderProp">
  <option value="name">Alphabetical</option>
  <option value="age">Newest</option>
</select>


<ul class="phones">
  <li ng-repeat="phone in phones | filter:query | orderBy:orderProp">
    <span>{{phone.name}}</span>
    <p>{{phone.snippet}}</p>
  </li>
</ul>
```

我们对`index.html`模板进行了如下修改：

* 首先，我们在HTML中添加了一个名叫`orderProp`的`<select>`节点，然后用户才能选择他们想要的排序方式
* 然后我们把`orderBy`过滤器串联到了`filter`过滤器的后面，它可以对循环器的输入再做进一步的处理。`orderBy`过滤器会接受一个输入数组，复制并且返回排序后的副本

![](https://raw.githubusercontent.com/wxsms/wxsms-img-holder/master/tutorial_04.png)

Angular为选中的元素与`orderProp`模型创建了一个双向的数据绑定。`orderProp`于是就作为了`orderBy`过滤器的一个输入。 正如我们在Step 3中讨论过的有关数据绑定与循环器的内容，无论模型在何时发生变化（比如用户改变下拉框的值），Angular的数据绑定都会引起视图的自动刷新。我们再也不用编写任何臃肿的DOM维护代码了！

* * *

## 控制器

`app/js/controllers.js`：

```
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', function ($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.',
     'age': 1},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.',
     'age': 2},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.',
     'age': 3}
  ];

  $scope.orderProp = 'age';
});
```

* 我们对`phones`模型（就是这个数组）稍微做了些改变，并且给每条记录添加了一个`age`属性，这个属性是用来排序的
* 在最下面的一行我们把默认的排序方式设置成了`age`。如果我们不在这里设置一个默认值，那么在用户选择一个排序方式以前`orderBy`过滤器都不会被初始化

现在我们可以说说双向的数据绑定了。注意当应用在浏览器中加载的时候，下拉列表就已经选中了 Newest 项。这是因为我们在控制器中把`orderProp`属性的值设置为了`age`，因此从模型到视图的方向发生了一次绑定。如果你现在选择`Alphabetically`项的话，模型也会跟着视图发生改变，并且手机列表也会重新进行排序。这就是一次反方向的数据绑定：从视图到模型。

* * *

## 测试

现在我们更新一下单元测试和端到端测试，首先看看单元测试：
  
`test/unit/controllersSpec.js`：

```
describe('PhoneCat controllers', function() {

  describe('PhoneListCtrl', function(){
    var scope, ctrl;

    beforeEach(module('phonecatApp'));

    beforeEach(inject(function($controller) {
      scope = {};
      ctrl = $controller('PhoneListCtrl', {$scope:scope});
    }));

    it('should create "phones" model with 3 phones', function() {
      expect(scope.phones.length).toBe(3);
    });


    it('should set the default value of orderProp model', function() {
      expect(scope.orderProp).toBe('age');
    });
  });
});
```

单元测试现在会验证是否设置了一个默认的排序属性。 我们在`beforeEach`中使用Jasmine的API来构造控制器，因此在父级`describe`代码块下的所有测试都能共享它。 你应该可以从Karma终端中看到如下结果：

```
Chrome 22.0: Executed 2 of 2 SUCCESS (0.021 secs / 0.001 secs)
```

再来看端到端测试：
  
`test/e2e/scenarios.js`：

```
...
it('should be possible to control phone order via the drop down select box', function() {

  var phoneNameColumn = element.all(by.repeater('phone in phones').column('phone.name'));
  var query = element(by.model('query'));

  function getNames() {
    return phoneNameColumn.map(function(elm) {
      return elm.getText();
    });
  }

  query.sendKeys('tablet'); //let's narrow the dataset to make the test assertions shorter

  expect(getNames()).toEqual([
    "Motorola XOOM\u2122 with Wi-Fi",
    "MOTOROLA XOOM\u2122"
  ]);

  element(by.model('orderProp')).element(by.css('option[value="name"]')).click();

  expect(getNames()).toEqual([
    "MOTOROLA XOOM\u2122",
    "Motorola XOOM\u2122 with Wi-Fi"
  ]);
});...
```

端到端测试验证了排序的结果是否正确。 你可以执行`npm run protractor`来观察测试的运行。

## 课外扩展

在`PhoneListCtrl`控制器中尝试把初始化`orderProp`的代码给删除掉，你可以看到Angular会给下拉列表临时添加一个空白的选项作为默认值，并且手机列表会暂时处于原始的排序状态下。 给`index.html`添加一个`{{orderProp}}`绑定来观察它的值是如何变化的。 通过给排序值添加一个`-`号来使排序反向进行：

```
<option value="-age">Oldest</option>
```

## 总结

现在你已经给应用添加了一个排序功能以及相应的测试，快快通过[step 5](/p/angular-tutorial-xhrs-and-dependency-injection/)来学习Angular服务（Service）以及如何使用Angular的依赖注入。
