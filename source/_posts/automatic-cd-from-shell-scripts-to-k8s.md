---
title: '自动化部署: 从脚本到 K8s'
date: 2020-10-21T02:31:34.371Z
tags: [devops,k8s]
---

如果公司有专业运维，项目的部署上线过程一般来说开发者都不会接触到。但是很不幸，我所在的团队没有独立的运维团队，所以一切都得靠自己（与同事）。

以下都只是工作中逐步优化得到的经验总结，并且只以 Node.js 程序部署为例。

<!-- more -->

## 部署上线的原始版本

### 流程图

举例：服务器使用 PM2 管理部署。纯手工操作：

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地打包前端代码
op2=>operation: 将：
前端构建完毕的代码/服务端原始代码
scp 或 sftp 命令上传到远程机器
op3=>operation: ssh 登录远程机器
op4=>operation: 解压缩到指定位置
op5=>operation: 为服务端代码执行 npm install/yarn
op6=>operation: pm2 restart/reload
op7=>operation: 退出远程机器

st->op1->op2->op3->op4->op5->op6->op7->e
```

### 总结

整个过程耗时 10~30 分钟不等。

优点：

1. 不依赖任何工具/系统
1. 适用于任何分支

缺点：

1. 麻烦、耗时
1. 易出错
1. 无法持续部署
1. 多节点怎么办？

## 基于 CI 系统的全自动版本

一般来说企业都会有一套 CI 系统，可能是传统的 Jenkins，也可能是 Gitlab CI / Github Actions / Travis CI / Circle CI 等等。它们之间大同小异，都是通过某种方式写好若干份配置文件，当某些操作（如 git push）触发时以及满足某种条件（如当前分支为发布分支，或提交了 tag 等）执行某些任务。

这里使用 Gitlab CI 举例，CI/CD 通过 Gitlab Runner 完成，服务器使用 PM2 管理部署。

### 流程图

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地 git 代码提交
op2=>operation: Gitlab 触发自动构建
op3=>operation: Gitlab 执行代码测试
op4=>operation: Gitlab 执行代码打包
op5=>operation: Gitlab 通过 scp 将代码上传到远程机器
op6=>operation: Gitlab 通过 ssh 登录上远程机器
op7=>operation: Gitlab 在远程机器上执行 pm2 重启命令
op8=>operation: Gitlab 退出远程机器
cond1=>condition: 是否为发布分支？

st(bottom)->op1(bottom)->op2(left)->op3(bottom)->cond1
cond1(yes,right)->op4->op5->op6->op7->op8(left)->e
cond1(no,bottom)->e
```

### 技术细节

配置文件 `.gitlab-ci.yml`:

```yaml
image: node

before_script:
  - yarn --frozen-lockfile

stages:
  - test
  - build
  - deploy

# 代码测试
test:
  stage: test
  script:
    - npm run lint
    - npm run test
  tags:
    - node

# 前端代码构建测试
build-frontend:
  stage: build
  script:
    - npm run build
  tags:
    - node

# 发布 dev 环境，其他环境略
deploy-dev:
  stage: deploy
  # 仅在 release-dev 分支上执行改任务
  only:
    - release-dev 
  script:
    - npm run build:dev
    - scp -r . user@host:~/path/to/deploy
    - ssh user@@host "
        pm2 delete -s frontend || true &&
        pm2 delete -s server || true &&
        pm2 serve /path/to/deploy/frontend/ 8080 --name frontend &&
        yarn --cwd /path/to/deploy/server/ &&
        pm2 start /path/to/deploy/server/server.js --name server"
  tags:
    - node

# ...
```

### 总结

优点：

1. 全过程仅依赖 Gitlab 与 Gitlab Runner （基于或不基于容器）
1. 全自动测试，提交到发布分支则全自动部署，测试失败的代码不会被部署

缺点：

1. 需要在 Gitlab 上配置远程机器的登录凭证（账号/密码），或在 Runner 机器上配置 ssh key
1. Runner 会拥有部署机器的访问权限
1. 多节点？运维？

## Gitlab 与 Agent 平台结合的半自动版本

为了解决上述 Runner 机器权限过高的问题，这个版本引入了 Agent 平台的概念。每个企业使用的平台可能有所区别，有可能是自研的（如我司），也有可能是外部提供的的（如「宝塔」）。但大体功能基本一致。

