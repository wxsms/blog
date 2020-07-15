---
permalink: '/posts/2017-06-08-vue-components-i18n.html'
title: '为 Vue 组件库实现国际化支持'
date: 2017-06-08 15:27:00
categories:
  - JavaScript
tags:
  - Vue
  - i18n

---

[[toc]]


其实这部分代码主要是参考着 element ui 和 iview 做的（iview 又是抄的 element），对关键代码进行了一些简化。主要需要实现的需求有：

1. 用户可以更改、切换组件库使用的语言（应用级别）
1. 用户可以自定义组件使用的措辞
1. 兼容 `vue-i18n` 这个库

<!--more-->

## 关键代码

### src/locale/lang/en-US.js

首先是 Locale 文件，把措辞映射到一个 key 上面去，比如说英文：

```javascript
export default {
  uiv: {
    datePicker: {
      clear: 'Clear',
      today: 'Today',
      month: 'Month',
      month1: 'January',
      month2: 'February',
      // ...
    }
  }
}
```

对应的中文文件只需要把相应的 Value 翻译成中文即可。这里有一个最基本的设想就是，**如果需要增加一种语言，应该是只需要增加一个这样的文件即可**。

### src/locale/index.js

```javascript
import defaultLang from './lang/en-US'
let lang = defaultLang

let i18nHandler = function () {
  const vuei18n = Object.getPrototypeOf(this).$t
  if (typeof vuei18n === 'function') {
    return vuei18n.apply(this, arguments)
  }
}

export const t = function (path, options) {
  let value = i18nHandler.apply(this, arguments)
  if (value !== null && typeof value !== 'undefined') {
    return value
  }
  const array = path.split('.')
  let current = lang

  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i]
    value = current[property]
    if (i === j - 1) return value
    if (!value) return ''
    current = value
  }
  return ''
}

export const use = function (l) {
  lang = l || lang
}

export const i18n = function (fn) {
  i18nHandler = fn || i18nHandler
}

export default {use, t, i18n}
```

这段代码乍一看挺复杂，其实弄明白后就很简单：

1. `i18nHandler` 是用来检测并套用 `vue-i18n` 的，如果用户安装了这个插件，则会使用绑定在 Vue 实例上的 `$t` 方法进行取值
1. `t` 方法是用来取值的。首先看能否用 `i18nHandler` 取到，如果能取到则直接用，取不到就要自行解决了。最后返回取到（或者取不到，则为空）的值。
1. `use` 与 `i18n` 这两个方法是在整个组件库作为插件被 Vue 安装的时候调用的，主要用来让用户自定义语言等等。
 
原版的 `t` 方法有一个与之配合的模板字符串替换的方法（比如说处理 `My name is ${0}` 这种 Value），这里简洁起见把它删掉了，实际上也暂时用不到。

### src/mixins/locale.js

一个 mixin，很简单：

```javascript
import { t } from '../locale'

export default {
  methods: {
    t (...args) {
      return t.apply(this, args)
    }
  }
}
```

就是给组件加上一个 `t` 方法。那么现在组件在需要根据语言切换的地方，只要加入这个 mixin 并在输出的地方使用 `t(key)` 即可，比如 `t('uiv.datePicker.month1')` 在默认的配置下会使用 `January`，而如果用户配置了中文则会使用 `一月`。

### src/components/index.js

最后一步：将上述的两个方法 `use` 和 `i18n` 写入到组件库入口的 `install` 方法中去。

```javascript
const install = (Vue, options = {}) => {
  locale.use(options.locale)
  locale.i18n(options.i18n)
  // ...
}
```

## 如何使用

### 简单用法

切换中文：

```javascript
import Vue from 'vue'
import uiv from 'uiv'
import locale from 'uiv/src/locale/lang/zh-CN'

Vue.use(uiv, { locale })
```

显然, 如果对预设的措辞不满意，我们还可以自定义, 只需要创造一个 `locale` 对象并替换之即可。

### 配合 Vue I18n 使用

只要跟着 `vue-i18n` 的文档把自己的 App 配好就行，不用管组件库，会自动适配。**但有一点要注意：需要先将 组件库的语言包合并到 App 语言包中去**。比如：

```javascript
import uivLocale from 'uiv/src/locale/lang/zh-CN'

let appLocale = Object.assign({}, uivLocale, {
  // ...
})

// 接下来该干嘛干嘛
```
