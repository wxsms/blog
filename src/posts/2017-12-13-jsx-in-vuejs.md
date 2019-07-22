---
id: 'jsx-in-vuejs'
title: 'JSX in Vue.js'
date: 2017-12-13T04:41:42.021Z
tags: [Vue, JSX, Babel, Webpack]
index: true
draft: false
---

在基于 Webpack 的 Vue 项目中添加 JSX 支持：

```
$ yarn add babel-plugin-syntax-jsx babel-plugin-transform-vue-jsx babel-helper-vue-jsx-merge-props --dev
```

各依赖的作用：

* `babel-plugin-syntax-jsx` 提供基础的 JSX 语法转换
* `babel-plugin-transform-vue-jsx` 提供基于 Vue 的 JSX 特殊语法
* `babel-helper-vue-jsx-merge-props` 是可选的，提供对类似 `<comp {...props}/>` 写法的支持

然后在 `.babelrc` 中，增加：

```
{
  ...
  "plugins": [
    "transform-vue-jsx",
    ...
  ]
  ...
}
```

注意如果有其它 env 也要如此加上 `transform-vue-jsx` 插件。

<!-- more -->

## Difference from React JSX

```javascript
render (h) {
  return (
    <div
      id="foo"
      domPropsInnerHTML="bar"
      onClick={this.clickHandler}
      nativeOnClick={this.nativeClickHandler}
      class={{ foo: true, bar: false }}
      style={{ color: 'red', fontSize: '14px' }}
      key="key"
      ref="ref"
      refInFor
      slot="slot">
    </div>
  )
}
```

需要注意的是，事件绑定中，还有另外一个跟 react 不一样的地方：`onMouseEnter` 是不起作用的，只能写 `onMouseenter` 或者 `on-mouseenter`，以此类推。

## Vue directives

除了 `v-show` 以外，所有的内置指令都**不能**在 JSX 中工作。

自定义指令可以使用 `v-name={value}` 的写法，但是这样会缺少修饰符以及参数。如果需要完整的指令功能，可以这么做：

```javascript
const directives = [
  { name: 'my-dir', value: 123, modifiers: { abc: true } }
]

return <div {...{ directives }}/>
```
