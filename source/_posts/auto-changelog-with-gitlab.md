---
title: 'Auto Changelog with GitLab'
date: 2020-11-19T02:43:53.946Z
tags: [gitlab, devops]
---

上一篇博文 [Integrate Renovate with GitLab](/posts/2020-11-09-integrate-renovate-with-gitlab.html) 中介绍了为私有代码仓库与私有源提供依赖自动检测更新并发起 Merge Request 的方式。Renovate 可以自动通过 Release Notes 获取到版本之间的更新日志，并在 MR 中展示，这为执行合并的评审人提供了极大的便利。

接下来需要解决另一个问题：如何为分散在各处的私有依赖自动生成更新日志？

<!-- more -->

## 工具

首先需要说明，自动生成 Changelog 的前提条件是使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0-beta.4/) ，这样各类程序才能从 git 仓库的提交记录中提取出有价值的信息并加以整理归类。

可供选择的程序有很多，可以按需选择。这里选用的是 [lob/generate-changelog](https://github.com/lob/generate-changelog) 。

## 时机

一个合适的生成 Changelog 的时机是创建新 Tag 的时候。如果是一个 npm package，那么执行 `npm version xxx` 命令的时候就会自动得到一个 Tag，将其推送到远端即可。

也可以使用预定义的脚本：

```
"release:major": "npm version major && git push origin && git push origin --tags",
"release:minor": "npm version minor && git push origin && git push origin --tags",
"release:patch": "npm version patch && git push origin && git push origin --tags",
```

## CI

如何驱使 GitLab 来完成 Release Note 的创建，有很多方式。

### 1. 使用 .gitlab-ci.yml

从 GitLab 13.2 开始，runner 可以使用以下镜像直接操作 Release：

```yaml
release_job:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  rules:
    # 只有当 Tag 被创建的时候才执行该任务
    - if: $CI_COMMIT_TAG                  
  script:
    - echo 'running release_job'
    # 使用命令行生成 Changelog
    # 该命令行可以根据需求自定义
    - export EXTRA_DESCRIPTION=$(changelog)
  release:
    name: 'Release $CI_COMMIT_TAG'
    # 将得到的 Changelog 填入 description 字段
    description: '$EXTRA_DESCRIPTION'
    tag_name: '$CI_COMMIT_TAG'
    ref: '$CI_COMMIT_TAG'
```

这是最简单的方式。但是由于我司的 GitLab 版本过低，不支持此操作。因此需要另外想办法。

### 2. bash script

GitLab CI 可以执行一个 bash script，因此可以利用 GitLab 提供的 API，结合一个 Access Token 向 GitLab 发起请求，最终得到 Changelog。

这种方式应该是大多数老版本 GitLab 所使用的。但是它存在一些我认为无法接受的问题：

1. 每个项目都需要有此脚本（不过这一点实际上可以通过 `npx` 绕过）；
2. 每个项目的 `.gitlab-ci.yml` 都需要修改，这点是无法避免的（实际上方式 1 也存在此问题）；
3. 每个项目都需要配置 Secret Token（ Access Token 不可能直接暴露在代码中）。

因此，我觉得这个办法不够优雅。

### 3. webhook

为了解决以上问题，我决定继续改造之前的博文 [Gitlab CE Code-Review Bot](/posts/2020-09-23-gitlab-ce-code-review-bot.html) 中介绍的评审机器人，让它可以

1. 识别 Tag 事件；
2. 自动拉取仓库代码；
3. 自动生成 Changelog；
4. 调用 GitLab API 完成 Release Note 的创建。

首先在入口处加多一个事件监听：

```javascript
module.exports = async (ctx) => {
  try {
    const { object_kind, object_attributes } = ctx.request.body

    // ...
    } else if (object_kind === 'tag_push') {
      // tag 事件
      await tag(ctx)
    }
    // ...
  } catch (e) {
    console.error(e)
  }
}
```

GitLab 并没有区分 Tag 创建与删除的事件，因此需要通过代码判断：

```javascript
const { after, ref, project_id, project: { git_http_url } } = ctx.request.body
if (after === '0000000000000000000000000000000000000000') {
  // 该事件是 tag 删除事件，不作处理
  return
}
```

使用 [simple-git](https://www.npmjs.com/package/simple-git) 来拉取 Git 仓库，注意这里需要使用 `oauth2:Access Token` 来完成授权：

```javascript
const simpleGit = require('simple-git')
const git = simpleGit()

await git.clone(git_http_url.replace('https://', `https://oauth2:${process.env.GITLAB_BOT_ACCESS_TOKEN}@`), projectPath)
```

生成 Changelog：

```javascript
const Changelog = require('generate-changelog')
const simpleGit = require('simple-git')

/**
 * 为 projectPath 的 tag 生成 Changelog
 * @param projectPath
 * @param tag
 * @returns {Promise<String|null>}
 */
async function generateChangelog (projectPath, tag) {
  // 旧的当前路径
  const oldPath = process.cwd()
  try {
    // 生成之前先要切换路径  
    process.chdir(projectPath)
    const git = simpleGit()
    
    // 获取 Git 仓库下所有的 Tags
    const tagsString = await git.raw(['for-each-ref', '--sort=-creatordate', '--format', '%(refname)', 'refs/tags'])
    const tags = tagsString.trim().split(/\s/)

    for (let i = 0; i < tags.length - 1; ++i) {
      if (tags[i] !== tag) {
        // 循环找到目标 Tag
        continue
      }
      if (!tags[i] || !tags[i + 1]) {
        // 第一个 Tag（往往）不需要 Changelog
        break
      }
      // 找到 Tag 的哈希值
      const hash0 = (await git.raw(['show-ref', '-s', tags[i]])).trim()
      const hash1 = (await git.raw(['show-ref', '-s', tags[i + 1]])).trim()
      // 使用哈希值范围来生成 Changelog
      // 为什么不直接使用 Tag：
      // 因为 Tag 中如果包含了某些特殊字符串，会造成无法识别问题
      return await Changelog.generate({ tag: `${hash0}...${hash1}` })
    }
  } catch (e) {
    console.error(e)
    return null
  } finally {
    // 任务结束后将当前路径切换回原来的
    process.chdir(oldPath)
  }
}
```

最后，使用 GitLab API 将得到的 Changelog 更新上去即可：

```javascript
/**
 * 为 Tag 增加 Release note
 * @param projectId
 * @param tagName
 * @param body
 * @returns {IDBRequest<IDBValidKey> | Promise<void>}
 */
function addReleaseNote (projectId, tagName, body) {
  return agent.post(`${BASE}/${projectId}/repository/tags/${tagName}/release`, {
    tag_name: tagName,
    description: body
  })
}
```

最后的最后，删除之前拉取下来的仓库，这个任务就算完成了。

这么做最大的好处是：仓库启用与否，只需要在 Webhook 处多勾选一个 `Tag push` Event 即可，无需任何其他操作。

但是它也有一个不好的地方：如果原仓库特别大的话，拉取可能会非常耗时。不过考虑到 GitLab 和 Bot 一般都会处在同一个内网环境下，这点基本可以忽略。