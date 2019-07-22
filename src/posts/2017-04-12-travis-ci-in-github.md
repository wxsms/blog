---
id: 'travis-ci-in-github'
title: 'Travis CI in Github'
date: 2017-04-12 17:35:00
categories:
  - CI
tags:
  - Github
  - Travis-CI
---

# Travis CI in Github


Travis CI 是一款免费的持续集成工具，可以与 Github 无缝集成。能够自动完成项目代码的日常测试、编译、部署等工作。现在，我把它应用到了我的两个项目中。

首先，要在这个平台上做持续集成的前提是到它上面 [https://travis-ci.org/](https://travis-ci.org/) 去注册个账号。实际上直接用 Github 账号进行 OAuth 登录就行了。登录以后可以在首页找到自己的所有仓库，在需要进行持续集成的项目前面的开关打开即可。开启后，Travis CI 会监听项目的代码推送与 PR，当发生改变时会立刻进行相应操作。

至于具体操作内容，由项目根目录的 `.travis.yml` 文件决定。这个文件的简单用法由下面两个具体例子来说明。

<!--more-->

## wxsms.github.io

该项目就是这个博客了。因为它是静态博客，所以代码上线前都要进行一次打包过程，在之前这个工作是手动完成的，主要的流程如下：

1. 在 `src` 分支上进行代码编辑，
2. 在 `src` 分支上 push
3. 在 `src` 分支上运行 `npm run post` 与 `npm run build` 分别生成文章与博客代码
4. 切换到 `master` 分支，将上一步打包编译出来的东西覆盖到相应目录下
5. 在 `master` 分支上 push
6. 切换回 `src` 分支

这些步骤看似简单却又容易出错，每次想要刷博客都必须做这么多事情，烦不胜烦。而且，Github 仓库会因为充斥了无意义的 `master` 历史记录而变得臃肿与难看。

现在有了 Travis CI，一切都将变得简单。

`.travis.yml` 文件内容：

```
language: node_js
cache:
  directories:
  - node_modules
node_js:
  - "node"
script:
  - npm run post
  - npm run build
  - npm run dist-config
deploy:
  - provider: pages
    skip_cleanup: true
    github_token: $GITHUB_TOKEN
    local_dir: dist
    target_branch: master
    on:
      branch: src
```

说明：

* `language` 指项目代码的语言，这里使用 `node_js`
* `cache` 是 Travis CI 会缓存的内容，比如一些依赖文件无需每次都完全安装。这里缓存了 `npm_modules` 这个目录
* `node_js` 这里指定 node 的版本，`node` 的意思是使用最新版
* `script` 则是 Travis CI 具体会去完成的工作，是有顺序关系的，如果没有指定，则默认是 `npm run test`，这里依次执行了 3 个脚本：
    * `npm run post` 打包文章
    * `npm run build` 打包代码
    * `npm run dist-config` 生成配置文件以及 Readme 等。前两步显而易见，至于第三步，因为 Travis 部署会是一个 force push 的过程，会删除原有分支上的所有内容，因此需要手动生成 Github 的 README.md 文件以及 Github Page 的 CNAME 文件。
* `deploy` 则是项目在所有脚本执行完成后会进行的部署操作，部署只会在脚本全部执行成功（返回 0）后进行
    * 这里使用 `page` 即 Github Page 方式部署。
    * `skip_cleanup` 这个参数用来防止 Travis 删除脚本生成的文件（删掉了就没意义了）
    * `github_token` 是我们 Github 账号的 Access Token，因为私密原因不能写在代码文件里，因此可以在此写一个变量 `$GITHUB_TOKEN`，然后在 Travis 相应的仓库设置中添加 `GITHUB_TOKEN` 环境变量，Travis 会在运行时自动替换
    * `local_dir` 是指需要部署的打包出来的目录，设置为 `dist` 目录
    * `target_branch` 即目标分支，Travis 会将为 `dist` 目录整个部署到 `master` 分支上去
    * `on` 则是附加条件。这里的含义应该是只监听 `src` 分支上的更改

因此，Travis 可以帮我完成以下工作

* 监听 `src` 分支上的改动
* 出现改动时，自动执行所有 build 步骤
* 如果 build 成功则将相应文件部署到 `master` 分支上去

如此一来，我自己需要做的事情就只剩下简单的两步了：

1. 在 `src` 分支上进行代码编辑
2. 在 `src` 分支上 push

在我无需关注发布过程的同时，Travis 还能帮我保持整个代码仓库的整洁（`master` 分支始终进行的都是 force push，不存在无用的历史记录），简直完美！

## uiv

这个项目其实也差不多，有些许变化：

* 脚本变为：
    * `npm run test` 执行测试
    * `npm run build` 打包代码
    * `npm run build-docs` 打包文档
* 需要将代码部署到 npm，而文档部署到 Github Page
* 代码与文档都只在版本发布时（Tagged）才进行部署

`.travis.yml` 文件内容：

```
language: node_js
cache:
  directories:
  - node_modules
node_js:
  - "node"
script:
  - npm run test
  - npm run build
  - npm run build-docs
after_success: 'npm run coveralls'

deploy:
  - provider: npm
    skip_cleanup: true
    email: "edisond@qq.com"
    api_key: $NPM_TOKEN
    on:
      tags: true
      branch: master
  - provider: pages
    skip_cleanup: true
    github_token: $GITHUB_TOKEN
    local_dir: docs
    on:
      tags: true
      branch: master
```

这个配置文件多了一些内容：

* `after_success: 'npm run coveralls'` 这个是在所有脚本成功以后执行的，目的是与 Coveralls 集成来在项目仓库上添加测试覆盖率的集成，这个在后面说
* `deploy` 中增加了 `npm` 一项，配置内容跟 `pages` 基本一致，其中不同的：
    * `email` 是用来发布的 npm 账户邮箱名
    * `api_key` 是用来发布的 npm 账户 token，可以在本地 `~/.npmrc` 文件中找到（前提是本地电脑的 npm 已登录）
    * `on` -> `tags: true` 这个标志是说只在带有标签的 Commit 推送时才进行 deploy
* Github Page 的部署配置中也加入了 `on` -> `tags: true`，起的是一样的作用。这里的 Github Page 是从 master 分支的 docs 文件夹 deploy 到 gh-pages 分支（gh-pages 是 Github Page 的默认分支，所以不用配置 `target_branch` 项）

这样一来，Travis 就可以：

* 在日常 push 的时候执行 test and build 脚本，但不发布
* 在版本 push 的时候执行 test and build 脚本，全部成功则将内容分别发布到 NPM 与 Github Pages

完美！

## 关于 Coveralls

Coveralls [https://coveralls.io/](https://coveralls.io/) 是一个将代码测试覆盖率集成到 Github 的工具，在 Travis 的加持下，算是锦上添花的一项。同样，到相应网站注册账号是第一步。

由于 vue-cli 生成的项目默认已经附带了代码测试覆盖率的检测，我要做的只是把这个结果上传而已。

步骤：

1. `npm install coveralls --save-dev`
2. 将 `"coveralls": "cat test/unit/coverage/lcov.info | ./node_modules/.bin/coveralls"` 添加到 npm scripts 中。注意：cat 的路径是随项目不同而改变的
3. 在 `.travis.yml` 中添加 `after_success: 'npm run coveralls'` 配置项

它可以：

1. 在测试完成后生成覆盖率文件（这一步 vue-cli 已经做了）
2. 将文件内容传给 `coveralls`，这个模块可以将结果从 Travis 上传到 Coveralls 平台
3. Github 上会 by commit 地显示测试率是增加还是降低了

## 总结

持续集成的好处无需多言，反正 Travis 就是一个免费的、能与 Github 集成的持续集成工具（实际上其它开源平台也可以，以及可以付费为私有项目提供服务）。简单、易用。

这些配置看似简单，却花费了我大量时间去摸索。由于只能通过不断推送 commit 的方式来触发 build 并验证配置的正确性，其过程异常繁琐，但是现在看来是十分值得的！

BTW：测试用的 commit 事后可以用本地 reset 与 force push 干掉。
