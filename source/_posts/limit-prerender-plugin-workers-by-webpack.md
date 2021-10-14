---
title: Limit Prerender Plugin Workers By Webpack
date: 2017-10-29T02:51:17.412Z
tags: [vue, webpack, devops]
---


[Prerender SPA Plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 是一个可以将 Vue 页面预渲染为静态 HTML 的 webpack 插件，对静态小站（比如博客）来说很棒棒。但是最近用的时候总发现一个问题：它的 build 失败率越来越高，尤其是在 CI 上。后来在其 repo 的一个 [issue](https://github.com/chrisvfritz/prerender-spa-plugin/issues/53) 中发现了问题所在，就是它没有限制 PhantomJS workers 的数量，导致页面一多就直接全部卡死不动，然后超时。

> (Workers) Default is as many workers as routes.

虽然有人已经发了 [PR](https://github.com/chrisvfritz/prerender-spa-plugin/pull/55) 来修复这个问题，然而好几个月过去了也没有 merge，不知道是什么情况。于是我在自己的尝试中找到了一种可以接受的解决方案：虽然我不能限制你插件 workers 的数量，但是可以限制每个插件渲染的 route 数量呀。

<!-- more -->

具体思路就是：

1. 将所有的 route chunk 成小组，比如 10 个一组
2. 针对每一个 chunk 创建一个 prerender 插件
3. 将所有插件都加入到 webpack plugin 中去

这样一来，就可以保证每个 plugin 最多同时创建 10 个 worker，全部渲染完成后再由下一个 plugin 接着工作。

简单的代码示例：

```javascript
// Generate url list for pre-render
exports.generateRenderPlugins = () => {
  let paths = [] // the routes
  let chunks = _.chunk(paths, 10) // using lodash.chunk
  let plugins = []
  let distPath = path.join(__dirname, '../dist')
  let progress = 0
  chunks.forEach(chunk => {
    plugins.push(new PrerenderSpaPlugin(distPath, chunk, {
        postProcessHtml (context) {
          // need to log something after each route finish
          // or CI will fail if no log for 10 mins
          console.log(`[PRE-RENDER] (${++progress} / ${paths.length}) ${context.route}`)
          return context.html
        }
      }
    ))
  })
  return plugins
}
```
