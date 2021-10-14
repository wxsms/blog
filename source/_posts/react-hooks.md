---
title: 'React Hooks'
date: 2019-09-23T02:13:05.102Z
tags: [react,vue,javascript]
---

[Hooks](https://reactjs.org/docs/hooks-intro.html) 是 React 在 v16.8.0 版本所支持的一个新特性，允许开发者在 Functional Component 中实现「状态」以及「生命周期」等原本只能在 Class Component 中实现的特性。

而 [Vue Function-based API](https://zhuanlan.zhihu.com/p/68477600) 是将来会出现在 Vue.js 3.0 大版本中的一个 API 变革的整体预览，二者（至少）在形式上保持了高度统一，而 yyx 也在文章中直言是受到了 React Hooks 的启发，二者分别解决了自身框架的一些痛点，并允许开发写编者更加「纯粹」的函数式组件。也许可以认为是未来前端框架发展的一个大方向？

<!-- more -->

以下代码例子大部分来自于[官方文档](https://reactjs.org/docs/hooks-intro.html)。

## 简介

React Hooks 提供了两个基本 Hooks: `useState` 与 `useEffect`，其中：

* `useState` hook 赋予了函数式组件保存以及更新「状态」的能力
* `useEffect` hook 赋予了函数式组件在「生命周期」之中执行函数的能力

官网上的一个简单例子：

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

以上组件定义了一个函数式组件，并在组件内注册了一个 state `count`，实现了每当点击按钮的时候，`count` 会自增 1，视图相应更新，并且页面标题会随着 `count` 更新而更新的功能。

## useState

`useState` 的作用很明显，也很简单：它接受一个参数作为 state 的初始值，返回一个数组，数组第一位是 state 的值，第二位是改变该 state 的方法。以上例子使用了 ES6 的[数组解构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)特性来简化了代码，同时这也是推荐的写法。

如果一个组件需要保有多个状态，那么有两种实现方式：

1. 分别定义
    ```javascript
    const [age, setAge] = useState(42);
    const [fruit, setFruit] = useState('banana');
    const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
    ```
2. 合并定义
    ```javascript
    const [state, setState] = useState({
       age: 42,
       fruit: 'banana',
       todos: [{ text: 'Learn Hooks' }]
    });
    ```

React 并没有明确推荐哪一种形式，但是有一点需要注意的是，如果采用第二种形式，与传统的 Class Component 有所区别的是，`setState` 不会默认为 `state` 进行 merge 操作，而是 replace，也就是说如果要达到预期的效果应该这么写：

```javascript
const [state, setState] = useState({
  age: 42,
  fruit: 'banana',
  todos: [{ text: 'Learn Hooks' }]
});

// 将 age 变更为 50 而不影响其它 state
setState(state => ({
  ...state,
  age: 50 
}))
```

## useEffect

`useEffect` 可以看作是传统生命周期函数 `componentDidMount` / `componentDidUpdate` / `componentWillUnmount` 的结合，不过有一点区别是 `useEffect` 是异步执行的，不会阻塞渲染。它的用法要比 `useState` 稍微复杂些。

最简单的例子就跟上面的一样：

```javascript
useEffect(() => {
  // Update the document title using the browser API
  document.title = `You clicked ${count} times`;
});
```

接受一个函数作为参数，**每当视图重新渲染完成后**，函数将会被执行。也就是说，它可以看做是一个 `componentDidMount` 与 `componentDidUpdate` 的综合。

有时候我们需要在 `componentDidMount` 的时候为组件注册一些事件，然后在 `componentWillUnmount` 时销毁它，那么这时候可以在函数结束时返回另一个函数，返回的函数就将会作为「清理」函数。

```javascript
useEffect(() => {
  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
});
```

不过很明显我们还需要做一件事情：并不是所有 `componentDidUpdate` 都需要进行注册、销毁这一系列操作，只有在当某个监听的 value 真正发生了变化的时候才需要。因此 `useEffect` hook 提供了第二个参数。参数为一个数组，数组中传入需要监听的变量。只有当数组中任一参数的值（或引用）发生了改变时，effect 函数才会被执行。

```javascript
useEffect(() => {
  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
}, [props.friend.id]); // Only re-subscribe if props.friend.id changes
```

（文档中有提到在之后的版本中这个参数可能会在构建阶段自动加入，这样相当于 React 在某种程度上也向 Vue.js 靠近了一点点，或者说相互借鉴）

如果想要定义一个只在 `componentDidMount` 时执行一次的 effect，那么第二个参数可以传一个空数组，它就再也不会在 `componentDidUpdate` 时被执行。

## 规则

React 为 Hooks 制定了两条规则：

1. 只在顶层调用 Hooks，避免在循环体、条件判断或者嵌套函数中调用。因为 React 对 Hooks 的解释依赖于它们定义的顺序，开发者必须保证每次 Render 的过程中 Hooks 执行的顺序都是一致的，这样 Hooks 才能正确工作。
2. 只在 React Function 中调用 Hooks。

此外，React 还提供了一个 Eslint 插件 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) 来确保各位遵守规则。

## 自定义 Hooks

自定义 Hooks 实际上跟 React Hooks 的初衷有一定关系：为了解决某些与状态绑定的逻辑很难在跨组件中复用的问题。由于 React 并不提倡 Class Component 使用继承的方式来复用高阶逻辑（实际上是因为 React 并没有像 Vue 一样对生命周期函数等做类似 Mixin 的工作，因此会导致一些 Bug），所以这个问题在传统写法中几乎无解。而 Hooks 则是为了解决这个问题而来的。

（ [Vue Function-based API](https://zhuanlan.zhihu.com/p/68477600) 这篇文章中也提到了 Mixin 虽然为 Vue 带来了一些方便，但是同时也存在许多问题，3.x 版本中 Vue 也将使用类似的方式来使逻辑复用更清晰，算是殊途同归）

官网上举了一个例子：有多个组件需要根据「用户是否在线」这个标志来显示不一样的东西，而获取这个标志的逻辑是固定的，因此可以写成一个自定义 Hook：

```javascript
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

而使用它的方式则非常简单：

```javascript
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

至此可以发现，所谓的自定义 Hooks，其实只是把能复用的逻辑「抽离」了出来当做一个函数用以在各处执行，并没有什么特别之处。React 建议自定义 Hooks 使用 'use' 作为方法名的前缀，这样可以让代码可读性显得更高，同时也可以让 lint 工具自动识别并检测该函数是否符合既定规则。
