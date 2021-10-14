---
title: 'Upgrade Projects Built by vue-cli'
date: 2017-12-18T12:08:22.025Z
tags: [vue,webpack]
---

使用 [vue-cli](https://github.com/vuejs/vue-cli) 创建的脚手架项目，目前最大的问题是创建后无法自动地进行升级。虽然 3.0 版本已经计划将其作为头等大事来进行改善 ([#589](https://github.com/vuejs/vue-cli/issues/589))，但是现行的版本依然要面对它。以下基于 webpack template 来进行升级时的一些要点解析。

<!-- more -->

## 依赖

项目整体升级的一个重要目的体现在依赖的升级，如 webpack 从老版本 2 升级到 3，以及 babel / eslint 等各种配套工具的升级（至于 Vue 反倒不是什么大问题）。

在对依赖进行升级的时候主要有两个参考：

* 目前最新的脚手架 ([vuejs-templates/webpack](https://github.com/vuejs-templates/webpack)) 依赖版本
* `yarn outdated` (or npm) 给出的建议版本

outed version 如果是 MINOR / PATCH 更新，直接 upgrade 即可。如果是 MAJOR 更新则需要到相应项目主页上确认一下 breaking changes 是否对自己有影响。

以下列举一些主要的依赖。

### Webpack

Webpack 2 -> 3 其实是无痛升级的。也就是说基本不用更改什么配置。

### ESLint

ESlint 及其相关库的升级也没什么需要特别注意的地方，因为它并不参与最终构建。只不过升级以后可能会有 lint failed cases （因为新版本一般会添加新的 rules），注意修复即可。

### Babel

Babel 相关的升级是最麻烦（也是最头疼）的一部分。其主要问题体现在：

* 其直接参与代码构建，影响巨大，需要特别谨慎
* Babel 作为一个重要工具有一定的学习成本
* Babel 相关库变更较为频繁，典型的如 `babel-preset-latest` 库废弃并被 `babel-preset-env` 替代，而后者在最新的版本中又变成了 `@babel/preset-env`，甚至 `babel-core` 也废弃了，变成了 `@babel/core`

在经过了几次的迁移尝试后，建议**目前**的方案是：

* 进行 MINOR 升级，如果还在使用 `babel-preset-latest` 可以将其替换为 `babel-preset-env`（注意两者的配置大致一样，但略有不同，需要仔细比对）
* 暂时不要将 babel 升级至 7.x-beta
* 暂时也不要使用 `@babel` 类型的依赖（实测中出现奇怪的报错，难以追踪、搜索）
* 等待 Vue.js 社区给出解决方案

### AutoPrefixer

将 `autoprefixer` 从 6.x 升级到 7.x 时，注意将 `package.json` 中的 `browserlist` 改成 `browserslist` （一个 s 的区别）

## 配置文件

这里说的配置文件主要有两方面：Babel 以及 Webpack

### Babel

最简单的操作是，直接到 [vuejs-templates/webpack](https://github.com/vuejs-templates/webpack) 找到最新的 babel 文件，复制更新的内容下来即可。当然要注意自己已经更改过的内容不要被覆盖。

### Webpack

Webpack 配置稍微麻烦一些，主要体现在 `webpack.base.conf.js` 以及 `webpack.prod.conf.js`，个人总结的升级步骤：

1. 先升级 Webpack 相关工具到最新版本
2. 打开官方项目，对文件进行比对并更新相应内容（一般 `webpack.prod.conf.js` 会有较多内容更新，而且主要是 `plugins` 配置项）
3. 如果遇到目前没有安装的依赖则安装之

当然这只适用于 Webpack 2 -> 3 的升级，至于 1 -> 2 或者 1-> 3 没试过，不好说。

做完以上操作，跑过所有 npm scripts 一切正常的话，项目脚手架升级就基本完成了。这个过程说难不难，但是如果对 Webpack / Babel 不熟悉的话还是挺痛苦的，期待 vue-cli 3.0 可以带来更优秀的脚手架解决方案，达到类似 Nuxt.js 的效果，彻底解决升级烦恼。
