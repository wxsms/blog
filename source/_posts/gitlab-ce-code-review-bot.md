---

title: 'Gitlab CE Code-Review Bot'
date: 2020-09-23T05:00:24.748Z
tags: [gitlab,nodejs]
---

<!-- 「」 -->

由于 Gitlab CE 做代码评审时缺少了关键的评审员功能（详情参考此 [issue](https://gitlab.com/gitlab-org/gitlab-foss/-/issues/42096)），因此在使用 CE 的同时又想要做代码评审的话，就必须要自己想办法了。

网上能找到的最多的解决方案就是在 Gitlab 前面再部署一套 Gerrit，通过拦截推送的代码以及同步两个库来实现。但是这种方案有诸多弊端。比如：

1. 割裂的用户体验。原本习惯了使用 Gitlab 系统的人，要开始学习晦涩难懂的 Gerrit；
2. 代码同步的不稳定性和不确定性。系统每增加一层逻辑，可靠性就降低一些；
3. 复杂的使用方式：代码必须要从 Gerrit clone，同时 push 时分支名必须加上 refs 前缀，否则无法进入评审
4. ...

总体来说，以上的种种原因让我觉得 Gerrit 并不是最好的解决方案。对于凡事追求完美的处女座的我来说，我想要的东西大概应该具备以下几点：

1. 最好是能直接在 Gitlab 上面进行评审。因为 CE 可以说是万万事俱备，只差流程；
2. 最好是对原 Git 和 Gitlab 使用流程、习惯没有任何更改和侵入，仅增加评审流程；
3. 最好是可以可以自动化整个流程（评审人自动分配、评审完自动合并，等等）。

好在，Gitlab 有一套完备的 [Web hook](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html) 以及 [API](https://docs.gitlab.com/ee/api/) 系统，可以支撑起我的想法。

<!-- more -->

## 实现原理

首先，所有评审流程要基于一些分支使用原则：

1. 分支分为主干分支与特性分支，另外还有一些额外的分支（如发布分支）；
2. 除业务分支外，其它分支均为保护分支，不允许直接推送，只能通过 Merge Request 添加代码；
3. 特性分支可以任意使用、推送

因此，代码评审的环节就设计在 Merge Request （以下简称 MR）中，这是一个合理的时机。

整个评审流程如下所示：

```flowchart
st=>start: 开始
e=>end: 结束
s1=>operation: 同事 A 往业务分支 feat/a 推送代码
s2=>operation: 同事 A 请求将 feat/a 合并到主干分支 dev，
创建了 MR
s3=>operation: Gitlab 通过 Web hook 通知到评审系统
s4=>operation: 评审系统从预定义的评审员从随机抽取 N 位，
假设为 2 位：同事 B 和同事 C
并通过 @ 的方式通知
s5=>operation: 评审员 B/C 在 Gitlab 上进行评审
c1=>condition: 评审通过？
s6=>operation: 同事 B/C 评论 lgtm
s7=>operation: 同事 B/C 指出问题，
在 Gitlab 上的代码中，
具体到某一行进行评论
s8=>operation: 同事 A 修改代码，再次提交
s9=>operation: 评审系统执行合并

st->s1->s2->s3->s4->s5->c1
c1(yes,right)->s6->s9->e
c1(no,bottom)->s7(left)->s8(top)->s5
```

可以看到，除了最后的「合并」操作外，评审系统只是作为一个「旁观者」的角色，帮助我们完成了整个评审流程，并没有任何侵入性的操作。

## 实现细节

评审系统的实现，我选择的是一个用 Node.js 和 Koa2 搭建的普通 web 服务器。它会做两件事情：

1. 监听从 web hook 进入到系统的请求，分析请求参数，实现具体逻辑；
2. 调用 Gitlab API，完成诸如评论、合并等操作。

因为 Gitlab web hook 访问时仅存在参数区别，因此服务器入口只需要一个路径监听就够了：

```javascript
// gitlab.route.js
const gitlab = require('./gitlab.controller')

module.exports = (router) => {
  // 所有请求都进入到 gitlab controller
  router.all('(.*)', gitlab)
}
```

```javascript
// gitlab.controller.js
const mr = require('./merge-request.handler')
const mrc = require('./merge-request-comment.handler')

module.exports = async ctx => {
  try {
    const { object_kind, object_attributes } = ctx.request.body
    if (object_kind === 'merge_request' && object_attributes.action === 'open') {
      // 新的 merge request
      await mr(ctx)
    } else if (object_kind === 'note' && object_attributes.noteable_type === 'MergeRequest') {
      // merge request 收到评论
      await mrc(ctx)
    }
  } catch (e) {
    console.error(e)
  }
  // 这里的返回并不重要
  ctx.body = 'gitlab-bot'
}
```

### MR 创建时通知到评审系统

在上面的 `mr(ctx)` 中，可以实现新 MR 创建时的逻辑：

1. 从预先配置好的小组名单（可以是写死在代码中的，也可以是储存在 db 中的）中，随机抽取 N 位成员（假设为 B/C）；
2. 通过 Gitlab API 向 MR 添加评论，说明意图，并且 @B @C。

至于如何向 API 发出请求，开源世界有许多现成的解决方案，也可以直接参考 [API 文档](https://docs.gitlab.com/ee/api/)，这里不再赘述。

```javascript
// pid 为 projectId，mid 为 mergeRequestId，webhook 调用内均会携带。下同
await service.addMergeRequestComment(pid, mid, `请 [@${ra}] 与 [@${rb}] 评审`)
```

这里面有几个问题：

1. 如何防止小组成员略过评审系统，主动合并？
2. 不是所有分支合并都需要评审（如主干分支到发布分支），如何避免？

#### 如何防止手动合并

Gitlab 提供了一种方式：WIP (work in progress)，只要标记了 WIP 的 MR 就无法直接点击合并。使用方式也很简单，只需要在原 MR 的标题前面加上 `WIP:` 字符串即可：

```javascript
await service.updateMergeRequest(pid, mid, {
  title: `WIP:${object_attributes.title}`
})
```

效果如下图所示：

![wip](93973898-8e7ace00-fda7-11ea-9735-8ee3de0e663d.png)

可以看到，WIP 并不是一个强制状态。在 Web UI 上点击 `Resolve WIP status` 或手动去除标题中的 `WIP:` 都可以解除 WIP 状态，从而允许手动合并。也就是说，这是一个「防君子不防小人」的状态。如果是在一个团队内的成员中使用，我觉得这样已经足够了。

#### 如何兼容不需要评审的场景

这里其实可以利用保护分支的规则，作出一个共识：凡是已合并到保护分支上的代码，都是已经过评审的「安全」代码，无需再次评审。

因此可以得出结论：只有从非保护分支（特性分支）往保护分支合并的场景需要评审，其它场景均无需评审。

```javascript
const targetBranch = await service.getBranchInfo(pid, object_attributes.target_branch)
const sourceBranch = await service.getBranchInfo(pid, object_attributes.source_branch)
if (sourceBranch.protected || !targetBranch.protected) {
  // do something
  return
}
```

### 通过评论实现评审流程

在 `mrc(ctx)` 中，可以实现 MR 收到新评论时的逻辑，如下图所示：

```flowchart
st=>start: 开始
e=>end: 结束
s1=>operation: MR 收到新评论
c1=>condition: 检查评论是否包含 lgtm
c2=>condition: 检查评论者是否为受邀评审员
s2=>operation: 忽略该评论
c3=>condition: 通过 API 获取到该 MR 下的所有评论，
检查是否还存在其它评审员未评审
s4=>operation: 去除 MR 的 WIP 标记
s5=>operation: 执行合并

st->s1->c1
c1(yes,bottom)->c2
c1(no,right)->s2(bottom)->e
c2(yes,bottom)->c3
c2(no,right)->s2(bottom)->e
c3(yes,right)->e
c3(no,bottom)->s4(bottom)->s5(right)->e
```

部分关键代码：

```javascript
// 获取 mr 下的所有评论
const notes = await service.listCommentsOfMergeRequest(pid, mid)
// 找出邀请评论
const inviteNote = _.find(notes, v => v.author.username === 'bot' && /请.+?@.+?评审/.test(v.body))
// 找出邀请了的人
const inviters = inviteNote.body.match(/\[@.+?]/g).map(v => v.replace('[@', '').replace(']', ''))
// 找出没有 lgtm 的人
const notReviewPeople = []
inviters.forEach((uid, index) => {
  const regex = new RegExp('lgtm')
  if (!_.find(notes, v => v.author.username === uid && regex.test(v.body))) {
    notReviewPeople.push(uid)
  }
})
```

## 后记

以上评审流程，基本就是来自现在 Github 各大仓库流行的 bot 系统。可以发现，这套系统对比 Gerrit 等实现方案，除了对现有 Gitlab 用户十分友好之外，其最大的好处之一，就是控制权完全在自己手里。除了以上说到的逻辑以外，还可以自己实现任意想要的东西。如：

1. 为 MR 打标签。如评审人标签、评审状态标签、MR Change Size 标签，等等；
1. 检查 MR 内的 Commit Msg 是否合法；
1. 检查 MR 的 CI 是否通过；
1. 实现管理员用户，拥有更高的权限，通过特殊评论可以略过其它评审员直接合并，或完成其他功能
1. ...

限制你的只有想象力。

在实现了以上的一些逻辑后，目前我司评审系统的代码量加起来也没有超过 300 行。可以说相比于购买 Gitlab EE 来说，性价比还是相当高的。


