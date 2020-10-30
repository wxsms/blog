---
permalink: '/posts/2019-11-15-conditional-rendering-in-react.html'
title: 'Conditional Rendering in React'
date: 2019-11-15T02:20:42.155Z
tags: [JavaScript,React,ReactNative]
---

如何进行条件渲染是一个 MVx 框架最基础的问题之一，但是它在 React 中总是会给人提出各种各样的问题。要么「**不够优雅**」，要么「**不够可靠**」，要么「**不够好用**」，现有的各种各样的方法之中，总是逃不过这三种问题的其中之一。至于 React-Native，虽然它与 React 「原则上一致」，但它存在的问题实际上就是要比 React 更多一些。

<!-- more -->

## if 语句与三元表达式

在 JSX 世界中，用 if 语句以及三元表达式去完成条件渲染是最直观的方式。

```jsx
function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  // the 'if' way
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
  // or the 'conditional operator' way
  // return isLoggedIn ? <UserGreeting /> : <GuestGreeting />;
}
```

这种方式确实足够优雅，也足够可靠：毕竟它完美地沿用了语言本身的逻辑和语法，没有创造其它累赘的东西。但是它真的好用吗？我相信许多重度 React 使用者都会对此表示无奈：现实工程中诸如此类需要做条件渲染的地方多如牛毛，如果每一处我们都得给它写 if-else（三元表达式虽然相对来说更好用一些，但是它的应用场景毕竟更有限）并且将条件渲染体抽离主体作为子组件来做，那我真的好绝望，这感觉就好像是在现代社会躬行刀耕火种一样。况且不是所有的项目都需要「完美地优雅」，更多时候我们这种开发者只想尽快把工作完成，仅此而已。

实际上这种方案已经足以应付 100% 场景的需求了，并且你可能已经意识到，本质上来说**这就是唯一的方案**。但其存在的问题实在过于让人沮丧，因此才有了下面的一些「拓展」方案。

## 使用变量

React 官方文档提出的第二种方式是使用变量，通过将元素暂存在变量中，可以让开发者控制组件中的一部分而不影响其它内容。

```jsx
class LoginControl extends React.Component {
  //...
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let button;

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
}
```

这样做的好处是能够更灵活地控制组件内部的渲染，而不必去创建更多的子组件。但是其问题非常明显：创建了一个「多余」的变量，非常地不「优雅」。所谓「如无必要，勿增实体」，放在代码世界同样适用。它所做的事情也仅仅是将原本在 JSX 内部的条件判断挪到了外面，仅此而已。

想象一下这种场景：一个导航栏组件，其中的每个菜单、每个按钮都要根据某种条件去决定是否渲染，一个多余的变量就会变成几十个，最终导致代码中充斥着这样重复的、没有实际意义的垃圾，这是一个有追求的码农绝对无法忍受的。

这种方式有一个变体，就是通过创建一个类的 getter 来代替创建一个变量：

```jsx
class LoginControl extends React.Component {
  //...
  get _button () {
    const isLoggedIn = this.state.isLoggedIn;
    if (isLoggedIn) {
      return <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
      return <LoginButton onClick={this.handleLoginClick} />;
    }
  }
  
  render() {
    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        {this._button}
      </div>
    );
  }
}
```

这是一个小变通，好处是可以让 render 函数在条件渲染的数量上来以后不那么臃肿，易于维护。它与使用变量的方式并没有本质区别，同样是创建了一个无必要的 getter，但是确实是看起来更「优雅」了一些。但它只能在类组件中使用，无法在函数式组件中使用。

## 行内表达式

行内三元表达式可以用来解决一些小的 case，但由于其本身存在着巨大的限制，不可能被广泛使用。

```jsx
render() {
  const isLoggedIn = this.state.isLoggedIn;
  return (
    <div>
      The user is <b>{isLoggedIn ? 'currently' : 'not'}</b> logged in.
    </div>
  );
}
```

它的自身限制，一是只能做是非判断，如果要在是非的结果中继续判断就要再套一层三元表达式，那将会相当臃肿；二是它本身的语法就只适用于「小」的东西，像这种案例：

```jsx
render() {
  const isLoggedIn = this.state.isLoggedIn;
  return (
    <div>
      {isLoggedIn ? (
        <LogoutButton onClick={this.handleLogoutClick} />
      ) : (
        <LoginButton onClick={this.handleLoginClick} />
      )}
    </div>
  );
}
```