该版本中：

1. CI 通过 Gitlab Runner 完成。任务完成后会将代码打包，并放置于服务器上的某个位置，该位置通过 Nginx 暴露（仅对内）
1. CD 通过 Agent 平台完成。Agent 从上一步暴露的地址中下载代码，解压缩并放置到指定位置，重启 PM2 服务

### 流程图

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地 git 代码提交
op2=>operation: Gitlab 触发自动构建
op3=>operation: Gitlab 执行代码测试
op4=>operation: Gitlab 执行代码打包
op5=>operation: Gitlab 更新文件服务器
op6=>operation: 在 Agent 平台上点击发布
op7=>operation: Agent 在指定机器上
执行发布脚本：
从文件服务器拉取最新代码，
解压并执行重启命令
op8=>operation: Agent 退出远程机器
cond1=>condition: 是否为发布分支？
cond2=>condition: 立即发布？

st->op1->op2->op3->cond1
cond1(yes,bottom)->op4(bottom)->op5->cond2
cond1(no,right)->e
cond2(yes,bottom)->op6->op7->op8(right)->e
cond2(no,right)->e
```

### 总结

这一个版本中，CI 系统的配置简化了，去除部署部分的任务即可。至于 Agent 平台的配置方式，可能是一个完整的 bash 脚本，也可能是其它配置，就不在此展开了。

优点：

1. CI 过程全自动
1. CI/CD 权限解耦
1. 适用于各种分支

缺点：

1. 非线上发布过程也需要手动完成，麻烦
1. 严重依赖 Agent 平台
1. 运维？

## Gitlab 与 k8s 结合的全自动版本 v1

k8s (kubernetes) 是一个容器集群部署管理系统。

容器基础知识：

1. [镜像 Image](https://docs.docker.com/get-started/overview/#docker-objects)
2. [容器 Container](https://docs.docker.com/get-started/overview/#docker-objects)

k8s 基础知识：

1. [工作单元 pod](https://kubernetes.io/zh/docs/concepts/workloads/pods/)
2. [服务 service](https://kubernetes.io/zh/docs/concepts/services-networking/service/)
3. [节点 node](https://kubernetes.io/zh/docs/concepts/architecture/nodes/)
4. [Kustomize](https://kubernetes.io/zh/docs/tasks/manage-kubernetes-objects/kustomization/)

### 流程图

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地 git 代码提交
op2=>operation: Gitlab 触发自动构建
op3=>operation: Gitlab 执行代码测试
op4=>operation: Gitlab 执行代码打包
op5=>operation: Gitlab 更新文件服务器
op6=>operation: 更改 k8s 相应配置
使用指定 commit sha 发布
op7=>operation: k8s 识别到配置更新
重启指定服务
op8=>operation: 向服务节点发送 kill 命令
CI过程到此结束
op9=>operation: k8s pod 收到命令，进程退出
op10=>operation: k8s 自动重新拉起该 pod
op11=>operation: pod 重新拉取名为 latest 的代码
op15=>operation: pod 安装 nodejs 依赖
op12=>operation: pod 启动 nodejs 进程
完成重启
cond1=>condition: 是否为发布分支？
cond2=>condition: 是否为线上发布分支？

st->op1->op2->op3->cond1
cond1(yes)->op4->op5->cond2
cond1(no,right)->e
cond2(yes,left)->op6->op7->e
cond2(no,bottom)->op8->op9->op10->op11->op15->op12->e
```

### 技术细节

`Dockerfile`:

```dockerfile
FROM alpine

RUN apk add --no-cache --update nodejs nodejs-npm yarn
RUN adduser -u 1000 -D app -h /data

USER app

COPY --chown=app start.sh /data/start.sh

WORKDIR /data

EXPOSE 8000
ENTRYPOINT [ "sh", "/data/start.sh" ]
```

`start.sh`:

```bash
#!/usr/bin/env sh

# 从文件服务器获取该版本包
VERSION_DEPLOY_HTTPCODE=`curl -s "https://xxx/${VERSION}" -o pkg.tgz -w "%{http_code}"`
if [ "$VERSION_DEPLOY_HTTPCODE" == "200" ]; then
    echo "using version: ${VERSION}"
    tar zxf pkg.tgz
else
    echo "version package not exist: ${VERSION}"
    exit 1
fi

sh deploy.sh
```


