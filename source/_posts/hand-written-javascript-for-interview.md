---
title: 'JavaScript 手写八股'
date: 2021-04-06T04:28:24.206Z
tags: [javascript]
---

<!-- 「」 -->

<!-- more -->

## 内置函数实现

首先解释一下，此处的实现以学习为目的，不考虑过多的边界情况，以及旧时代的糟粕兼容性，以功能实现以及原理解释为主。

### `typeof`


#### 原理

`typeof` 关键字的实现可以依靠 `Object.prototype.toString` 方法。

> `toString()` can be used with every object and (by default) allows you to get its class.
> 
> To use the `Object.prototype.toString()` with every object, you need to call `Function.prototype.call()` or `Function.prototype.apply()` on it, passing the object you want to inspect as the first parameter (called thisArg).

参考：[https://developer.mozilla.org/.../Object/toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#using_tostring_to_detect_object_class)

```javascript
Object.prototype.toString.apply({});
// "[object Object]"

Object.prototype.toString.apply([]);
// "[object Array]"

Object.prototype.toString.apply('string');
// "[object String]"

// ...
```

#### 实现

有一些特殊值需要注意的：

1. `typeof null` 输出 `object`，但上述方法输出 `[object Null]`
2. `typeof new Date()` 输出 `object`，但上述方法输出 `[object Date]`
3. `typeof Promise.resolve()` 输出 `object`，但上述方法输出 `[object Promise]`
4. `typeof new Map()` 输出 `object`，但上述方法输出 `[object Map]`, `WeakMap` / `Set` / `WeekSet` 类似
5. `typeof function* () {}` 输出 `function`，但上述方法输出 `[object GeneratorFunction]`
6. 等等...

可想而知，使用该方法是无法精确实现 `typeof` 的。因为 ES 的新标准在不断增加，上述不一致之处也会持续增加。因此，手写实现的方法只能假设以上 ES6+ 标准的内容不存在：

```javascript
/**
 * 仿照 typeof，获取入参的类型
 * @param obj
 * @returns string
 * @private
 */
function _typeof(obj) {
    // 1. 使用 Object.prototype.toString 获得包含类型的字符串
    // 2. 使用正则表达式获得想要的部分，这里也可用其他办法，比如直接 substr 或 replace
    // 3. 转小写
    const type = Object.prototype.toString.apply(obj)
        .match(/(?<=^\[object\s)\w+(?=\]$)/)[0]
        .toLowerCase();
    // 如果不想精确模仿 typeof 的输出，也可直接 return type
    return type === 'null' || type === 'date' ? 'object' : type;
}
```

测试：

```javascript
_typeof({});
// "object"

_typeof([]);
// "array"

_typeof('string');
// "string"

// ...
```

#### 缺点

该方式的缺点是，判断可以被污染。

> Using `toString()` in this way is unreliable; objects can change the behavior of `Object.prototype.toString()` by defining a `Symbol.toStringTag` property, leading to unexpected results.

```javascript
// 实例污染
const myDate = new Date();
myDate[Symbol.toStringTag] = 'myDate';

_typeof(myDate)
// "mydate"

// 原型链污染
const myDate2 = new Date();
Date.prototype[Symbol.toStringTag] = 'prototype_polluted';
_typeof(myDate2)
// "prototype_polluted"
```

其原理是，`Object.prototype.toString` 内部也是通过访问其 `Symbol.toStringTag` 来获得输出的，因此修改这个值即可修改其返回。

> The `Symbol.toStringTag` well-known symbol is a string valued property that is used in the creation of the default string description of an object. It is accessed internally by the `Object.prototype.toString()` method.

参考：[https://wiki.developer.mozilla.org/.../Symbol/toStringTag](https://wiki.developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag)

### `array.forEach`

`forEach` 为数组中的每一个元素执行一次 sideEffect 方法。

这个实现相比于 [Polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#polyfill) 而言，不过多关注边界问题。下同。

```javascript
/**
 * The forEach() method executes a provided function once for each array element.
 * 
 * @param callback(currentValue, index, array)
 * @param thisArg
 * @private
 */
Array.prototype._forEach = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function');
  }
  for (let i = 0; i < this.length; ++i) {
    callback.call(thisArg, this[i], i, this)
  }
}

// [1, 2, 3]._forEach(console.log)
// 1 0 [1, 2, 3]
// 2 1 [1, 2, 3]
// 3 2 [1, 2, 3]
```

### `array.map`

`map` 的实现与 `forEach` 类似，只不过多了返回值。

```javascript
/**
 * The map() method creates a new array populated with the results 
 * of calling a provided function on every element in the calling array.
 * 
 * @param callback(currentValue, index, array)
 * @param thisArg
 * @returns {[]}
 * @private
 */
Array.prototype._map = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function');
  }
  const res = [];
  for (let i = 0; i < this.length; ++i) {
    res[i] = callback.call(thisArg, this[i], i, this)
  }
  return res;
}

// [1, 2, 3]._map(v => v + 1)
// [2, 3, 4]
```

### `array.filter`

同上。

```javascript
/**
 * The filter() method creates a new array with all elements 
 * that pass the test implemented by the provided function.
 * 
 * @param callback(currentValue, index, array)
 * @param thisArg
 * @returns {[]}
 * @private
 */
Array.prototype._filter = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function');
  }
  const res = [];
  for (let i = 0; i < this.length; ++i) {
    callback.call(thisArg, this[i], i, this) && res.push(this[i])
  }
  return res;
}

// [1, 2, 3]._filter(v => v < 3)
// [1, 2]
```

### `array.some`

同上。

```javascript
/**
 * The some() method tests whether at least one element in the array
 * passes the test implemented by the provided function. It returns a Boolean value.
 * 
 * @param callback(currentValue, index, array)
 * @param thisArg
 * @returns boolean
 * @private
 */
Array.prototype._some = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function');
  }
  for (let i = 0; i < this.length; ++i) {
    if (callback.call(thisArg, this[i], i, this)) {
      return true;
    }
  }
  return false;
}

// [1, 2, 3]._some(v => v > 2)
// true
```
