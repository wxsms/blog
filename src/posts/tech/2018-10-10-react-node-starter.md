---
permalink: '/posts/2018-10-10-react-node-starter.html'
title: 'React node starter'
date: 2018-10-10T02:36:09.528Z
tags: [JavaScript, React, NodeJs]
sidebar: false
draft: false
---

<!-- 「」 -->

出于某种需求搭建了一个非常简单的、基于 React / Node / Express / MongoDB 的 starter 工程：[wxsms/react-node-starter](https://github.com/wxsms/react-node-starter)，旨在简化小型或中小型项目开发流程，关注实际业务开发。

目前所实现的内容有：

* 前后端完全分离
* 热重载
* 用户注册、登录

![](https://static.wxsm.space/blog/46710580-0ca53f00-cc7b-11e8-8328-f49e0a14c601.png)

麻雀虽小，五脏俱全。下面记录搭建过程。

<!-- more -->

## React

整个项目实际上是一个使用 [facebook/create-react-app](https://github.com/facebook/create-react-app) 创建出来的架构。

```
$ npm install create-react-app -g
$ create-react-app react-node-starter
```

如此就完事了。创建出来的项目会包含 React 以及 React Scripts，Webpack 等配置都已经包含在了 React Scripts 中。执行 `npm start` 会打开 [http://localhost:3000](http://localhost:3000)，但是有一个遗憾之处是，这里提供的热重载不是 HMR，而是整个页面级别的重新加载。

## Node & Express

要在前端项目的基础上加入 Node 服务端，由于项目的极简性质，需要考虑一个问题是：如何在不跨域、不加入额外反代的情况下完成这个任务。有幸的是 create-react-app 贴心地加入了 [Proxying API Requests in Development](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development) 功能，只需要给 `package.json` 加入一对键值，就可以达成目的：

```
"proxy": "http://localhost:3001"
```

这样一来，在开发环境下，前端会自动将 `Accept` Header 不包含 `text/html` 的请求（即 Ajax 请求）转发到 3001 端口，那么我们只需要将服务端部署到 3001 端口就好了。

至于生产环境则无此烦恼，只需要将 `npm run build` 打包出来的文件当做静态资源，服务器依旧照常启动即可。

在项目根目录下新建 `server` 文件夹，用来存放服务端代码。

`server/server.js`:

```javascript
#!/usr/bin/env node

const app = require('./app');
const http = require('http');

const port = 3001;
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
```

`server/app.js`:

```javascript
const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const router = require('./router');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '../build')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/api', router);
app.get('*', (req, res) => {
  res.sendFile('build/index.html', {root: path.join(__dirname, '../')});
});

module.exports = app;
```

就是一个典型的 Express HTTP 服务器。当处于开发环境时，`build` 目录只存在于内存中。执行生产构建脚本后，会打包至硬盘，因此上面的代码可以同时覆盖到开发与生产环境，无需再做额外配置。

准备完成后，将 `start` 脚本更新为：

```
"start": "concurrently \"react-scripts start\" \"nodemon server/server.js\""
```

即可。其中：

* [concurrently](https://github.com/kimmobrunfeldt/concurrently) 是为了在一个终端窗口中同时执行前端与服务端命令
* [nodemon](https://github.com/remy/nodemon) 是为了实现服务端热重载

熟悉 Node.js 的应该对这两个工具都不陌生。

这里有一个对原项目作出改变的地方是，出于尽可能简化的目的，将 `registerServiceWorker.js` 文件及其引用移除了，同时使用 Express 来对 `public` 文件夹做静态资源路由。

如此一来，重新执行 `npm start` 会发现 Express 服务器能够按照预期运行了。

## MongoDB

建好 Express 整体框架后，加入 MongoDB 的相关支持就非常简单了。安装 [mongoose](https://mongoosejs.com/)，然后在 `server` 目录下新建一个 `models` 文件夹用来存放 Model，然后新建一个 db 初始化文件：

`server/mongodb.js`

```javascript
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017');

fs.readdirSync(path.join(__dirname, '/models')).forEach(file => {
  require('./models/' + file);
});
```

最后将此文件在 `app.js` 中引用即可：

```javascript
require('./mongodb');
```

## Session Auth

本项目采用 Session 鉴权，那么在前后端分离的项目中，无法通过服务端模板来同步赋值，因此有一个问题就是如何让前端项目获取到当前登录的角色。出于尽可能简单的目的，最终做法是在页面入口初始化时向服务端发起请求获取当前登录角色，获取过程中显示 Loading 界面。用户信息获取成功后才开始真正的路由渲染，如果具体页面鉴权失败则重定向回登录页面。

## AntD

前端选用 [Ant Design](https://github.com/ant-design/ant-design) 作为 UI 框架，为了更方便地使用它，参考其文档教程，这里做一点小小的配置，首先安装 [react-app-rewired](https://github.com/timarney/react-app-rewired) 与 [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import)：

```
$ yarn add react-app-rewired babel-plugin-import
```

修改 `package.json` 中的脚本，将 `react-scripts` 全都替换为 `react-app-rewired`：

```json
{
   "scripts": {
     "start": "concurrently \"react-app-rewired start\" \"nodemon server/server.js\"",
     "build": "react-app-rewired build",
     "test": "react-app-rewired test --env=jsdom",
     "eject": "react-app-rewired eject"
   }
}
```

然后在项目根目录中创建 `config-overrides.js` 文件：

```javascript
const {injectBabelPlugin} = require('react-app-rewired');

module.exports = function override (config, env) {
  config = injectBabelPlugin(
    ['import', {libraryName: 'antd', libraryDirectory: 'es', style: 'css'}],
    config,
  );
  return config;
};
```

这样做的好处是，CSS 可以按需加载，并且引用 AntD 组件更方便了，如：

```javascript
import {Button} from 'antd';
```

## Redux

安装 Redux 全家桶：

```
$ yarn add redux redux-thunk react-redux immutable
```

然后按照 [示例项目](https://codesandbox.io/s/9on71rvnyo) 插入到项目中去即可。区别是为了在 action 中执行异步操作加入了一个中间件 [redux-thunk](https://github.com/reduxjs/redux-thunk)，以及原示例没有使用 [Immutable.js](https://facebook.github.io/immutable-js/)，也在本项目中加入了。

`src/redux/store.js`:

```javascript
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index';

export default createStore(
  rootReducer,
  applyMiddleware(thunk)
);
```
