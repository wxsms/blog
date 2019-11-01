---
permalink: '/posts/2017-02-08-react-note-basic.html'
title: 'React Note - Basic'
date: 2017-02-08 11:33:00
sidebar: false
categories:
  - JavaScript
tags:
  - React

---




React 学习笔记（基础篇）。

<!--more-->

## 安装

```bash
npm install -g create-react-app
create-react-app hello-world
cd hello-world
npm start
```

实践：create 这一步会同时执行 `npm install` 因此有失败的可能，多尝试几次就成功了。

这个程序跟 vue-loader 很像，会造出一个简单的手脚架，包含了 Babel 编译器以及打包工具等等。但是细看它的 `package.json` 文件并没有包含上述内容：

```json
"devDependencies": {
  "react-scripts": "0.8.5"
},
"dependencies": {
  "react": "^15.4.2",
  "react-dom": "^15.4.2"
}
```

因此，跟 vue-loader 不一样的是，react 这个手脚架把无关内容都封装了。这么做我觉得有利有弊：它让人用起来更方便，然而不可能达到直接使用原组件的自由度了。相比之下，这里我更喜欢 vue-loader 的处理方式。

## Hello World

最简示例：

```js
ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('root')
);
```

## JSX 语法

JSX 是 JavaScript 的一种语法扩展，实际上可以看做是语法糖。通过编译器，以下语法：

```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```

相当于：

```js
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world'
  }
};
```

后者就是编译后的结果，JSX 语法块变成了一个对象（称之为 `React element`）。

（JB 家的 IDE 已经对 JSX 语法提供了默认支持，不然这篇笔记就到此为止了）

JSX 支持一些稍微高级的用法，如：

```js
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);
```

在任何地方使用 JSX：

```js
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

## 元素

上面有说到 `React element`（元素），**元素**的概念与**组件**不同：元素是组件的组成部分。

### 元素渲染

```js
const element = <h1>Hello, world</h1>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

显然，它掌控了 DOM 中一个 ID 为 root 的节点，并往里面插入了元素。

### 元素更新

**已创建的元素是无法更新属性的**。因此，如果要改变它，只能够重新创建并渲染一次。

然而，托虚拟 DOM 的福，重新渲染并不代表重新渲染整个 DOM，React 会查找并只更新有改变的节点。

但是一般不回这么做。因为有一点很重要：在设计一个元素的时候就要考虑到它在所有状态下的表现。这个其实在其它框架下也是一样的。

## 组件

React 是组件化框架，因此组件是组成一个应用的基础。组件的特点：独立、可重用。

组件有两种定义方法：

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

或者：

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### 组件渲染

一个简单的例子：

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;

ReactDOM.render(
  element,
  document.getElementById('root')
);
```

可以看到元素组成了组件，组件又组成了元素，最后渲染在 DOM 上的是元素。

这个跟 Vue 很像了，区别是 Vue 没有区分所谓的“元素”跟“组件”，通通都是组件。

需要注意的是，在 React 世界中有个约定：自定义控件以大写字母打头。这是为了跟 HTML 元素有所区分。

### 组件使用与拆解

一个简单的例子：

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

需要注意的是，组件只能有一个根节点。（如例子中的 3 个 `Welcome` 必须包裹在 `div` 中）

### 参数只读

简单地说，React 不允许在控件内修改参数（包括值的修改以及对象修改）。允许修改的称之为“状态”（约等于 Vue 中的 component data）

## 状态管理与生命周期

### 添加状态管理

组件的更新依赖于状态，因此需要实时更新的组件应在其内部建立状态管理机制（低耦合高内聚）。

需要状态管理机的组件，必须使用 ES6 方式声明，如：

```js
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```

但是，此时，组件是无法更新的：因为状态在创建时就已经被决定了。

### 添加生命周期

代码有注释：

```js
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  // 组件渲染到 DOM 后调用
  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  // 组件将销毁后调用
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  
  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```

整个流程很简单清晰了：

1. ReactDOM 渲染 `Clock`，并对 state 做第一次初始化
2. `render` 方法被调用，插入 DOM
3. `componentDidMount` 方法被调用，计时器启动，`tick` 每秒钟执行一次
4. 每次 `tick` 执行都调用 `setState` 方法去更新状态，这样 React 就知道需要更新 DOM 了
5. 当组件被从 DOM 移除后，`componentWillUnmount` 执行

### 正确使用状态

直接更改 state 属性是不会触发 UI 更新的。因此，有一些规则需要遵守。

#### 不直接修改状态

在组件内进行修改状态操作，使用 `setState` 方法：

```js
// Wrong
this.state.comment = 'Hello';

