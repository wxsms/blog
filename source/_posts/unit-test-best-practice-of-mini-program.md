---
title: '小程序单元测试最佳实践'
date: 2021-03-15T04:26:49.652Z
tags: [miniprogram,javascript,test]
---

微信小程序单元测试的可查资料少得可怜，由于微信官方开发的自动化测试驱动器 [miniprogram-automator](https://www.npmjs.com/package/miniprogram-automator) 不开源，唯一靠谱的地方只有这 [一份简单的文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)。然而实际使用下来发现文档介绍的方式有不少问题。

<!-- more -->

## 关于单元测试如何启动的问题

### 官方推荐的方式

官方推荐通过 [Jest](https://jestjs.io/) 来组织单元测试，这点我是认可的。文档上面标注的步骤是：

1. 启动并连接工具
2. 重新启动小程序到首页
3. 断开连接并关闭工具

代码：

```js
const automator = require('miniprogram-automator')

describe('index', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: 'path/to/miniprogram-demo'
    })
    page = await miniProgram.reLaunch('/page/component/index')
    await page.waitFor(500)
  }, 30000)

  afterAll(async () => {
    await miniProgram.close()
  })
})
```

乍一看没什么特别的问题，然而实际上跑了几次以后发现，它存在一个巨大的缺陷：**就是 `automator.launch` 这一操作相当耗时，启动一次至少要 30 秒**。

举例：

1. 项目定义了 10 套单元测试，每套测试都得重新走 `launch` 与 `close` 流程；
2. 使用 `watch` 方式启动 Jest，每次触发执行都要重新走 `launch` 与 `close` 流程；
3. 等等......

以上场景都将带来巨大的时间损耗，完全无法容忍。

因此，如何缩短这里的耗时将是重中之重。

### Jest 全局共享连接实例？

既然每个单元测试都要用到连接实例 `miniProgram`，那么大家共享同一个实例自然是我能想到的第一个办法。

#### globalSetup / globalTeardown

第一个办法是通过 [globalSetup](https://jestjs.io/docs/configuration#globalsetup-string) 与 [globalTeardown](https://jestjs.io/docs/configuration#globalteardown-string) 参数，为单元测试提供一个全局 setup 函数，并且它支持 async，看起来非常完美。

但是，在尝试过后发现并不起作用，在 setup 过程中挂载到 global 的属性无法从单元测试中读取，后来查阅文档才发现这个 setup 函数有一个致命的缺陷：

> Note: Any global variables that are defined through globalSetup can only be read in globalTeardown. You cannot retrieve globals defined here in your test suites.

原来，单元测试是运行在「沙盒」环境下的，彼此隔离，因此它们无法读取到来自外部的 global 变量。

在 [facebook/jest/issues/7184](https://github.com/facebook/jest/issues/7184) 中，有人提到可以在 setup 函数中用 `process.env.FOO = 'bar'` 这种方式来达成目的。经测试确实可以，但是问题在于：

1. process 下面只能挂载基础类型，不能挂载对象实例；
2. 实际上「它能工作」本身是一个 Bug，在 issue 内有人提到，它可能会在任意时间被修复。

因此，这个方案不可行。

#### setupFiles

第二个办法是使用 [setupFiles](https://jestjs.io/docs/configuration#setupfiles-array) 参数。

该方式支持 global 挂载，但是很遗憾，我不用尝试也知道，`setupFiles` 目前仅支持同步执行，无法满足需求。

见：[facebook/jest/issues/11038](https://github.com/facebook/jest/issues/11038)

#### testEnvironment

找到的第三个办法是使用 [testEnvironment](https://jestjs.io/docs/configuration#testenvironment-string) 参数。

该方式支持：

1. global 挂载
2. 异步执行

但是，依旧很遗憾，经过查阅文档发现，`testEnvironment` 并不是作用全局的，也就是说，它在每个单元测试执行时都会走一遍创建、销毁流程，跟最初的方式并没有本质区别。

#### 总结

由于 Jest 本身的设计问题，全局共享连接实例这个方案基本（至少目前）不可行。

### 将单元测试挪到一个文件下？

既然跨单元测试的变量共享不可行，那么第二个方向就是：将所有单元测试集合起来，共享一套环境。这样一来，大家自然就可以共享一个连接了。

```json5
// package.json
{
  "scripts": {
    // 注：指定了只执行 ./tests 下的测试
    "test": "node node_modules/jest-cli/bin/jest.js ./tests --runInBand --verbose",
    "test:watch": "npm run test -- --watchAll=true"
  },
  // ...
}

```

```js
// index.spec.js
const automator = require('miniprogram-automator')
const path = require('path')

let mp

const launchOptions = {
  // ...
}

beforeAll(async () => {
  mp = await automator.launch({ ...launchOptions })
  global.mp = mp
}, 60000)

afterAll(async () => {
  await mp.disconnect()
})

require('path/to/test1')
require('path/to/test2')
// more...
```

这样一来，各单元测试可以通过 `global.mp` 得到连接实例。实测也确实可行，仅需要启动一次就可以跑完所有单元测试。

但是，这种实现方式存在一些问题：

1. 所有单元测试被归总到了一个 test suit 内，测试结果的打印慢了许多，需要等到所有测试跑完才能看到结果；
2. 同理，无法利用好 Jest 的 watch 功能，无法做到开发时仅执行某个 test suit
3. 添加或删除了测试，需要手动更改 require 列表，相当麻烦
4. 该方式并未解决 watch 触发需要重启连接实例的问题，依旧相当耗时

### Launch or Connect?

由于官方文档给出的例子是使用 Launch 实现的，所以自然而然会从这方面入手寻找解决方案，但是走了这么多弯路以后还是不行，我开始考虑：是否可以绕过 Launch？

查看 [文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/automator.html) 以后发现，除了 `launch` 以外，`automator` 还提供了一个 `connect` 方法。

> **automator.connect**
> 
> 连接开发者工具。
> 
> `automator.connect(options: Object): Promise<MiniProgram>`

因此，我想到了一个办法：如果不通过 `launch`，直接 `connect` 至现有窗口，应该会快很多吧。

但是尝试后发现，即使在开发者工具中打开了服务端口，`connect` 也无法连接上，始终报错「端口未打开」。 后来通过搜索才发现，此「端口」非彼「端口」，如果要用过 websocket 连接，开发者工具就必须以 cli 方式加 `--auto` 参数启动才行。

因此，我也想到了最终解决方案：

1. 先尝试 `connect`，如果成功则进入测试
2. 如果失败，则执行 `launch`（该方式启动默认开启自动化）
3. 测试结束时，不调用 `close`，而是调用 `disconnect`

这样一来，第一次单元测试启动时会启动开发者工具，测试完成以后，连接会断开，但是开发者工具不会关闭。等到第二次启动时，automator 就能直接连上，无需再次启动。

编写 setup 文件（该文件不以 spec 结尾，只作为 mixin 使用）：

```js
// setup.js
const automator = require('miniprogram-automator')
const path = require('path')

let mp

const launchOptions = {
  // ...
}

beforeAll(async () => {
  try {
    mp = await automator.connect({
      wsEndpoint: 'ws://localhost:9420',
    })
  } catch (err) {
    console.error(err)
    try {
      mp = await automator.launch({ ...launchOptions })
    } catch (err) {
      console.error(err)
    }
  }

  global.mp = mp
}, 60000)

afterAll(async () => {
  await mp.disconnect()
})
```

在每个单元测试中引用 setup：

```js
// some-test.spec.js
describe('some-test', () => {
  require('path/to/setup')

  let page = null

  // ...
})
```

如此一来，以上发现的所有问题都能很好地解决：

1. 单元测试极大地提速
2. test suit 按照正常方式组织，无需额外操作
3. `watch` 模式也能正常使用，速度极快

但是，该方式同样带来了一个问题：即 test suit 不再拥有独立运行环境，每个 suit 要注意清理自己带来的影响。

不过，权衡利弊来说，肯定是好处远远大于坏处。

## 关于如何进行页面导航的问题

### 通过实例方法导航

[miniProgram](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/miniprogram.html) 实例提供了一系列的导航方法，如 `navigateTo`，`navigateBack` 等，经实践，能够正常使用。但是，它们有一个通病：**耗时明显**（又来了）。

经测试，在导航开始前记录时间，`await` 至导航结束，打印时间差，**每次导航耗时大概在 3000 毫秒以上**。具体表现为，页面虽然已跳转到位，但方法就是没有返回。由于驱动框架不开源，也并不知道在这段时间内它究竟做了什么。

```js
// 耗时在 3000ms 以上
page = await global.mp.navigateTo('/pages/index/index')
```

单元测试少的话可以容忍，但是一旦多起来了，也是非常浪费生命的。

### 通过页面元素导航

通过模拟页面内的导航元素点击来达到效果，这种方式耗时极短，500 毫秒内即可完成。虽然相比实例方法来说较为繁琐，但胜在量大的时候节省时间效果非常明显。

```js
// 耗时在 500ms 左右
const btn = await page.$('#some-nav-btn')
await btn.tap()
// 实际上所有耗时几乎都发生在这里，等待导航动画结束
await page.waitFor(500)
page = await global.mp.currentPage()
```

## 关于如何与原生元素交互问题

由于驱动不支持选择原生元素，也不支持对其进行交互，因此唯一的办法是通过 mock 修改其定义。

举例，要模拟 `wx.showModal` 的 `确定` 点击：

```js
await global.mp.mockWxMethod('showModal', {
  confirm: true,
  cancel: false
})
```

如此一来，当 `showModal` 被调用时，会直接进入 `confirm` 流程。

当然，测试结束后要记得 restore:

```js
await global.mp.restoreWxMethod('showModal')
```
