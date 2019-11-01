---
permalink: '/posts/2016-11-05-node-js-web-spider-note-2.html
title: 'Node.js Web Spider Note - 2'
date: 2016-11-05T14:45:26+00:00
categories:
  - JavaScript
tags:
  - NodeJs
  - Spider

---



## Cookie & Session

HTTP 是一种无状态协议，服务器与客户端之间储存状态信息主要靠 Session，但是，Session 在浏览器关闭后就会失效，再次开启先前所储存的状态都会丢失，因此还需要借助 Cookie

一般来说，网络爬虫不是浏览器，因此，只能靠手动记住 Cookie 来与服务器“保持联系”。

### Cookie

Cookie 是 HTTP 协议的一部分，处理流程为：

  * 服务器向客户端发送 cookie 
      * 通常使用 HTTP 协议规定的 set-cookie 头操作
      * 规范规定 cookie 的格式为 name = value 格式，且必须包含这部分
  * 浏览器将 cookie 保存
  * 每次请求浏览器都会将 cookie 发向服务器

因此，爬虫要做的工作就是模拟浏览器，识别服务端发来的 Cookie 并保存，之后每次请求都带上 Cookie 头。

在 Node.js 中有很多与 Cookie 处理相关的 package，就不再赘述。

### Session

Cookie 虽然方便，但是由于保存在客户端，可保存的长度有限，且可以被伪造。因此，为了解决这些问题，就有了 Session

区别：

  * Cookie 保存在客户端
  * Session 保存在服务端

Cookie 与 Session 储存的都是客户端与服务器之间的会话状态信息，它们之间主要靠一个秘钥来进行匹配，称之为 `SESSION_ID` ，如 express 中默认为 `connect.sid` 字段。只要浏览器发出的 SESSION\_ID 与服务器储存的字段匹配上，那么服务器就将其认作为一个 Session，只要 SESSION\_ID 的长度足够大，几乎是不可能被伪造的。因此，敏感信息储存在 Session 中要比 Cookie 安全得多。

常见的 Session 存放媒介有：

  * RAM
  * Database
  * Cache (e.g. Redis)

Session 不是爬虫可以接触到的东西。

## AJAX 页面

对于静态页面（服务端渲染），使用爬虫不需要考虑太多，把页面抓取下来解析即可。但对于客户端渲染，尤其是前后端完全分离的网站，一般不能直接获取页面（甚至没有必要获取页面），而是转而分析其实际请求内容。

### 请求分析

通过一些请求拦截分析工具（如 Chrome 开发者工具）可以截获网站向服务器发送的所有请求以及相应的回复。

包括（不限于）以下信息：

  * 请求地址
  * 请求方法（GET / POST 等）
  * 所带参数
  * 请求头

只要把信息尽数伪造，那么爬虫发出的请求照样可以从服务器取得正确的结果。

### 秘钥处理

一些请求中会带有秘钥（token / sid / secret），可能随除了请求方法外的任一个位置发出，也可能都带有秘钥。更可能不止一个秘钥。

理论上来说，正常客户端取得秘钥有两种方式：

  * 服务端提供
  * 客户端自行计算，由服务端校对

对于服务端提供给客户端的秘钥，只要仔细分析 HTML 或服务端返回的 Cookie Header 就一定能发现。

而对于客户端自行计算的秘钥则比较麻烦了，尤其是在 JS 代码加密、混淆的情况下。这种时候，只能自己去用开发者工具调试原始站点代码，找出加密代码段，并在爬虫中实现。这里面有许多技巧，如各种断点、单步调试等。

## 表单处理

表单实际上也是 HTTP 请求，使用 GET / POST 等方法即可模拟表单提交。然而这不是重点。重点是表单常常伴随着验证码而存在。

验证码的识别暂未涉及。

## 浏览器模拟

爬虫的下下策才是使用浏览器完全模拟用户操作。实在是属于无奈之举。Nodejs 可以驱动 Chrome 与 Firefox 浏览器，存在相应的 Package，但是，更方便的是使用各种 E2E Testing 工具。

比如 Night Watch JS：

```
module.exports = {
 'Demo test Google' : function (client) {
 client
 .url('http://www.google.com')
 .waitForElementVisible('body', 1000)
 .assert.title('Google')
 .assert.visible('input[type=text]')
 .setValue('input[type=text]', 'rembrandt van rijn')
 .waitForElementVisible('button[name=btnG]', 1000)
 .click('button[name=btnG]')
 .pause(1000)
 .assert.containsText('ol#rso li:first-child',
 'Rembrandt - Wikipedia')
 .end();
 }
};
```

在这种模式下，Cookie / Session / 请求等各种细节都不用关心了。只需要按部就班地执行操作即可。模拟浏览器的代价是效率太低，内存开销大，但在某些特定需求情况下，却比一般爬虫要简单得多。

&nbsp;
