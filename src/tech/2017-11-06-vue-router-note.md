---
permalink: '/posts/2017-11-06-vue-router-note.html
title: 'Vue-Router Note'
date: 2017-11-06T02:47:50.094Z
categories: [JavaScript]
tags: [Vue, Router]
sidebar: false
draft: false

---




Vue Router ([https://github.com/vuejs/vue-router](https://github.com/vuejs/vue-router)) 使用笔记。虽然[官方文档](https://router.vuejs.org/)比较详尽，但实际用起来依然有些地方需要特别注意的（其实主要是我的个人需求）。

<!--more-->

## Scroll Behaviours

文档上有 scroll behaviours 的示例，但实际上用起来不太完美，还需要自己改造一下。需要注意的是 `scrollBehavior` 必须搭配 `history` 模式，否则代码无效且无任何错误信息。

上面说到**不完美**的地方主要是在模拟 'scroll to anchor' 这一行为时，文档的代码是不够好的：

```javascript
scrollBehavior (to, from, savedPosition) {
  if (to.hash) {
    return {
      selector: to.hash
    }
  }
}
```

这里实际上会调用 `querySelector(to.hash)` 来实现滚动，但是用起来会发现有些时候这段会报错，因为类似 `#1-anything` 这样的数字（或者其他非字母字符）打头的 hash 作为 selector 是 **Invalid** 的。但是要修复只需要稍微改动一下就好了：

```javascript
if (to.hash) {
  return {
    selector: `[id='${to.hash.slice(1)}']`
  }
}
```

所以一段完善的 scroll behaviour 代码应该是：

```javascript
scrollBehavior (to, from, savedPosition) {
  if (to.hash) {
    return {
      selector: `[id='${to.hash.slice(1)}']`
    }
  } else if (savedPosition) {
    return savedPosition
  } else {
    return {x: 0, y: 0}
  }
}
```

它可以做到在路由变化时：

1. 有锚点时滚动到锚点
2. 有历史位置时滚动到历史位置
3. 都没有时滚动到页头

## Lazy Loading

官方的 Lazy load 示例代码换了很多茬，比如之前有类似 `require('...', resolve)` 的，还有用 `System.import` 的，但是它们并不能向后兼容，所以如果用的是新版本的话，并不能够直接 copy 旧项目的方式。目前感觉会稳定下来的方式是：

```javascript
const Foo = () => import('./Foo.vue')
```

但是这里又有一个注意点，以上语法必须引入一个 babel 插件 [syntax-dynamic-import](https://babeljs.io/docs/plugins/syntax-dynamic-import/) 才行：

```bash
npm install --save-dev babel-plugin-syntax-dynamic-import
```

**.babelrc**

```json
{
  "plugins": ["syntax-dynamic-import"]
}
```

以上就可以在 webpack + babel 的环境下实现代码分块了。

## Progress

经常会有这样的需求（尤其是使用 lazy load 时）：路由跳转时提供一个进度条（像 Github 头部那种），然而 Vue Router 没有提供这方面的示例。经过实际使用发现，并不需要刻意使用 Vue 封装的进度条，比如说轻量级的 [nprogress](https://github.com/rstacruz/nprogress) 也可以很好地搭配使用。

但是需要注意的是，Vue Router 会将 hash 跳转也视为一次 route 跳转，因此如果在全局钩子中注册 progress 方法的话，那么它也会在 hash 跳转中出现，实际上应该是不需要的。所以需要一点点判断：

```javascript
import NProgress from 'nprogress'

// ...

router.beforeEach((to, from, next) => {
  // not start progressbar on same path && not the same hash
  // which means hash jumping inside a route
  if (!(from.path === to.path && from.hash !== to.hash)) {
    NProgress.start()
  }
  next()
})

router.afterEach((to, from) => {
  // Finish progress
  NProgress.done()
})
```

以上就是一个简单的页面跳转进度条示例，它会在**除了同页 hash 跳转以外的所有页面跳转**行为发生时，在页头显示一个简单的进度条。

## Active Style

当使用 `<router-link>` 的时候，Vue Router 会自动给当前路由的 link 加一个 active class，用来做 nav menu 时非常方便。但是有一点需要注意的是，它默认并不是一个精确匹配的模式，而是一个 **matchStart**，比如说 `<router-link to="/a">` 会被一个 `/a/b` 的路由激活，更甚者，`<router-link to="/">` 会被所有路由激活（真的）。然而这一般来说都不会是想要的结果。

在老旧版本（0.x）的 Vue-Router 中这个问题是无解的，现在则**可以使用 `<router-link exact>` 来将它转换为精确匹配**。

## Route Reuse

当使用 `<router-view>` 时，默认会启用组件复用，也就是说在可能的情况下，作为路由页面的组件不会被销毁重建，而是直接复用。

就好像一个博客的文章页面，一般来说会是给出这样的路由配置：`/post/:id`，那么在从 `/post/1` 跳转到 `/post/2` 的时候，实际上路由组件是不会重建的。

有时候我们会想要避免这样的事情发生，因为一个路由可能在创建的时候有比较多的逻辑（如数据动态获取、判断等），如果它在路由变化的时候直接复用的话，那么 `mount` 方法将不再被调用，我们还要为 `update` 再写一套类似的逻辑。**更过分的是**，其所用到的所有子组件也不再会执行 `mount` 方法，那么我们要为所有子组件编写 `update` 方法。非常麻烦。

不知道为什么，老版本的文档是有为这种情况提供解决方案的，但是在现在的文档里面找不到了。实际上很简单：

```html
<router-view :key="$route.path"></router-view>
```

就这样就可以了。如此一来，**只要在 `$route.path` 变化的时候，路由组件就会被销毁重建**。用一点点的性能损耗，节省大量冗余代码。

当然这里也可以使用定制化逻辑来控制，比如使用 computed value 来实现更复杂的复用逻辑。