我是绝对写不出来的。实在是太不优雅、太难以阅读了。想象一下充斥着 `&&` / `||` / `?` / `:` 的 JSX 代码。:smile:

至于行内的 if-else，虽然不能直接写 if-else，但有一个利用了语言本身特性的方案，即利用逻辑操作符：

```jsx
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
```

这种方式适合用来做单方面的条件渲染，即条件成立则渲染，否则不渲染，或者反之。使用场景依然有限，同样可读性较差，只适合用来渲染较小的代码块。

而且，很多人也许不知道，这种写法在 React-Native 中是一个陷阱。由于 JavaScript 本身的特性允许（或者说鼓励）[truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) 和 [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) 形式的条件判断，很多情况下我们不会去刻意将它显式转换为一个 Boolean 值。当然在大多数情况下这都没有问题，除非它是一个空字符串：

```jsx
render() {
  const isLoggedIn = this.state.isLoggedIn;
  // when it is ''
  return (
    <View>
      {isLoggedIn && <LogoutButton/>}
    </View>
  );
}
```

这种代码在运行的时候会抛出一个 Error，导致应用崩溃：

```
Error: Text strings must be rendered within a <Text> component.
```

比如说，当你用某个 API 返回的数据中的某个值去进行条件渲染的时候，正常来说没有问题，但某一天服务突然出错了，这个字段返回了一个空字符串，那么应用就会突然面临大规模的崩溃。数据来源不可靠且没有进行显式 Boolean 转换的条件判断就像一个地雷，随时随地都可能会爆炸。

## 封装的方法

以上的几种形式其实都与刀耕火种无异，因此我们还有更高级的方案，比如封装一个方法：

```jsx
function renderIf (flag) {
  return function _renderIf (componentA, componentB = null) {
    return flag ? componentA : componentB;
  };
}
```

这样一来代码就可以简洁多了：

```jsx
class LoginControl extends React.Component {
  //...
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        {renderIf(isLoggedIn)(<LogoutButton/>, <LoginButton/>)}
      </div>
    );
  }
}
```

类似的方案还有封装组件：

```jsx
function RenderIf ({flag, children}}) {
  return flag ? children : null;
}

class LoginControl extends React.Component {
  //...
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        <RenderIf flag={isLoggedIn}>
          <LogoutButton/>
        </RenderIf>
        <RenderIf flag={!isLoggedIn}>
          <LoginButton/>
        </RenderIf>
      </div>
    );
  }
}
```

这种方案避免了在渲染函数体内出现大量的逻辑控制语句，取而代之的是可读性更强，也更易于使用的方法或组件，可以认为是在 React 世界中比较好的条件渲染解决方案了，「优雅」与「好用」都得到了较好的兼顾。但是，问题就出在，它不够「可靠」。

比如说以下的代码：

```jsx
class NavBar extends React.Component {
  //...
  render() {
    const user = this.state.user;
    return (
      <div>
        {renderIf(user)(<Welcome name={user.name}/>)}
      </div>
    );
  }
}
```

跟以上提及过的所有方案都不一样的是，当 `user` 为 `null` 或 `undefined`，或者其它任何在执行 `user.name` 会报错的 value 时，这一段代码就会报错。如果是 React-Native 应用，很不幸它就崩溃了。

```
TypeError: Cannot read property 'name' of null
```

导致这个区别的原因是，JavaScript 函数在执行之前会先对它的参数进行解析，而非等到真正运行时才解析。所以当 `user` 为以上 value 之一的时候，虽然按照函数的流程来说应该会对第一个参数直接忽略，但是实际上它还是被解析了。而 if-else 等内置条件判断语句则不同，假值条件之后的代码块会被完全忽略。

说到这里我已经开始怀念 `ng-if` 和 `v-if` 了：我只是一个普普通通的开发者，为什么我需要在如此基础的事情上考虑这么多？大家都是前端 MVx 框架，为什么 Vue.js 和 Angular.js 从来没有提出过这种问题？

大概这就是 React，这就是 Facebook 吧！

其实在这个方案出现问题之后，我已经找不出别的更好的方案了，除非某一天 EcmaScript 有了新的提案，新的语法，否则都将无解。因为无论怎么做，最终都无法绕过传参必然会被事先解释这一障碍。也就是说，在目前的大环境下，我无法得到一个在各种场景下都同时兼具「优雅」、「可靠」、「好用」的条件渲染解决方案，只能通过以上各种方案在不同场景下的混用来达到一个（有追求的码农的内心的）平衡。
