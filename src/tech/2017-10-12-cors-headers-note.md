---
permalink: '/posts/2017-10-12-cors-headers-note.html
title: 'CORS Headers Note'
date: 2017-10-12T06:44:39.617Z
categories: [Web-Front-end]
tags: [Ajax, HTTP, NodeJs]
sidebar: false
draft: false

---




CORS HTTP Header 是解决 Ajax 跨域问题的方案之一。详情查看：[MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)

这篇文章主要是记录使用过程中遇到的问题以及解决方案。

<!--more-->

## 客户端

客户端正常情况无需特殊配置。但有一些需要注意的地方。

### 请求预检

CORS 请求与非跨域请求不一样的是，它会将请求分成两种类型：**Simple Request（简单请求）**与**Preflighted Request（预检请求）**。

#### Simple Request

满足[所有条件](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests)的请求为简单请求。

看了文档以后发现跟普通请求别无二致。

#### Preflighted Request

满足[任一条件](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests)的请求为预检请求。

与简单请求不同，预检请求要求必须首先使用 `OPTIONS` 方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求，以避免跨域请求对服务器的用户数据产生未预期的影响。

![预检请求示意图](https://mdn.mozillademos.org/files/14289/prelight.png)

所以，实际上这种跨域请求会产生两次 HTTP Request：一个预检请求，以及预检成功后的真正的请求。由于预检请求使用 `OPTIONS` 方法而不是常见的 `POST` 等，因此服务器必须为跨域 API 提供能够正确返回的相应方法。

### 身份验证

如果需要进行 Cookie / Session / HTTP Authentication 等操作，则必须在进行 Ajax 请求时带上一个 `withCredentials` 参数。至于如何带这个参数，每个 Lib 应该都有自己的配置方式，下面是两个例子。

Raw Ajax Example:

```javascript
var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/credentialed-content/';
    
function callOtherDomain(){
  if(invocation) {
    invocation.open('GET', url, true);
    invocation.withCredentials = true;
    invocation.onreadystatechange = handler;
    invocation.send(); 
  }
}
```

Using Axios Example:

```javascript
let corsAgent = axios.create({
  withCredentials: true
})
```

## 服务端

服务端的配置并不是只需要给请求响应加个 `Access-Control-Allow-Origin` Header 这么简单，还有其它需要处理的地方。因此自己做远不如直接使用相关 Lib 来得方便。比如：

* [Express CORS](https://github.com/expressjs/cors)
* [Koa CORS](https://github.com/koajs/cors)

### withCredentials

当启用 `withCredentials` 参数后，`Access-Control-Allow-Origin` 将不能设置为 `*` （允许所有域名），必须指定为唯一的域名，否则预期的效果将无法达到。由于这个规则不会产生 Warning 或 Error，出了问题不了解情况的话还是比较难发现的。

可以预见（事实）的是，当 `Access-Control-Allow-Origin` 指定了唯一域名后，使用其它域名访问该 API 也会出现无效的问题。不过相应地也有一个取巧的办法，就是将它设置为 Request 的 Origin Header，这样一来问题就解决了。
