---
id: angular-tutorial-phonecat-tutorial-app
title: Angular 教程：手机展示应用
date: 2015-12-21T09:04:01+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - NodeJs
---
本系列教程是[AngularJs官方教程](https://docs.angularjs.org/tutorial)（基于[CC BY 3.0协议](http://creativecommons.org/licenses/by/3.0/)发布）的个人翻译，原版权属[AngularJs官方网站](https://angularjs.org/)所有，主要用于学习与分享，如有纰漏敬请指出。转载请注明出处。 学习AngularJs的方法之一就是跟着本教程做一个完整的项目，这个项目会向你介绍一个 AngularJS Web App 应有的架构体系。项目的目的是构建一个安卓设备目录，它可以显示一个带过滤/排序功能的列表页，同时允许用户点击列表中的设备以查看其中的详细内容。就像这样：

![](https://raw.githubusercontent.com/wxsms/wxsms-img-holder/master/catalog_screen.png)

在不使用任何原生扩展包以及插件的情况下，跟随本教程来体会 Angular 是如何让浏览器变得更聪明的：

  * 学习使用客户端数据绑定来创建会随着用户操作而改变的带有动态数据的视图（View）
  * 学习不使用 DOM 操作来保持视图与数据的同步
  * 学习使用 Karma 和 Protractor 测试框架
  * 学习使用依赖注入（Dependency Injection）和服务（Services）来使得 Web 设计更优雅

本教程可以让你学会：

  * 在主流浏览器上创建一个 Angular 动态应用
  * 使用数据绑定让你的数据模型（Model）和视图互连
  * 使用 Karma 创建和执行单元测试
  * 使用 Protractor 创建和执行端到端测试
  * 将应用的控制逻辑从模板（Template）转移到控制器（Controller）
  * 使用 Angular Service 从服务端获取数据
  * 使用 ngAnimate 为应用添加动画效果
  * 如何寻找其它 Angular 的学习资源

本教程将指导构读者建一个简单应用的完整过程，包括如何编写 / 执行单元 / 端到端测试。每个步骤最后的试验环节将为你提供更多的关于学习 AngularJS / 本项目的建议。 几个小时或者一天的时间就足以完成教程了。

<!--more-->

## 起步

本章节余下的内容会指导你完成本地开发环境的搭建，如果你只想读教程的话就可以直接进入第一步：[Step 0 - 起步](/p/angular-tutorial-bootstrapping/)

## 使用代码

本教程使用 [Git](http://git-scm.com/) 来管理源代码。

### 安装Git

从 <http://git-scm.com/download> 下载和安装 Git，在 git 命令行界面中，将会使用到的命令有：

  * `git clone`：克隆一个远程代码仓库到本地机器
  * `git checkout ...`：登入 / 登出一个仓库的不同分支或标签

### 下载 angular-phonecat

用以下命令从 GitHub 下载 [angular-phonecat repository](https://github.com/angular/angular-phonecat)：

```
git clone --depth=14 https://github.com/angular/angular-phonecat.git
```

这条命令会在你的当前目录下创建`angular-phonecat`代码仓库。

> `--depth=14`选项会告诉 Git 只拉取最新的14条 Commits，这会让你的下载速度快很多。

把当前目录转到`angular-phonecat`：

```
cd angular-phonecat
```

从现在开始，如非特别说明，教程中所有的指令都是在`angular-phonecat`目录下执行的。

### 安装 Node.js

如果想要运行已经预配置好的 web 服务器和测试工具，你还需要安装 [Node.js v0.10.27+](http://nodejs.org/)

你可以通过 <http://nodejs.org/download/> 下载 Node.js 安装包。 使用以下命令查看安装好的 Node.js 版本：

```
node --version
```

在基于 Debian 的分布式系统下，存在另外一个名叫`node`的工具，这样一来名字就冲突了。推荐的解决方案是安装`nodejs-legacy`包，这个包会将我们需要的`node`重命名为`nodejs`

```
apt-get install nodejs-legacy npm
nodejs --version
npm --version
```

> 如果需要在本地环境下运行不同版本的 Nodejs，可以考虑安装 [Node Version Manager (nvm)](https://github.com/creationix/nvm "Node Version Manager Github Repo link")

安装好 Nodejs 后，可以通过以下命令安装项目依赖：

```
npm install
```

这条指令会读取 angular-phonecat 目录下的`package.json`文件，并且把以下内容下载到`node_modules`目录：

  * [Bower](http://bower.io/) - 客户端的包管理器
  * [Http-Server](https://github.com/nodeapps/http-server) - 一个简单的本地静态 web 服务器
  * [Karma](https://github.com/karma-runner/karma) - 单元测试框架
  * [Protractor](https://github.com/angular/protractor) - 端到端（E2E）测试框架

执行`npm install`也会自动地使用 bower 将 Angular 下载到`app/bower_components`目录。

> 需要注意的是，angular-phonecat 项目使用 npm 脚本来安装和运行这些工具，这意味着它们在默认情况下没有被全局安装。查看下面的**安装帮助工具**以获得更多信息。

本项目为了简化开发过程中一些无关紧要的任务，已经预设了一些 npm 脚本：

  * `npm start`
  
    - 启动一个本地开发服务器
  * `npm test`
  
    - 启动 Karmar
  * `npm run protractor`
  
    - 启动 Protractor
  * `npm run update-webdriver`
  
    - 安装 Protractor 的依赖驱动

### 安装帮助工具（可选）

Bower，Http-Server，Karma 和 Protractor 模块同时也是可执行的工具，可以全局安装并且通过终端、命令行直接执行。在本教程中你不需要这么做，但是如果你想要直接执行它们，你可以使用`sudo npm install -g ...`全局安装这些模块。

比如，使用以下命令来全局安装Bower：

```
sudo npm install -g bower
```

（如果在 windows 下请忽略 sudo ）

然后你就可以直接执行 bower 工具了，像这样：

```
bower install
```

### 启动开发服务器

虽然本 Angular 应用是以纯客户端代码组成，并且可以使用浏览器通过点击文件系统中的页面直接打开，但我们还是需要一个 Http web 服务器，尤其是出于一些安全方面的考虑，在页面是从文件系统中直接加载的情况下，大多数主流浏览器会阻止 JavaScript 发送异步请求。 本项目使用了一个简单的静态 Web 服务器来搭载应用。使用以下命令来启动它：

```
npm start
```

这条命令会创建一个监听 8000 端口的本机服务器，你现在可以通过以下地址访问应用了： <http://localhost:8000/app/index.html>

> 如果想要更改 Web 服务器启动的 ip 或者 port， 可以编辑`package.json`中的`start`脚本。你可以使用`-a`来设置地址，使用`-p`来设置端口号。

### 执行单元测试

单元测试关注应用程序中细小且独立的代码块，以保证 JavaScript 代码运行的正确性。单元测试的代码存放在`test/unit`目录中。 本项目使用 [Karma](https://github.com/karma-runner/karma) 作为单元测试框架，使用以下命令启动 Karma：

```
npm test
```

这条命令会启动 Karma 单元测试执行器。Karma 会读取配置文件`test/karma.conf.js`，在其指导下完成：

  * 打开 Chrome 浏览器并且连接到 Karma
  * 在浏览器中执行所有单元测试
  * 在终端或命令行中打印测试结果
  * 监听项目下的所有 JavaScript 代码，当它们发生改变的时候重新执行单元测试

你可以在开发过程中保持 Karma 后台运行，它会及时地告诉你修改后的代码是否通过了单元测试。

### 执行端到端测试

端到端测试通过模拟一个真正的用户与运行在浏览器上的应用程序实时交互来保证整个应用在客户端上表现与行为的正确性。 端到端测试的代码存放在`test/e2e`目录中。 本项目使用 [Protractor](https://github.com/angular/protractor) 来执行端到端测试。Protractor 为了与浏览器交互将依赖于一些驱动，你可以通过以下指令安装它们：

```
npm run update-webdriver
```

（运行一次就够了）

因为 Protractor 通过与应用程序交互来工作，所以我们需要先启动 Web 服务器：

```
npm start
```

然后在另外一个终端或命令行窗口中，使用以下命令启动 Protractor 测试脚本：

```
npm run protractor
```

Protractor 会读取配置文件`test/protractor-conf.js`，在其指导下完成：

  * 打开 Chrome 浏览器并连接到应用程序
  * 在浏览器中执行所有的端到端测试
  * 在终端或命令行中打印测试结果
  * 关闭浏览器并退出

当你对 HTML 视图做出改动或者想要测试整个应用程序是否运行正常的时候，最好是执行一次端到端测试。在提交代码前执行此类测试是一种普遍的做法。

现在你已经在本地机器上搭好了环境，我们可以从头开始本教程了：[Step 0 - 起步](/p/angular-tutorial-bootstrapping/)