kill 实现：

```javascript
// koa
router.all('/api/kill', async (ctx, next) => {
  if (!IS_PROD) {
    ctx.body = 'ok'
    process.exit(0)
  } else {
    next()
  }
})
```

### 总结

优点：

1. CI 过程全自动
2. 非线上环境 CD 全自动，线上环境 CD 手动指定版本，兼顾方便与安全
3. 无需配置远程机器权限

缺点：

1. k8s 使用原始镜像启动 pod，拉取代码与安装依赖的过程非常耗时（每次启动都是全新镜像，无缓存）。
2. CD 过程不确定性较多，存在代码文件服务器故障、依赖安装故障等风险。
3. kill 指令发出后服务会暂时不可用。
4. 多节点？

## Gitlab 与 k8s 结合的全自动版本 v2

为了解决上面的问题 3/4，引入 `Consul` 对 CI/CD 过程做出了改进。

Consul 是为基础设施提供服务发现和服务配置的工具，包含多种功能，这次用到了其中两个功能：
1. 服务发现
2. 健康检查

### 流程图

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地 git 代码提交
op2=>operation: Gitlab 触发自动构建
op3=>operation: Gitlab 执行代码测试
op4=>operation: Gitlab 执行代码打包
op5=>operation: Gitlab 更新文件服务器
op6=>operation: 更改 k8s 相应配置
使用指定 commit sha 发布
op7=>operation: k8s 识别到配置更新
重启指定服务
（滚动更新）
op13=>operation: Gitlab 从 Consul 获取
所有活着的节点
op8=>operation: Gitlab 向服务节点列表
逐个发送 kill 命令
CI 过程到此结束
op9=>operation: k8s pod 收到命令，进程退出
op10=>operation: k8s 自动重新拉起该 pod
op11=>operation: pod 重新拉取名为 latest 的代码
op15=>operation: pod 安装 nodejs 依赖
op14=>operation: pod 启动 nodejs 进程，并：
以 pod name 为 id
1. 从 Consul 解注册所有同名服务
2. 向 Consul 注册自己
op12=>operation: pod 完成重启
cond1=>condition: 是否为发布分支？
cond2=>condition: 是否为线上发布分支？

st->op1->op2->op3->cond1
cond1(yes,bottom)->op4->op5->cond2
cond1(no,right)->e
cond2(yes,left)->op6->op7->e
cond2(no,bottom)->op13->op8->op9->op10->op11->op15->op14->op12->e
```

### 技术细节

这个流程里面涉及到几个问题：

#### 关于“逐个发送 kill 指令”

虽然通过 Consul 可以获取到所有运行中 pod 的 ip 及端口，但是如果集中发送 kill 命令仍然会造成服务不可用。目前我司服务端的 CI 就有这个问题，他们虽然每个 kill  会有一段固定时间的 sleep 间隔，但无法保证下一个 kill 发出时上个服务时候已重启完毕。

为了解决这个问题，我写了一个脚本。

流程：

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 获取所有在 Consul 上注册了的节点
op2=>operation: 从下标 0 开始
循环发送 kill 指令
op3=>operation: 等待并检测其重启完毕
cond1=>condition: kill 指令返回成功？
cond2=>condition: 检测成功且未超时？
cond3=>condition: 该节点是最后一个？

st->op1->op2->cond1
cond1(no,right)->op2
cond1(yes)->op3->cond2
cond2(no,left)->op2
cond2(yes)->cond3
cond3(yes)->e
cond3(no,right)->op2
```

代码：

