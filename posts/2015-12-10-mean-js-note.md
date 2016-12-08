---
id: mean-js-note
title: MEAN.js 学习笔记
date: 2015-12-10T16:35:33+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - ExpressJs
  - MEAN-Stack
  - MongoDB
  - NodeJs
---

![](/static/images/meanjs-logo.png)

之前一直以为MEAN只是一个概念上的东西，表示以[Mongodb](http://mongodb.org/) [Express](http://expressjs.com/) [AngularJs](http://angularjs.org/) [NodeJs](http://nodejs.org/)为基础的全栈应用开发模式。这几天在公司接手相应项目的时候发现已经有人做出来并且维护着一些这样的App结构体，用过以后觉得还不错。[MEANJS](https://github.com/meanjs/mean)是一个开源的JavaScript全栈应用解决方案，主要用到的技术自然就是以上提到的那些。使用成熟的解决方案可以使自己的项目更加易于开发以及维护，等等好处就不再赘述。

## 关于MEAN

本文主要关注MEANJS本身，对于MEAN之中的种种技术就不再多做介绍。下面贴MEANJS给出的一些链接。

  * MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
  * Express - The best way to understand express is through its [Official Website](http://expressjs.com/), which has a [Getting Started](http://expressjs.com/starter/installing.html) guide, as well as an [ExpressJS Guide](http://expressjs.com/guide/error-handling.html) guide for general express topics. You can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
  * AngularJS - Angular&#8217;s [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the[Egghead Videos](https://egghead.io/).
  * Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.

## 安装依赖

作为一个集大成者，MEANJS需要的运行环境还是挺多的，但是相对Java项目来说简直不值一提。

  * **NodeJs** - 没有Node谈何MEAN，注意的是目前的MEANJS版本（0.3.x）还不支持最新的5.x NodeJs，我就中了这招
  * **MongoDB** - 和NodeJs的集成比较好，下载安装包一路next即可
  * **Ruby/Python/.Net 2+** - 一些Node的模块需要用到这些东西，毕竟Node只是一个runtime，在服务器端一些稍微底层的操作还是要用到其他东西（12-14-2015更新：Python必须是2.x版本）
  * **Bower** - 前端包管理器，和npm组成一前一后的完整管理体系，相当于Java的Maven
  * **Grunt/Grunt CLI** - JavaScript世界的自动化工具，重复工作全靠它。CLI是Grunt的命令行工具。
  * **Sass/Less** - MEANJS用到了Sass去编译CSS，所以也要添加它的支持。其实我个人感觉这个有点多余了。

## 启动MEANJS APP

### 安装依赖模块

完成以上安装以及相应环境变量的配置以后，就可以准备启动 MEANJS 服务器了。首先需要在文件夹根目录运行 `$ npm install` 指令，根据 Readme 中的说法，这条指令做了以下的事情：

  1. 安装运行所需的 Node 模块
  2. 如果是测试环境则安装开发测试所需的 Node 模块
  3. 最后执行 bower 安装前端模块

不过我在最后一步有时候会遇到问题，需要手动再进行一次 `$ bower install`，另外，npm 的官方源在大陆访问并不稳定，可以使用[淘宝镜像](http://npm.taobao.org/)替代，Ruby 也是同理：[Ruby镜像](https://ruby.taobao.org/)。

12-14-2015 更新：这一步容易出现问题，一般仔细看 Log 都能找到问题所在，无非是哪个依赖没有配置环境变量/版本不对等，重新配置好以后删除 `Node_modules` 文件夹再重新运行命令。

### 启动 Mongodb

因为 MEANJS 默认为我们做了一个简单的用户注册登录模块，里面有一些数据库的增删查改，所以在启动服务器之前需要先启动数据库。随便找一个地方打开控制台输入 `$ mongod --dbpath ***`，\***处填写一个路径，mongod 就能够在指定位置创建一个文件型数据库并连接之，如果该位置已存在数据库文件则会直接打开连接。

### 启动服务器

在以上都准备完成以后，我们就可以在项目根目录通过一条简单的指令 `$ grunt` 来启动服务器了，启动成功后可以在 <http://localhost:3000> 看到项目主页。

### 关于Grunt

`$ grunt` 这条指令会读取项目目录下的 `gruntfile.js`** **文件，并执行文件中定义的 task。MEANJS 的文档中并没有对其功能进行说明，以下是我的解读：

#### 插件配置

以下都是 grunt task 中用到的插件的相关配置，具体插件以及相关文档都可以在[Grunt插件页面](http://www.gruntjs.net/plugins) 找到。

```
env: {
      test: {
        NODE_ENV: 'test'
      },
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    }
```

**env**定义了三个服务器的运行环境：测试，开发，以及产品，在文件的最后会用到。

```
//......
defaultAssets = require('./config/assets/default'),
testAssets = require('./config/assets/test'),
//......
watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: true
        }
      },
      //......
    }
```

**watch**指定了动态监听的目录/文件，可以看到在每一个View/Js/Css监听列表中都加入了 `livereload` 选项，这个选项的作用是当被监听的文件发生变化时，浏览器会自动刷新。不过 watch 会再创建一个监听端口（默认为 35729），打开 <http://localhost:35729/> 可以发现。被加载的首先是配置文件 `./config/assets/default.js` 与相应的 `test.js` 等，然后再配置文件内可以找到文件列表，其中已经包括已经用到的以及将来会加入的文件（通过通配符实现），只要我们在开发时把文件放在相应结构位置上，grunt 就会自动监听。

```
nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          watch: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
        }
      }
    }
```

`nodemon`** **配置了服务器自动重启。当 server 端的 config/views/js 文件发生变化时，`server.js` 脚本就会自动执行。由于只是服务器的重启而不是重新执行 grunt，所以几乎是秒速。以前用过一些类似的 node module 叫 superviso r和 forever，不过这个集成到了 grunt task 中。写过 JavaEE project 的人再用这个才能体会到时间的宝贵。

```
concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true
      }
    }
```

`concurrent`插件可以使任务并发执行，让前端与服务器端监听同时在一个终端窗口中执行/ Log

`cshint/csslint`这两个插件主要是为了在 build 的时候顺便检查一下js/css文件中有没有常见的 warning / error，存在 error 时会停止 build tas k并给出提示，不过控制台输出用户体验不是很好，开发过程中作用不大，我们都有 IDE，需要作为产品上线时跑一遍可能会更有参考价值。

后面的`ngAnnotae`插件可以在build的过程中对 angular j s的 annotation 进行简化以减少代码量，提高效率，属于锦上添花型。`uglify/cssmin`则相应地执行 js/css 代码压缩任务。至于`sass/less`很明显就是 css 编译器了。再之后的多是 debug / test 插件。

#### 注册任务

```
grunt.registerTask('taskName', ['***', '***']);
```

类似像这样的代码就是向grunt注册一个任务，第二个数组参数则是注册任务的内容，里面可以填另一个任务的名字或者是插件的名字，或者直接填写function取代该数组。通过在控制台输入 `$ grunt taskName` 执行任务，而不输入 taskName 的话则是执行 default 任务，当前 `gruntfile.js` 中的default task如下：

```
// Run the project in development mode
  grunt.registerTask('default', ['env:dev', 'lint', 'mkdir:upload', 'copy:localConfig', 'concurrent:default']);
```

这个任务里面包含了一些子任务，就不一一说明了，有兴趣的可以自行查看，到这里终于可以说说 `$ grunt` 指令到底做了什么：

  1. 设置运行环境为 dev，即开发
  2. 执行 js/css 等文件的语法检查
  3. 确保上传路径存在（MEANJS 默认带了一个用户上传头像的功能）
  4. 加载一个自定义配置文件（里面可以填写 db 以及一些 api key 等信息）
  5. default 模式启动 concurrent 前后端热部署

可以看到这里面并没有启动服务器的指令，其实在nodemon中已经配置了服务器入口即 `server.js`。于是在所有准备工作完成后，开发环境的服务器就启动起来了。

当然 gruntfile 中也包含了 dev 以及 tes t环境的 task，需要切换运行环境的时候只需要在 grunt 命令中加入相应参数即可，还是比较方便的。

## 项目结构

### 根目录结构

```
├── bower.json
├── config
├── gruntfile.js
├── modules
├── package.json
└── server.js
```

以上是精简过后的根目录组成，不包括node_modules和public文件夹，以及一些optional和test相关的文件。

  * **bower.json/package.json** - 前端/后端依赖说明文件，需要添加依赖时在文件里指定 ID /版本，再运行 `$ bower install` 或者 `$ npm install` 就会将指定包下载到 `node_modules/public` 文件夹中
  * **gruntfile.js** - grunt 任务配置文件
  * **server.js** - 服务器启动文件
  * **config** - 配置文件
  * **modules** - App 模块，也就是需要我们大量写代码的地方了，可以看到 MEANJS 项目已经包含了若干模块，我们可以在这基础之上添加自己的业务逻辑，或者推到重来

由于 MEANJS 的目录原则是模块优先，所以前后端的 MVC 会在相应模块目录内得到体现，这点与使用 express js 创建的目录结构有所区别。不过之前公司一位 STE share ExtJs 的时候提到其实都是大同小异，反正到最后目录结构都会变得臃肿。

### 模块结构

```
modules
│   └── moduleName
│       ├── client
│       │   ├── config
│       │   ├── controllers
│       │   ├── css
│       │   ├── img
│       │   ├── services
│       │   └── views
│       └── server
│           ├── config
│           ├── controllers
│           ├── models
│           ├── policies
│           ├── routes
│           └── templates
```

一个模块一般包含以上目录，首先从前端/后端分开，然后是各自的配置/ MVC，非常科学。值得一提的是每个模块各自用到的独立 css / image 等资源也是分开存放的，grunt 会在 build 的时候把它们全部读取并且载入，如果是 production 环境更会将同类压缩到一个文件中去，所以我们并不需要写很多的 include 之流。

## 总结

相对于手动使用 MEAN 各项技术结合写程序来说，使用 MEANJS 解决方案可以让我们更方便且快速地搭建项目，并且使我们不用太过于关注业务逻辑以外的问题，开发效率在全栈统一的保证下又提高了不少，不得不说确实是值得中小型项目去研究并且尝试使用一下。至于企业级大型项目，不知道有没有研究或者什么公司尝试过，不太清楚是否适合。
