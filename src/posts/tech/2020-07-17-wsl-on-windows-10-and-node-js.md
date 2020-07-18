---
permalink: '/posts/2020-07-17-wsl-on-windows-10-and-node-js.html'
title: 'WSL on Windows 10 and Node.js'
date: 2020-07-17T14:13:02.853Z
tags: []
---

[[toc]]

<!-- 「」 -->

## WSL

### 安装

Linux 的命令行与构建工具一般来说要比 Windows 好用，但 Windows 的用户界面毫无疑问要比 Linux 好用。以往在 Windows 10 上安装 Linux，要么是使用虚拟机，要么是使用双系统，总是无法做到两头兼顾。现在 Windows 10 有了 WSL 技术，使得「二者合一」成为了可能。

关于如何安装 WSL，可以参考 [适用于 Linux 的 Windows 子系统安装指南 (Windows 10)](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10)，总的来说：

1. 将 Windows 10 系统版本升到最高，如果需要安装 WSL 2 则目前来说需要比高更高（体验版）；
2. 在「启用或关闭 Windows 功能」中，开启「适用于 Linux 的 Windows 子系统」，如果要安装 WSL 2 还需要开启「Hyper-V」；
3. 在 Windows 10 应用商店中搜索关键字「Linux」，并选择自己喜欢的发行版下载，比如我选择了「Ubuntu」；
4. 下载完成后，在开始菜单中找到它，并点击，会继续安装，过程大概需要几分钟；
5. 安装完成后，会提示输入 username 与 password，此即为 Linux 的用户凭据，至此 WSL 已安装完毕。

### 权限

为新增加的用户赋予 root 权限：

```
$ sudo vim /etc/sudoers
```

在：

```
# User privilege specification
root	ALL=(ALL:ALL) ALL
```

下面增加一行：

```
username	ALL=(ALL:ALL) ALL
```

这里的 username 即是刚才创建的用户名，`:wq!` 退出即可。

### 测试

安装完毕后，可以通过在终端输入 `wsl` 来进入已安装的 Linux 子系统。Linux 与 Windows 共享文件系统，Windows 的文件可以在 `/mnt` 下找到：

```
$ ls /mnt/
c d e f
```

这里的 c d e f 就分别代表 C/D/E/F 盘。

查看发行版本：

```
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 20.04 LTS
Release:        20.04
Codename:       focal
```

## Terminal
 
Windows 10 自带的 CommandLine 和 PowerShell 都不好用，而且丑。可以下载 Windows 新推出的 Windows Terminal，直接在 Windows 10 应用商店就能找到。

Github: [Microsoft/Terminal](https://github.com/Microsoft/Terminal)

同样，打开 Windows Terminal 后可以输入 `wsl` 来进入 Linux 子系统。

## Git

### 安装

有了 WSL 后，开发相关工具环境都不需要在 Windows 下安装了。可以直接使用 Linux 内的程序。以 Git 为例：

1. 打开 `C:\Users\[username]\AppData\Roaming\`；
2. 在这里新建一个 `bin` 文件夹；
3. 在文件夹内新建一个 `git.cmd` 文件，输入内容：
    ```
    @echo off
    %WINDIR%\System32\bash.exe -c "git %*"
    ```
4. 在 Path 内加入刚刚设置的文件：`C:\Users\[username]\AppData\Roaming\bin\git.cmd`

这样一来，就可以直接在 Windows 内访问到安装在 WSL 内的 git 了：

```
$ git --version
git version 2.25.1
```

除了 git 以外，其它程序也都可以如法炮制。

### SSH Key

```
$ git config --global user.name "username"
$ git config --global user.email "email@example.com"
$ ssh-keygen -trsa -C "email@example.com"
$ cat ~/.ssh/id_rsa.pub
```

如此可以得到公钥。

## Node.js

使用 `apt get` 之前，先替换一下镜像源：

```
$ sudo vim /etc/apt/sources.list

# 将文件内容替换为以下：
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
```

这里使用的是 [清华大学镜像源](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)。

### Node.js & NPM

替换完以后，安装 Node.js 与 NPM：

```
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install nodejs
$ sudo apt-get install npm
```

### n

安装 Node.js 版本管理工具 n:

```
$ sudo npm install -g n
# 查看所有已安装版本
$ n ls
# 安装最新的 LTS 版本并切换
$ n lts
```

### nrm

安装 NPM 源管理工具 nrm:

```
$ sudo npm install -g nrm
# 查看所有源
$ nrm ls
# 切换至 taobao 镜像源
$ nrm use taobao
```

### Yarn

安装 Yarn：

```
$ sudo npm install -g yarn
```

## WebStorm

WebStorm 可以直接与 WSL <del>完美</del>集成。

1. Terminal: File | Settings | Tools | Terminal，将 `Shell path` 设置为 `"cmd.exe" /k "wsl.exe"`，这样 Terminal 打开就直接进入了 WSL
2. Git: File | Settings | Version Control | Git，将 `Path to Git excutable` 设置为 `C:\Users\[username]\AppData\Roaming\bin\git.cmd`
2. Node.js: File | Settings | Languages & Frameworks | Node.js and NPM，`Node interpreter` 这里选择 `Add` 可以直接添加 WSL 内的 Node.js，NPM 在 `\\wsl$\Ubuntu\usr\local\lib\node_modules\npm`，Yarn 在 `\\wsl$\Ubuntu\usr\local\lib\node_modules\yarn`

这样一来，就可以实现 「Windows 的开发界面，Linux 的开发工具」了。

------

update:

目前发现 Git 的 Commit 功能会报错：

```
Commit failed with error
0 file committed, 2 files failed to commit: update theme
could not read log file 'C:UsersedisoAppDataLocalTempgit-commit-msg-.txt': No such file or directory
```

Push 正常。

解决办法：

1. 直接在 Terminal 内使用 `git commit`；
2. 升级到 2020.2 版本（目前是 EAP），但是经测试该版本要求 WSL2 才能正常工作，也就是 Windows 也要升级到 EAP 才行。不推荐。