```javascript
#! /usr/bin/env node

/**
 * 此脚本在gitlab-runner中作为CI的最后一步执行
 * 在非线上环境中可以对容器进行逐个重启，尽量减少downtime
 */

// 确保线上环境不执行此脚本
if (process.env.NODE_ENV === 'production') {
  return
}

const http = require('http')

function request (host, port, path) {
  return new Promise(((resolve, reject) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 1,
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (res) {
      res.setEncoding('utf8')
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data
        })
      })
    })
    req.on('error', e => {
      console.log(e.message)
      resolve()
    })
    req.end()
  }))
}

async function sleep (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

(async () => {
  // 各环境的consul请求地址
  // 具体使用时需要填入指定 host 与 port
  const apiMap = {
    development: ['host', 'port'],
    qa: ['host', 'port'],
    pp: ['host', 'port']
  }
  // 从consul获取已注册pod列表
  const api = apiMap[process.env.NODE_ENV]
  const res = await request(api[0], api[1], api[2])
  if (!res || !res.data) {
    console.log('consul find service failed, exiting...')
    return
  }
  console.log('consul raw:', JSON.stringify(res.data))
  const pods = JSON.parse(res.data).map(v => [v.Service.Address, v.Service.Port])
  console.log('consul services:', JSON.stringify(pods))
  // 循环杀进程
  for (let i = 0; i < pods.length; i++) {
    const pod = pods[i]
    console.log('-------------')
    console.log(pod[0], pod[1])
    // 重启一个pod
    const killRes = await request(pod[0], pod[1], `/api/kill`)
    if (killRes && killRes.status === 200) {
      // kill返回成功，这个节点原本是活着的才继续监测它的状态
      console.log(pod[0], 'killed.')
      if (i === pods.length - 1) {
        // 已经杀完了最后一个pod，无需继续等待重启，直接退出
        process.exit(0)
      }
      let isServerUp = false
      // let isFrontendUp = false
      // 每个pod最多检测12次（2分钟），超过时间则放弃，直接重启下一个pod
      let tryTimes = 12
      // 循环检测是否重启成功
      do {
        console.log(pod[0], 'waiting for pod up...', tryTimes)
        // 每10秒检测一次
        await sleep(10 * 1000)
        console.log(pod[0], 'check if pod up...')
        // 如果返回200表示已服务已重新启动
        const serverRes = await request(pod[0], pod[1], `/api/health-check`)
        isServerUp = !!(serverRes && serverRes.status === 200)
        console.log(pod[0], 'pod server up:', isServerUp)
        // 等待 k8s readinessProbe 开始，节点被认为已存活，则可以对外访问
        if (isServerUp) {
          const waitSecondsStr = process.env.WAIT_FOR_PROBE_SECONDS || '10'
          const waitSeconds = parseInt(waitSecondsStr)
          if (isNaN(waitSeconds) || waitSeconds >= 120 || waitSeconds < 0) {
            // 最大等待120秒，超过视为参数错误
            console.log(pod[0], `WAIT_FOR_PROBE_SECONDS is invalid, skip waiting for prob.`)
          } else {
            console.log(pod[0], `pod is up internally, but need to wait for live probe (${waitSeconds}s)...`)
            await sleep(waitSeconds * 1000)
          }
        }
      } while (!isServerUp && --tryTimes > 0)
    } else {
      console.log(pod[0], 'kill failed, skip.')
    }
  }
})()

```

在 gitlab-ci 的最后一步执行此脚本：

`.gitlab-ci.yml`:

```yaml
# ...
deploy-dev:
  stage: deploy
  only:
    - release-dev
  script:
    - ./build.sh
    - NODE_ENV=development SERVICE_NAME=some-name npm_config_registry=http://private.registry.com npx restart-project-via-consul-script@latest
  tags:
    - node
# ...
```

#### 关于“解注册所有同名服务”与“注册自己”

