---
permalink: '/posts/2020-10-12-cache-yarn-in-github-actions.html'
title: 'Cache Yarn in Github Actions'
date: 2020-10-12T05:46:53.173Z
tags: [CI,nodejs]
---

<!-- 「」 -->

在 CI 中缓存安装下来的依赖项是提速的关键，[Github Actions 官方文档](https://docs.github.com/en/free-pro-team@latest/actions/guides/caching-dependencies-to-speed-up-workflows) 提供了如下方案 (NPM)：

<!-- more -->

```
jobs:
  build:
    # ...
    - name: Cache node modules
      uses: actions/cache@v2
      env:
        cache-name: cache-node-modules
      with:
        # npm cache files are stored in `~/.npm` on Linux/macOS
        path: ~/.npm
        key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-build-${{ env.cache-name }}-
          ${{ runner.os }}-build-
          ${{ runner.os }}-
    - name: Install Dependencies
      run: npm install
    # ...
```

Yarn 则复杂，多了一步操作（[文档](https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/examples.md#node---yarn)）:

```
- name: Get yarn cache directory path
  id: yarn-cache-dir-path
  run: echo "::set-output name=dir::$(yarn cache dir)"
- uses: actions/cache@v1
  id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
  with:
    path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-
```

这些方案可以说是又臭又长，我只想简单做个 cache，何必让我关心那么多东西？项目多的话，简直疯了。看看人家 Gitlab 的方案：

```
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
```

简单、明确。

因此，我找到了这个 action [c-hive/gha-yarn-cache](https://github.com/c-hive/gha-yarn-cache) 作为替代，现在代码可以简化为：

```
jobs:
  build:
      # ...
      - uses: c-hive/gha-yarn-cache@v1
      - run: yarn --frozen-lockfile
      # ...
```

一行解决。
