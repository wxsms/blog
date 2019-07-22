---
id: angular-tutorial-templating-links-and-images
title: Angular 教程：模板化的链接与图片
date: 2015-12-28T15:46:08+00:00
categories:
  - JavaScript
tags:
  - AngularJs
---
在这一步中你将学习给手机列表添加一个图片链接（暂时不会链接到其他地方）。随后你将使用链接来给手机列表显示一些附加的信息。

  * 列表中现在包含图片与链接了

最重要的改动如下所示。你可以在[GitHub](https://github.com/angular/angular-phonecat/compare/step-5...step-6 "See diff on Github")上查看它与之前的代码有何区别。

* * *

## 数据

需要注意的是`phones.json`文件中每条手机记录都包含了ID与图片URL，URL指向的是`app/img/phones/`目录。

`app/phones/phones.json`：

```
[
  {
    ...
    "id": "motorola-defy-with-motoblur",
    "imageUrl": "img/phones/motorola-defy-with-motoblur.0.jpg",
    "name": "Motorola DEFY\u2122 with MOTOBLUR\u2122",
    ...
  },
  ...
]
```

* * *

## 模板

`app/index.html` ：

```
...
        <ul class="phones">
          <li ng-repeat="phone in phones | filter:query | orderBy:orderProp" class="thumbnail">
            <a href="#/phones/{{phone.id}}" class="thumb"><img ng-src="{{phone.imageUrl}}"></a>
            <a href="#/phones/{{phone.id}}">{{phone.name}}</a>
            <p>{{phone.snippet}}</p>
          </li>
        </ul>
...
```

动态生成的链接以后将会链接到手机的详细信息页面，我们使用了熟悉的双花括号来给`href`属性添加绑定。

在step 2中，我们使用了`{{phone.name}} `来绑定元素内容。在这一步中`{{phone.id}}`将作为元素属性的绑定。 同时我们也使用`<img>`标签以及[ngSrc](https://docs.angularjs.org/api/ng/directive/ngSrc)指令给每一条手机记录添加了一张图片。这个指令的目的是防止浏览器将Angular表达式按照字面意思去读取，然后发起一个错误的请求URL <http://localhost:8000/app/{{phone.imageUrl}}>（比如我们这样写`<img src="{{phone.imageUrl}}">`）。使用`ngSrc`指令可以防止浏览器向错误的地址发起请求。

* * *

## 测试

`test/e2e/scenarios.js`：

```
...
    it('should render phone specific links', function() {
      var query = element(by.model('query'));
      query.sendKeys('nexus');
      element.all(by.css('.phones li a')).first().click();
      browser.getLocationAbsUrl().then(function(url) {
        expect(url).toBe('/phones/nexus-s');
      });
    });
...
```

我们给端到端测试添加了一项新的内容来验证应用生成了正确的链接。我们将会在接下来的步骤中实现它们。 你可以通过执行`npm run protractor`来观察测试运行。

## 课外扩展

将`ng-src`替换成原始的`src`属性，通过一些开发工具（比如Firebug或者Chrome开发者工具）来观察应用是否发起了错误的请求，比如说`/app/%7B%7Bphone.imageUrl%7D%7D`或者`/app/{{phone.imageUrl}}`造成这个问题的原因是浏览器会在读取到`<img>`标签的瞬间就向其地址发起请求，这时候Angular都还没有来得及计算表达式的结果呢。

## 总结

现在我们给列表添加了图片和连接，通过[step 7](/p/angular-tutorial-routing-and-multiple-views/)来学习Angular的布局模板以及Angular是如何让创建多页面应用变得简单的。
