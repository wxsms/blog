---
id: angular-tutorial-filtering-repeaters
title: Angular 教程：过滤循环器
date: 2015-12-25T17:09:58+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在上一步中我们花了大量精力去给应用搭建框架，所以现在来做些简单的事情：给列表添加一个关键词搜索（真的很简单）。同时我们会编写一个端到端测试，它将一直监控着我们的应用并且及时发现问题。

  * 应用现在包含一个搜索框。需要注意的是页面上显示的手机列表现在与搜索框中的输入内容有关。

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-2...step-3 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 控制器

控制器没有发生任何变化。

* * *

## 模板

`app/index.html`：

```
<div class="container-fluid">
  <div class="row">
    <div class="col-md-2">
      <!--Sidebar content-->

      Search: <input ng-model="query">

    </div>
    <div class="col-md-10">
      <!--Body content-->

      <ul class="phones">
        <li ng-repeat="phone in phones | filter:query">
          {{phone.name}}
          <p>{{phone.snippet}}</p>
        </li>
      </ul>

    </div>
  </div>
</div>
```

我们给页面添加了一个标准的 HTML 输入框`<input>`，然后使用 Angular 的过滤（filter）功能结合用户输入来对 ngRepeat 指令进行处理。<span style="line-height: 1.5;">这允许用户输入搜索关键词然后即时地在手机列表中看到结果。</span>

<span style="line-height: 1.5;">新添加的代码做了如下示范：</span>

  * 数据绑定：Angular 的核心特色之一。当页面加载的时候，Angular 会将输入框的值绑定到一个有着与其相同名字的数据模型上并且保持两者之间的同步。在这段代码中，用户在输入框中输入的数据（名为`query`）会即时地成为列表循环中的过滤器（`phone in phones | filter:query`）。数据的改动影响到循环器的输入，然后循环器根据模型的实时状态来更新 DOM
  * `filter`过滤器的使用：[filter](https://docs.angularjs.org/api/ng/filter/filter) 功能使用`query`的值来创建一个由只包含匹配`query`的记录组成的新数组

`ngRepeat`在`filter`过滤器返回的数组改变之时会自动更新视图，这之中的过程对开发者来说是完全不可见的。

![](http://7xjbxm.com1.z0.glb.clouddn.com/tutorial_03.png)

* * *

## 测试

在上一步中，我们学习了如何编写和执行单元测试。

单元测试对应用中的使用 JavaScript 编写的控制器和其它部件可以很好地发挥作用，但是不能测试 DOM 的修改以及应用整体逻辑。对这些情况，端到端测试是更好的选择。

既然搜索功能是完全通过模板与数据绑定实现的，我们就开始编写一个端到端测试来验证它是否正确地工作：
  
`test/e2e/scenarios.js`：

```
describe('PhoneCat App', function() {

  describe('Phone list view', function() {

    beforeEach(function() {
      browser.get('app/index.html');
    });


    it('should filter the phone list as a user types into the search box', function() {

      var phoneList = element.all(by.repeater('phone in phones'));
      var query = element(by.model('query'));

      expect(phoneList.count()).toBe(3);

      query.sendKeys('nexus');
      expect(phoneList.count()).toBe(1);

      query.clear();
      query.sendKeys('motorola');
      expect(phoneList.count()).toBe(2);
    });
  });
});
```

这个测试验证了搜索框与循环器之间连接的正确性。同样，十分简洁。

### 使用 Protractor 执行端到端测试

虽然这个测试看起来很像是使用 Jasmine 为控制器编写的单元测试，但端到端测试使用的是 [Protractor](https://github.com/angular/protractor) 提供的 API，可以从这里获取更多信息： <http://angular.github.io/protractor/#/api>

就像 Karma 是单元测试的执行者一样，我们使用 Protractor 来执行端到端测试。尝试使用`npm run protractor`来运行它。

端到端测试是比较慢的，因此不像单元测试，Protractor 会在测试结束后退出，并且不会在文件发生变化时自动重启。使用`npm run protractor`来重新执行测试。

> 注意：在使用 Protractor 执行测试的时候必须保证应用运行在 Web 服务器下。你可以使用`npm start`启动服务器。你也必须保证在运行`npm run protractor`之前已经安装了 Protractor 并且更新了相关驱动。通过在终端中输入`npm install`和`npm run update-webdriver`来完成以上事情。

## 课外扩展

### 实时显示 Query 的值

通过给`index.html`模板添加一个`{{query}}`绑定来实时显示`query`模型的值，看看它在用户输入的时候是如何发生变化的。

### 在标题中显示 Query

我们来看看如何让`query`的值实时地显示在 HTML 页面标题（Title）上。

* 给`describe`代码块添加一个端到端测试，现在`test/e2e/scenarios.js`长这样： 

```
describe('PhoneCat App', function() {

  describe('Phone list view', function() {

    beforeEach(function() {
      browser.get('app/index.html');
    });

    var phoneList = element.all(by.repeater('phone in phones'));
    var query = element(by.model('query'));

    it('should filter the phone list as a user types into the search box', function() {
      expect(phoneList.count()).toBe(3);

      query.sendKeys('nexus');
      expect(phoneList.count()).toBe(1);

      query.clear();
      query.sendKeys('motorola');
      expect(phoneList.count()).toBe(2);
    });

    it('should display the current filter value in the title bar', function() {
      query.clear();
      expect(browser.getTitle()).toMatch(/Google Phone Gallery:\s*$/);

      query.sendKeys('nexus');
      expect(browser.getTitle()).toMatch(/Google Phone Gallery: nexus$/);
    });
  });
});
```

执行 Protractor（`npm run protractor`）可以发现测试失败了。

* 你可能觉得直接给`<title>`标签加个`{{query}}`就好了： 

```
<title>Google Phone Gallery: {{query}}</title>
```

然而，当你刷新页面的时候，你不会看到预期的结果。因为“query”模型只能活在定义在`<body>`标签下的`ng-controller="PhoneListCtrl"`的作用域中：

```
<body ng-controller="PhoneListCtrl">
```

如果你想要把 query 模型绑定到`<title>`标签上去，你必须把`ngController`的声明**移动**到`<html>`标签上，因为它是`<body>`和`<title>`标签共同的祖先节点：

```
<html ng-app="phonecatApp" ng-controller="PhoneListCtrl">
```
  
同时，记得把`<body>`上定义的`ng-controller`指令**删除**。</li> 
        
* 重新执行`npm run protractor`就可以发现测试通过了
* 当在 title 节点中使用双花括号感觉还不错的情况下，你可能会发现，在页面还处于加载中的短暂时间内它们直接地就打印到用户的浏览器中去了。使用 [ngBind](https://docs.angularjs.org/api/ng/directive/ngBind) 或者 [ngBindTemplate](https://docs.angularjs.org/api/ng/directive/ngBindTemplate) 将会是一种更好的选择，它们在页面加载的过程中不会显示任何东西：

```
<title ng-bind-template="Google Phone Gallery: {{query}}">Google Phone Gallery</title>
```

## 总结

现在我们给应用添加了一个关键词搜索框并且包含了一个保证其功能正确的测试。现在我们可以前往 [step 4](/p/angular-tutorial-two-way-data-binding/) 来学习如何给手机应用添加排序功能。
