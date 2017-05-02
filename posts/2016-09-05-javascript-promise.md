---
id: javascript-promise
title: JavaScript Promise
date: 2016-09-05T17:27:26+00:00
categories:
  - JavaScript
tags:
  - Async
  - ES6
  - Promise
---
知乎上有一个黑 JavaScript 的段子，大概是说：

> N 年后，外星人截获了 NASA 发射的飞行器并破解其源代码，翻到最后发现好几页的 }}}}}}&#8230;&#8230;

这是因为 NASA 近年发射过使用 JavaScript 编程的飞行器，而 Node.js 环境下的 JavaScript 有个臭名昭著的特色：Callback hell（回调地狱的意思）

JavaScript Promise 是一种用来取代超长回调嵌套编程风格（特指 Node.js）的解决方案。

比如：

```
getAsync("/api/something", (error, result) => {
    if(error){
        //error
    }
    //success
});
```

将可以写作：

```
let promise = getAsyncPromise("/api/something"); 
promise.then((result) => {
    //success
}).catch((error) => {
    //error
});
```

乍一看好像并没有什么区别，依然是回调。但最近在做的一个东西让我明白，Promise 的目的不是为了干掉回调函数，而是为了干掉嵌套回调函数。

<!--more-->

## 定义

MDN 定义：

> The Promise object is used for asynchronous computations. A Promise represents a value which may be available now, or in the future, or never.

意思大概就是，Promise 是专门用于异步处理的对象。一个 Promise 代表着一个值，这个值可能已经获得了，又可能在将来的某个时刻会获得，又或者永远都无法获得。

简单地说，Promise 对象就是值的代理。经纪人。

## 简单用法

创建一个 Promise：

```
let promise = new Promise((resolve, reject) => {
    //success -> resolve(data)
    //error -> reject(data)
});
```

使用 `new Promise`  来创建 Promise 对象，构造器中传入一个函数，同时对该函数传入 `resolve`  和 `reject`  参数，分别代表异步处理成功与失败时将要调用的方法。

处理 Promise 结果：

```
promise.then(onFulfilled, onRejected)
```

使用 `then`  方法来注册结果函数，共可以注册两个函数，其中 `onFulfilled`  代表成功，后者代表失败。两个参数都是可选参数。

不过，对于失败处理，更加推荐的方式是使用 `catch`  方法：

```
promise.catch(onRejected)
```

这两个方法可以进行链式操作。组合示例：

```
function asyncFunction() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Async Hello world');
        }, 1000);
    });
}

asyncFunction()
    .then((value) => {
        console.log(value); //Async Hello world
    })
    .catch((error) => {
        console.log(error);
    });
```

这里使用了定时器来模拟异步过程，实际上其它异步过程（如 XHR）也大概都是这么个写法。

## 状态

Promise 对象共有三种状态：

  * Fulfilled （成功）
  * Rejected （失败）
  * Pending （处理中）

有两条转换路径：

  * Pending -> Fulfilled -> `then`  call
  * Pending -> Rejected -> `catch`  call

Promise 对象的状态，从 Pending 转换为 Fulfilled 或 Rejected 之后， `then`  方法或者 `catch`  方法就会被立即调用，并且这个 promise 对象的状态不会再发生任何变化。也就是说，调用且只调用一次。

## 链式操作

链式操作是 Promise 对象的一大亮点。

本节引用一些 <a href="https://github.com/azu/promises-book" target="_blank"><em>Promise Book</em></a> 的内容。

例如：

```
function taskA() {
    console.log("Task A");
}
function taskB() {
    console.log("Task B");
}
function onRejected(error) {
    console.log("Catch Error: A or B", error);
}
function finalTask() {
    console.log("Final Task");
}

var promise = Promise.resolve();
promise
    .then(taskA)
    .then(taskB)
    .catch(onRejected)
    .then(finalTask);

//Task A
//Task B
//Final Task
```

该代码块实际流程如图所示：

![](https://cloud.githubusercontent.com/assets/5960988/25607281/66523534-2f48-11e7-9586-fc6eb7300ec5.png)

&nbsp;

可以看到，这个 onRejected 并不仅仅是 TaskB 的失败处理函数，同时它也是 TaskA 的失败处理函数。而且当 TaskA 失败（reject 被调用或者抛出异常）时，TaskB 将不会被调用，直接进入失败处理。熟悉 express 的玩家应该能看出来了，这简直就和中间件一模一样嘛。

比如说，TaskA 出现异常：

```
function taskA() {
    console.log("Task A");
    throw new Error("throw Error @ Task A")
}
function taskB() {
    console.log("Task B");// 不会被调用
}
function onRejected(error) {
    console.log(error);// => "throw Error @ Task A"
}
function finalTask() {
    console.log("Final Task");
}

var promise = Promise.resolve();
promise
    .then(taskA)
    .then(taskB)
    .catch(onRejected)
    .then(finalTask);
```

这里的输出应该就是：

```
//Task A
//Error: throw Error @ Task A
//Final Task
```

需要注意的是，如果在 `onRejected`  或 `finalTask`  中出现异常，那么这个异常将不会再被捕捉到。因为并没有再继续注册 `catch`  函数。

借助 Promise 链式操作的特点，复杂的 JavaScript 回调简化将不再是梦。

## 递归

Promise 可以实现递归调用，在用来一次性抓取所有分页内容的时候有用。例：

```
function get(url, p) {
  return $.get(url + "?page=" + p)
      .then(function(data) {
          if(!data.list.length) {
              return [];
          }

          return get(url, p+1)
              .then(function(nextList) {
                  return [].concat(data.list, nextList);
              });
      });
}

get("urlurl", 1).then(function(list) {
    console.log(list);//your full list is here
});
```

## 实用方法

### Promise.all

`Promise.all`  接受一个 promise 对象的数组作为参数，当这个数组里的所有promise对象全部变为 resolve 或 reject 状态的时候，它才会去调用 `then`  方法。

例：

```
function taskA() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('TaskA resolved!');
            resolve();
        }, 1000);
    });
}

function taskB() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('TaskB resolved!');
            resolve();
        }, 2000);
    });
}

function main() {
    return Promise.all([taskA(), taskB()]);
}

main()
    .then((value) => {
        console.log('All resolved!');
    })
    .catch((error) => {
        console.log(error);
    });

//TaskA resolved!
//TaskB resolved!
//All resolved!
```

### Promise.race

跟 `Promise.all`  类似，略有区别，从名字就能看出来，只要有一个 Task 执行完毕，整个 Promise 就会返回。但是需要注意的是，返回以后并不会取消其它未完成的 Promise 的执行。

```
function taskA() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('TaskA resolved!');
            resolve();
        }, 1000);
    });
}

function taskB() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('TaskB resolved!');
            resolve();
        }, 2000);
    });
}

function main() {
    return Promise.race([taskA(), taskB()]);
}

main()
    .then((value) => {
        console.log('All resolved!');
    })
    .catch((error) => {
        console.log(error);
    });

//TaskA resolved!
//All resolved!
//TaskB resolved!
```

## 支持性

由于是 ES6 语法，目前在浏览器端支持不是特别好，很多移动端浏览器以及 IE 家族均不支持（具体可查看 MDN）。如果要在浏览器端使用需要借助 Babel 编译器。

至于 Node.js 环境则毫无问题。
