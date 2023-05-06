---
title: IE Cache Issue
date: 2016-01-06T17:12:47+00:00
tags: [expressjs,ie,nodejs]
---

昨天发现了一个奇怪的问题，一个Web Application Update Entity的功能，在Chrome/Firefox上测试都正常运行，到了IE 11上就不行了，主要表现就是Update成功以后再次读取记录会读取出Update之前的值。功能逻辑就是一些简单的通过RESTful API来执行CRUD操作的Ajax调用。在IE上用控制台仔细调试一番后，发现在打开控制台的时候居然能表现正常，而关掉以后就立刻不行，这明显就是IE爸爸不走寻常路，把API也Cache下来了。于是就有了以下的解决方案。

<!-- more -->

## 前端解决方案

既然是因为Cache产生的问题，那么就很容易解决，在API调用（主要是GET）中都添加一个随机数或者时间戳就行了，强制浏览器刷新。比如，原本请求的应该是这样的地址：

```javascript
var url = '/api/metadata/entity/list?type=car&name=qq'
```

可以通过添加一个时间戳修改成这样：

```javascript
var url = '/api/metadata/entity/list?type=car&name=qq&_t=' + new Date().getTime()
```

其中添加的 `_t` 参数如果服务端没有定义的话就会自然而然地被扔掉（如果是有意义的参数就换个key，或者不写key也行），浏览器缓存也会因为每次请求的URL实际上都不一样而失效，这样问题就解决了。但是，对于一个大型项目来说，如果每个URL都要怎么来一遍，那么用软件工程界的专业术语来说，叫做不好维护。很有可能什么时候漏掉了一个URL没有加时间戳，就埋下了一个BUG的种子。

## 服务端解决方案

此处以使用ExpressJS搭建的NodeJS服务器为例，其它代码也可以使用类似的方法达到同样的效果。

以下是一本万利的解决思路：

```javascript
// No cache for RESTful APIs
    app.use('/api/*', function (req, res, next) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        next();
    });
```

这段代码所做的事情是，对于所有进来的以 `/api` 开头为路由的请求，都执行以下操作：

  * 给响应头添加 `"Cache-Control": "no-cache, no-store, must-revalidate"` 键值对
  * 给响应头添加 `"Pragma": "no-cache"` 键值对
  * 给响应头添加 `"Expires": 0` 键值对
  * 将请求交给下游中间件，继续处理，该干嘛干嘛

Cache-Control ：

  * no-cache：指示请求或响应消息不能缓存
  * no-store：用于防止重要的信息被无意的发布。在请求消息中发送将使得请求和响应消息都不使用缓存。
  * must-revalidate：字面理解，必须重新验证

Pragma ：

  * no-cache：在HTTP/1.1协议中，它的含义和Cache- Control:no-cache相同

Expires：

  * 自然就是缓存的过期时间了

那么通过以上方法，只要浏览器是支持基本HTTP协议的，它就应该能够做出相应的操作，从而不对API进行缓存。很显然这段代码应该在所有API的具体方法执行之前被执行，对于Express来说我们只需要把它放在其他路由代码之前就可以了。

## 总结

经过验证，两种方法都可以达到预期的效果。至于实际使用哪一种，可能还要视具体需求而定。
