---

title: 'Gitlab CI Setup'
date: 2018-07-19T06:22:36.993Z
tags: [CI, Gitlab]
sidebar: false
draft: false
---

Gitlab 有一套内置的 CI 系统，相比集成 Jenkins 来说更加方便一些，用法也稍为简单。以下是搭建过程。

前置准备：须要准备一台用来跑 CI 任务的机器（可以是 Mac / Linux / Windows 之一）。

<!-- more -->

## 创建 `.gitlab-ci.yml` 文件

和 Github CI 一样，Gitlab CI 也使用 [YAML](https://en.wikipedia.org/wiki/YAML) 文件来定义项目的整个构建任务。只要在需要集成 CI 的项目根目录下添加这份文件并写入内容，默认情况下 Gitlab 就会为此项目启用构建。

配置文档：[https://docs.gitlab.com/ee/ci/yaml/README.html](https://docs.gitlab.com/ee/ci/yaml/README.html)

一份较为完整的配置文件样例：

```yaml
#指定 docker 镜像
image: node:9.3.0

#为 docker 镜像安装 ssh-agent 以执行部署任务
before_script:
  - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
  - eval $(ssh-agent -s)
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
  - mkdir -p ~/.ssh
  - echo -e "Host *\n\tStrictHostKeyChecking no\n\n" > ~/.ssh/config
  - chmod 700 ~/.ssh

#定义构建的三个阶段
stages:
  - build
  - test
  - deploy

#定义可缓存的文件夹
cache:
  paths:
    - node_modules/

#构建任务
build-job:
  stage: build
  script:
    - "npm install"
    - "npm run build"
  tags:
    - node

#测试任务
test-job:
  stage: test
  script:
    - "npm install"
    - "npm run lint"
    - "npm test"
  tags:
    - node

#部署任务
deploy-job:
  stage: deploy
  only:
    - release
  script:
    - "npm install"
    - "npm run build"
    - ssh user@host "[any shell commands]"
  tags:
    - node
```

整个构建过程基本上一目了然，比 Jenkins 简便很多。Gitlab CI 会按顺序执行 build / test / deploy 三个 stage 的任务，遇到出错即中止，并不再往下执行。同个 stage 中的多个任务会并发执行。需要注意的是，各个 stage 的工作空间是独立的。

其中 `$SSH_PRIVATE_KEY` 是在相应 Gitlab 项目中配置的一个 Secret Value，是构建机的 ssh 私钥。后面再谈。

将 `.gitlab-ci.yml` 文件推送到服务器后，打开项目主页，点击 Commit 记录，会发现构建任务启动并处于 pending 状态：

![img](https://docs.gitlab.com/ee/ci/quick_start/img/new_commit.png)

点击构建图标，则可以进入到 CI 详情页面：

![img](https://docs.gitlab.com/ee/ci/quick_start/img/single_commit_status_pending.png)

点击具体任务查看 log 则提示项目没有配置相应的 runner 来执行构建任务。也就是下一步要做的事情。

## 搭建 Gitlab runner

[Gitlab runner](https://docs.gitlab.com/runner/) 是用来执行 CI 任务的客户端，它可以在一台机器上搭建，并且同时为多个项目服务。[安装教程](https://docs.gitlab.com/runner/install/)。

安装好 runner 后，还要为机器安装 [Docker](https://www.docker.com/community-edition)，用来作为具体构建的容器。

以上均安装完成后，就可以开始配置 runner 了。配置过程中需要用到的一些信息可以在下图位置找到（项目主页 -> Settings -> CI / CD -> Runners settings）。

![img](https://docs.gitlab.com/ee/ci/quick_start/img/runners_activated.png)

```
$ sudo gitlab-runner register

Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com )
(填写上图位置的地址)

Please enter the gitlab-ci token for this runner
(填写上图位置的token)

Please enter the gitlab-ci description for this runner
[hostame] my-runner

Please enter the gitlab-ci tags for this runner (comma separated):
node

Please enter the executor: ssh, docker+machine, docker-ssh+machine, kubernetes, docker, parallels, virtualbox, docker-ssh, shell:
docker

Please enter the Docker image (eg. ruby:2.1):
node:latest
```

其中 description 与 tags 将来都可以在 Gitlab UI 中更改。注意 tag 必须与 `.gitlab-ci.yml` 中各个 job 指定的 tag 一致，这个 job 才会分配到这个 runner 上去。

如此一来则大功告成，回到 Gitlab UI，在 Runner settings 内可以看到配置好的 runner，并且可以执行任务了。

![img](https://docs.gitlab.com/ee/ci/quick_start/img/pipelines_status.png)

## 遇到的问题

其实本地构建基本上都没什么问题，遇到的坑基本集中在 deploy 阶段，即远程到服务器上去发布的这一步。按照 Gitlab 提供的[文档](https://docs.gitlab.com/ee/ci/ssh_keys/)，走完了所有的步骤后，构建机总是无法使用 private key 直接登录，而是必须输入密码登录。尝试了查看 ssh 日志，重启服务器 sshd 服务，修改文件夹权限等等，debug 了半天还是没有解决该问题。后来偶然发现在部署服务器上使用 sshd 开启一个新的服务，用新的端口即可顺利登录，也不知道是为什么。

更新：另外一个方法，可以使用 `sshpass` 命令来进行登录。用法：

1. 在 docker 镜像中安装 `sshpass`
   ```
   $ which sshpass || ( apt-get update -y && apt-get install sshpass -y )
   ```
   其中 `-y` 是为了防止安装过程中出现需要选择的项目，一律选 YES
2. 在项目 CI 变量中设置 ssh 密码
3. 使用 `sshpass` 复制文件，或登录远程服务器
   ```
   # scp
   $ SSHPASS=$YOUR_PASSWORD_VAR sshpass -e scp -r local_folder user@host:remote_folder"
   # ssh
   $ SSHPASS=$YOUR_PASSWORD_VAR sshpass -e ssh user@host
   ```
