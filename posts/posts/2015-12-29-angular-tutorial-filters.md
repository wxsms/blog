---
id: angular-tutorial-filters
title: Angular 教程：过滤器
date: 2015-12-29T09:12:33+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中你将会学习如何创建自定义的过滤器。

  * 在上一步中，详细页面通过显示true或者false来表示一个手机是否具有某项功能。我们将使用一个自定义的过滤器来把这些字符串转换成图标：用✓表示true，用✘表示false

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-8...step-9 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 自定义过滤器

为了创建新的过滤器，我们创建了一个`phonecatFilters`模块，并且将自定义的过滤器注册在这个模块下。

`app/js/filters.js`：

```
angular.module('phonecatFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});
```

过滤器的名字叫checkmark，`input`将被转换为`true`或者`false`，然后我们根据结果返回两个unicode编码字符中的其中之一。 现在过滤器已经准备好了，我们需要给`phonecatApp`主模块添加一项`phonecatFilters`模块的依赖。

`app/js/app.js`：

```
...
angular.module('phonecatApp', ['ngRoute','phonecatControllers','phonecatFilters']);
...
```

* * *

## 模板

既然过滤器代码存在于`app/js/filters.js`
  
文件内，我们就需要把它包含到布局模版中。

`app/index.html`：

```
...
 <script src="js/controllers.js"></script>
 <script src="js/filters.js"></script>
...
```

在Angualr中根据以下语法来使用过滤器：

```
{{ expression | filter }}
```

现在我们来给手机详细模板添加过滤器：

`app/partials/phone-detail.html`：

```
...
    <dl>
      <dt>Infrared</dt>
      <dd>{{phone.connectivity.infrared | checkmark}}</dd>
      <dt>GPS</dt>
      <dd>{{phone.connectivity.gps | checkmark}}</dd>
    </dl>
...
```

* * *

## 测试

就像任何其它的组件一样，过滤器也应该要测一测。所幸的是编写这些测试是非常简单的事情。

`test/unit/filtersSpec.js`：

```
describe('filter', function() {

  beforeEach(module('phonecatFilters'));

  describe('checkmark', function() {

    it('should convert boolean values to unicode checkmark or cross',
        inject(function(checkmarkFilter) {
      expect(checkmarkFilter(true)).toBe('\u2713');
      expect(checkmarkFilter(false)).toBe('\u2718');
    }));
  });
});
```

在每一个过滤器测试执行以前我们都必须调用`beforeEach(module('phonecatFilters'))`，这个调用将`phonecatFilters`模块加载到了这些测试的注入器中。 需要注意的是我们调用了工具方法`inject(function(checkmarkFilter) { ... })`来获取需要被测试的过滤器。参考[angular.mock.inject()](https://docs.angularjs.org/api/ngMock/function/angular.mock.inject) 与此同时我们也注意到Filter后缀被追加到了我们定义的过滤器名字之后。参考[Filter Guide](https://docs.angularjs.org/guide/filter#using-filters-in-controllers-services-and-directives)来获取与此有关的信息。 你现在应该能在Karma控制台中看到如下输出：

```
Chrome 22.0: Executed 4 of 4 SUCCESS (0.034 secs / 0.012 secs)
```

## 课外扩展

我们来试试给`index.html`中的绑定添加一些[Angular的内置过滤器](https://docs.angularjs.org/api/ng/filter)吧：

  * `{ "lower cap string" | uppercase }`
  * `{ {foo: "bar", baz: 23} | json }`
  * `{ 1304375948024 | date }}`
  * `{ 1304375948024 | date:"MM/dd/yyyy @ h:mma" }`

与此同时我们也可以创建一个带有输入框的模型，然后给它添加一个带过滤器的绑定：

```
<input ng-model="userInput"> Uppercased: {{ userInput | uppercase }}
```

## 总结

现在我们学会了如何编写和测试自定义的过滤器，通过[step 10](/p/angular-tutorial-event-handlers/)来学习如何使用Angular扩展手机详细页面。
