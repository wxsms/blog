---
permalink: '/posts/2020-11-02-publish-using-github-action.html'
title: 'Publish using GitHub Action'
date: 2020-11-02T08:25:10.612Z
tags: []
---

一些常用发布动作的总结。需要注意的是，以下所提到的 `secrets.GITHUB_TOKEN` 均是 GitHub Action 内置的 Access Token，无需自行创建。而其它 Token 则需要在项目主页 `Settings` -> `Secrets` 处创建。

强烈建议将所有 Publish actions 分开执行，不要集中到一个 Workflow 内。原因是如果其中一个动作因为某些原因失败了，GitHub 目前只能重启整个 Workflow，而如果 Workflow 内某个 job 已经成功了，那么该 job 下一次执行必然是失败，因此这一个提交的 Workflow 将永远不可能成功。

<!-- more -->

## GitHub Pages

发布 GitHub Pages 使用的是 [crazy-max/ghaction-github-pages](https://github.com/crazy-max/ghaction-github-pages) 这个 action：

```yaml
  deploy_gh_pages:
    runs-on: ubuntu-latest
    steps:
      # checkout & yarn
      - uses: actions/checkout@v2
      - uses: c-hive/gha-yarn-cache@v1
      - run: yarn --frozen-lockfile
      # build
      - run: npm run build
      - name: GitHub Pages
        uses: crazy-max/ghaction-github-pages@v2.1.3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          target_branch: gh-pages
          build_dir: dist
          jekyll: false # 禁用 GitHub 默认开启的 jekyll 构建
          fqdn: some.domain.com # 自定义域名，需要时填写
```

## GitHub Release

发布 Release 包含几个动作：

1. 根据提交记录生成 Changelog，使用 [ScottBrenner/generate-changelog-action](https://github.com/ScottBrenner/generate-changelog-action)
1. 创建一个 Release，正文填写上一步得到的 Changelog，使用 [actions/create-release](https://github.com/actions/create-release)
1. 为 Release 附加需要的 assets，使用 [actions/upload-release-asset](https://github.com/actions/upload-release-asset)

```yaml
  deploy_release:
    runs-on: ubuntu-latest
    steps:
      # checkout，由于 changelog 需要读取所有历史记录
      # 因此这里 `fetch-depth` 需要填 0，代表所有
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          ref: dev
      # yarn & build
      - uses: c-hive/gha-yarn-cache@v1
      - run: yarn --frozen-lockfile
      - name: Build
        run: npm run build
      # 生成 changelog
      - name: Changelog
        uses: scottbrenner/generate-changelog-action@master
        id: Changelog
        env:
          REPO: ${{ github.repository }}
      # 创建 release
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ${{ steps.Changelog.outputs.changelog }}
          draft: false
          prerelease: false
      # 添加 assets
      - name: Upload Release Asset
        id: upload-release-asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./dist/some-js.min.js
          asset_name: some-js.min.js
          asset_content_type: text/javascript
```

## NPM

发布 npm 有一个预定义的 action: [JS-DevTools/npm-publish](https://github.com/JS-DevTools/npm-publish)，但是用过以后我觉得实际上没有自己敲命令行好用，因为它会做一些额外的不必要的动作，可能会导致发布出错（如：第一次发布，因为它会检查历史包）。

注：此处的 `NPM_TOKEN` 是需要自行配置的。

```yaml
  deploy_npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: c-hive/gha-yarn-cache@v1
      - uses: actions/setup-node@v1
        with:
          node-version: 12.x
          registry-url: https://registry.npmjs.org
      - run: yarn --frozen-lockfile
      - name: Build
        run: npm run build
      # 发布
      - name: Publish NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## NPM GitHub Registry

GitHub Registry 与 NPM 不一样的是，它要求发布的包必须是以当前仓库所属的 username scoped 的。因此如果要同时发布 NPM 和 GitHub，`package.json` 需要做一点小更改：将包名改为 scoped 的。

这里为求简便，使用了 [deef0000dragon1/json-edit-action](https://github.com/deef0000dragon1/json-edit-action) 来执行替换。实际上熟悉 shell 命令的话一行代码也可以完成。

```yaml
  publish_github:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: 12
      - uses: actions/checkout@v2
      # 将 package.json 中的 name 字段替换
      - name: change package name
        uses: deef0000dragon1/json-edit-action@v1
        env:
          KEY: name
          VALUE: "@username/some-package"
          FILE: package.json
      - uses: c-hive/gha-yarn-cache@v1
      - run: yarn --frozen-lockfile
      # 配置 npmrc
      - run: echo //npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }} >> .npmrc
      # 发布
      - run: npm publish --registry=https://npm.pkg.github.com
```

关于 `npmrc` 这一步，实际上这里使用 `NODE_AUTH_TOKEN` 环境变量应该也可以达到相同目的。