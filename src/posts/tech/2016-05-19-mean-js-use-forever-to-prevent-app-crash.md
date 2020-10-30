---
permalink: '/posts/2016-05-19-mean-js-use-forever-to-prevent-app-crash.html'
title: MEAN.JS 搭配 forever 使用以防止 app crash
date: 2016-05-19T15:24:46+00:00
categories:
  - JavaScript
tags:
  - Grunt
  - MEAN-Stack
  - NodeJs

---



MEANJS 预设的 Grunt task 中没有提供类似出错自动重启的任务，因此当实际使用它搭建了一个 app 部署到服务器上后发现经常有一些奇怪的问题导致其崩溃挂掉。然而根据 log 来看问题应该不是由于项目代码导致的，可能是 MEANJS 本身的问题，也可能是某些 Lib 的问题。这种情况下，我能想到的暂时性解决方案就是使用 forever 了。

个人觉得 MEANJS 在 production mode 中也使用 nodemon 来跑 watch 任务有些鸡肋，因为我们并不需要在产品服务器上频繁地更改代码。因此，我直接把它替换掉了。

<!-- more -->

这里需要注意的是，我们不能直接用 forever 去跑 `server.js` 脚本，因为这样的话下层代码拿不到 env settings，就会把启动模式设置为默认的开发模式。

因为 MEANJS 中已经自带了 forever 模块，所以就不用装它本身了，但是要安装 forever 的 grunt 插件：grunt-forever

```
npm install grunt-forever -save
```

在 tasks（initConfig） 中加多一项：

```javascript
forever: {
  server: {
    options: {
      index: 'server.js',
        logFile: 'log.log',
        outFile: 'out.log',
        errFile: 'err.log'
    }
  }
}
```

这里指定了 forever 执行的对象，以及 log 文件名，路径可以不指定，默认为项目根目录下的 forever 文件夹。因为这个插件生成的是守护进程，所以 log 只能输出到文件啦。

最后更改一下 prod task：

```javascript
// Run the project in production mode
grunt.registerTask('prod', ['build', 'env:prod', 'mkdir:upload', 'copy:localConfig', 'forever:server:start']);
```

OK，大功告成。

启动 production 服务器方式：

```
grunt prod
```

重启方式：

```
grunt forever:server:restart
```

停止服务器：

```
grunt forever:server:stop
```

&nbsp;
