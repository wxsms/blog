---
permalink: '/posts/2016-11-16-static-blog-built-with-vue.html
title: Static Blog Built with Vue
date: 2016-11-16 16:55:00
categories:
  - Personal

---




博客再次迁移，这次是从 Wordpress 转向静态博客（自建）。

技术栈:

* 前端：vue + vue-router + vuex + bootstrap + webpack
* 服务端：没有
* 数据库：没有

整站打包后，一次加载所有资源（HTML + CSS + JS + DATA）300K 不到（gzip 后 80K+），秒速渲染，与先前真的是天差地别。

图片资源从本地服务器搬迁到免费云。 写作使用 Markdown，从此 IDE 写博客不是梦。

代码地址：[https://github.com/wxsms/wxsms.github.io/tree/src](https://github.com/wxsms/wxsms.github.io/tree/src)