// Correct
this.setState({comment: 'Hello'});
```

#### 关于异步更新

```js
// Wrong
this.setState({
  counter: this.state.counter + this.props.increment,
});

// Correct
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));
```

#### 状态合并

在进行 `setState` 的时候，只关心需要更改的属性即可，没有传入的属性会被保留。就好像新的状态被“合并”进入旧状态一样。

### 数据流

在 React 世界，组件与组件之间的状态传递是单向的，传值的方式就是将 state 当做 prop 传给子组件。

## 事件处理

跟 DOM 操作很像，区别：

1. 事件命名使用驼峰式
2. 直接向 JSX 中传入方法
3. 不支持 `return false` 操作

例：

```js
// DOM
<button onclick="activateLasers()">
  Activate Lasers
</button>

// React
<button onClick={activateLasers}>
  Activate Lasers
</button>

// A prevent default sample
function ActionLink() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}

// A class sample
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
```

注意：这个 `e` 是 React 封装过的，但遵循 W3C 标准，因此无需做浏览器差异化处理。

另外，`this.handleClick.bind` 方法是为了保证在 `onClick` 中调用了正确的 `this`，但使用箭头函数可以避免这个累赘的方法：

```js
class LoggingButton extends React.Component {
  // This syntax ensures `this` is bound within handleClick.
  // Warning: this is *experimental* syntax.
  handleClick = () => {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click me
      </button>
    );
  }
}
```

## 条件渲染

例子：

```js
render() {
  const isLoggedIn = this.state.isLoggedIn;
  
  let button = null;
  if (isLoggedIn) {
    button = <LogoutButton onClick={this.handleLogoutClick} />;
  } else {
    button = <LoginButton onClick={this.handleLoginClick} />;
  }
  
  return (
    <div>
      <Greeting isLoggedIn={isLoggedIn} />
      {button}
    </div>
  );
}
```

### 行内判断

例子：

```js
function Mailbox(props) {
  const unreadMessages = props.unreadMessages;
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 &&
        <h2>
          You have {unreadMessages.length} unread messages.
        </h2>
      }
    </div>
  );
}

const messages = ['React', 'Re: React', 'Re:Re: React'];
ReactDOM.render(
  <Mailbox unreadMessages={messages} />,
  document.getElementById('root')
);
```

这段代码的工作方式跟 JavaScript 一致：

* `true && expression` -> `expression`
* `false && expression` -> `false`

因此，当 `unreadMessages.length > 0` 为真时，后面的 JSX 会被渲染，反则不会。

除此以外还有三元表达式：

```js
render() {
  const isLoggedIn = this.state.isLoggedIn;
  return (
    <div>
      The user is <b>{isLoggedIn ? 'currently' : 'not'}</b> logged in.
    </div>
  );
}
```

### 阻止渲染

在组件的 `render` 方法内 `return null` 会阻止组件的渲染，但是其生命周期不受影响。


## 循环

一个简单的例子：

```js
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li>{number}</li>
);

ReactDOM.render(
  <ul>{listItems}</ul>,
  document.getElementById('root')
);
```

### 循环组件

一个列表组件示例：

```js
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById('root')
);
```

注意，这里对列表项添加了一个 `key` 属性。

### Key

`Key` 是 React 用来追踪列表项的一个属性。跟 angular 以及 vue 中 `track-by` 的概念一样。

如果列表项没有唯一标识，也可以用索引作为 key （不推荐）：

```js
const todoItems = todos.map((todo, index) =>
  // Only do this if items have no stable IDs
  <li key={index}>
    {todo.text}
  </li>
);
```

注意：`Key` 只能直接在数组循环体内定义。如：

```js
function ListItem(props) {
  const value = props.value;
  return (
    // Wrong! There is no need to specify the key here:
    <li key={value.toString()}>
      {value}
    </li>
  );
}

function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    // Wrong! The key should have been specified here:
    <ListItem value={number} />
  );
  return (
    <ul>
      {listItems}
    </ul>
  );
}
```