项目内部使用 [https://www.npmjs.com/package/consul](https://www.npmjs.com/package/consul) 来与 Consul 通信。

需要“解注册所有同名服务”的原因：

Consul 在注册服务时并没有类似“主键”的概念，一个 Consul 有多个 Agent，也就是说相同 ip、相同 id 的服务可能会在不同 Agent 上被注册多次，并且由于 pod 的 ip 是短暂的，每次重启 pod 获得的 ip 可能会有差异，因此如果不进行解注册就会导致从 Consul 上获得的服务与现实正在运行的不一致。

流程：

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 获取所有在 Consul 上注册了的节点
op2=>operation: 找到所有同名服务
op3=>operation: 从下标 0 开始，
循环发送解注册请求
op4=>operation: 向 Consul 注册自己
cond1=>condition: 已全部解除？

st->op1->op2->op3->cond1
cond1(no)->op3
cond1(yes)->op4->e
```

### 总结

优点：

1. CI 过程全自动
2. 非线上环境 CD 全自动，线上环境CD手动指定版本，兼顾方便与安全
3. 无需配置远程机器权限
4. 支持多节点
5. 高可用性的重启

缺点：

1. k8s 使用原始镜像启动 pod，拉取代码与安装依赖的过程非常耗时（每次启动都是全新镜像，无缓存）。
2. CD 过程不确定性较多，存在代码文件服务器故障、依赖安装故障等风险。

为什么会做成这个样子呢，因为我司的服务端使用 golang 是走的这一套流程，但是使用 golang 打包编译出的是一个二进制文件，镜像直接拉取就可以启动，不需要依赖安装等步骤。因此他们使用这种方式的缺点并不明显。但是对于 Nodejs 程序来说，这依然是一个较大缺陷。

## Gitlab 与 k8s 结合的全自动版本 v3

为了解决上面的问题 1/2，这个版本更改了代码部署到 k8s 的方式：使用完整的预构建镜像，而不是空白镜像。


### 流程图

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: 本地 git 代码提交
op2=>operation: Gitlab 触发自动构建
op3=>operation: Gitlab 执行代码测试
op4=>operation: Gitlab 执行代码打包
op15=>operation: Gitlab 根据 Dockerfile
构建项目的完整镜像
op16=>operation: Gitlab 将打好 tag 的
镜像上传到私有云
op6=>operation: 更改 k8s 相应配置
使用指定 commit sha 发布
op7=>operation: k8s 识别到配置更新
重启指定服务
（滚动更新）
op13=>operation: Gitlab 从 Consul 获取
所有活着的节点
op8=>operation: Gitlab 向服务节点列表
逐个发送 kill 命令
CI 过程到此结束
op9=>operation: k8s pod 收到命令，进程退出
op10=>operation: k8s 使用已经构建完成的
最新镜像自动重新拉起该 pod
op14=>operation: pod 启动 nodejs 进程，并：
以 pod name 为 id
1. 从 Consul 解注册所有同名服务
2. 向 Consul 注册自己
op12=>operation: pod 完成重启
cond1=>condition: 是否为发布分支？
cond2=>condition: 是否为线上发布分支？

st->op1->op2->op3->cond1
cond1(yes,bottom)->op4->op15->op16->cond2
cond1(no,right)->e
cond2(yes,left)->op6->op7->e
cond2(no,bottom)->op13->op8->op9->op10->op14->op12->e
```

### 技术细节

`build.sh`:

```bash
echo "Process: 构建 Docker 镜像..."
docker build -t wohx-${PROJECT_NAME}:${COMMIT_SHA} .
docker tag wohx-${PROJECT_NAME}:${COMMIT_SHA} private.registry.com/${PROJECT_NAME}:${COMMIT_SHA}
docker tag wohx-${PROJECT_NAME}:${COMMIT_SHA} private.registry.com/${PROJECT_NAME}:${BRANCH}-latest

echo "Process: 上传 Docker 镜像..."
docker push private.registry.com/${PROJECT_NAME}:${COMMIT_SHA}
docker push private.registry.com/${PROJECT_NAME}:${BRANCH}-latest
```

`Dockerfile`:

```dockerfile
FROM alpine
RUN apk add --no-cache --update nodejs nodejs-npm yarn
RUN adduser -u 1000 -D app -h /data
USER app
WORKDIR /data
EXPOSE 8000
# server 确保在 yarn.lock 与 package.json 没有改变的情况下，此层能被缓存
# frontend 的 node_modules 已在 .dockerignore 中忽略，无需关注
RUN mkdir ./server && mkdir -p ./frontend/dist
COPY --chown=app server/yarn.lock server/package.json ./server/
RUN yarn --ignore-engines --cwd /data/server/
# 启动脚本
COPY --chown=app ./start.sh ./
# server 源代码层
COPY --chown=app ./server ./server/
# frontend dist 层
COPY --chown=app ./frontend/dist ./frontend/dist
# entry
# CMD [ "node", "./server/server.js" ]
# start.sh 允许 k8s 自定义启动逻辑
ENTRYPOINT [ "sh", "/data/start.sh" ]
```

### 总结

优点：

1. CI过程全自动
2. 非线上环境CD全自动，线上环境CD手动指定版本，兼顾方便与安全
3. 无需配置远程机器权限
4. 支持多节点
5. 高可用性的重启
6. 预构建的镜像，CD 阶段开箱即用，无任何依赖

缺点：

1. 为了使每个 pod 能够获得一个稳定的名称（用于在 Consul 中注册、解注册），部署类型使用了 Statefulset，因此带来了一些本来不需要的特性。
