---
title: Vue3 响应式原理
tags: vue
---

Vue3 与 Vue2 的最大不同点之一是响应式的实现方式。众所周知，Vue2 使用的是 `Object.defineProperty`，为每个对象设置 getter 与 setter，从而达到监听数据变化的目的。然而这种方式存在诸多限制，如对数组的支持不完善，无法监听到对象上的新增属性等。因此 Vue3 通过 Proxy API 对响应式系统进行了重写，并将这部分代码封装在了 `@vue/reactivity` 包中。

本文主要记录对 Vue3 的响应式实现方式的学习过程以及一些思考。注意本文引用的代码与实际的 Vue3 实现方式会有出入，Vue3 需要更多地考虑高效与兼容各种边界情况，此处以易懂为主，但主要思想与其类似。

本文中提到的所有代码可以在 [https://github.com/wxsms/learning-vue](https://github.com/wxsms/learning-vue) 找到，感谢 [mini-vue](https://github.com/cuixiaorui/mini-vue) 及其作者做出的学习指导。

<!-- more -->

## 什么是响应式

Evan 经常举的一个例子是电子表格（如：Excel）。当我们需要对某一列或行求和，将计算结果设置在某个单元格中，并且在该列（行）的数据发生变化时，求和单元格的数据实现实时更新。这就是响应式。

以代码来表达的话：

```javascript
let col = [1, 2, 3, 4, 5]
let s = sum(col)
```

我们就可以的得到一个求和值 `s`。

不同的是，以上代码是命令式的。也就是说，当 `col` 发生变化时，`s` 的值并不会随之改变。我们需要再次调用 `s = sum(col)` 才能得到新的值。

响应式就是要解决这个问题：当 `col` 发生变化时，我们可以自动地得到基于变化后的 `col` 计算而来的 `s`。

我们的目标：

```javascript
// 响应式对象
let a = reactive({ value: 1 });
let b;

// 自动运行的函数
effect(() => {
  b = a.value * 2;
});

// b 将被自动赋值为 1 * 2
expect(b).toEqual(2);

a.value = 100;
// b 将再次被自动赋值为 100 * 2
expect(b).toEqual(200);
```

## 一切的基石：依赖与依赖监听

让我们从零开始：当要实现一个响应式系统的时候，我们实际需要的是什么？

答案是**依赖**与**依赖的监听**。

用上面的例子来说，`col` 是依赖，`s=sum(col)` 是监听依赖做出的反应。当依赖发生变化时，反应可以自动执行，这件事情就完成了。

### 依赖

那么我们先来实现**依赖**。 一个依赖：

1. 代表了某个对象下面的某个值；
2. 当值发生变化时，需要触发跟它有关的反应（后面称为作用，effect）。

以下是实现代码：

```javascript
// Dep === 依赖 Dependency
// 比如上面提到的 `col` 是一个 dep，
// `c = a.b + 1` 中，a.b 是一个 dep。
export class Dep {
  constructor () {
    // _effects 代表与这个依赖有关的“作用”
    // 这里使用 Set，可以利用其天然的去重属性，
    // 因为作用无需重复添加
    this._effects = new Set();
  }

  // 取消作用 e 对本 dep 的追踪
  untrack (e) {
    this._effects.delete(e);
  }

  // 作用 e 开始追踪本依赖
  track (e) {
    this._effects.add(e);
  }

  // 触发追踪了本依赖的所有作用
  trigger () {
    for (let e of this._effects) {
      e.run();
    }
  }
}
```

除此以外，我们还需要一个变量，用来存储所有的 dep：

```javascript
// target (object) -> key (string) -> dep
export const depsMap = new Map();
```

`depsMap` 是一个嵌套的 Map：

1. 它的 key 是一个 Object，如 `c = a.b + 1` 中，key 是 `a` 这个对象；
2. 它的 value 又是一个 Map：
   1. 它的 key 是一个键名，如 `c = a.b + 1` 中，key 是 `b`；
   2. 它的 value 是一个 Dep 实例。

在实际的 Vue3 代码中，这里的第一层使用的是 WeakMap 而非 Map。原因很简单：WeakMap 对 key 是弱引用，当 key 在代码中的其它地方已经不存在应用时，它 (key) 以及对应的 value 都会被 GC。而如果使用 Map 的话，保有的是强引用，就会导致内存泄漏了。

### 依赖监听

一个依赖监听模块大致需要以下内容：

```javascript
import { Dep, depsMap } from './dep';

/**
 * 当前正在运行的 effect
 */
let currentEffect;

export class ReactiveEffect {
  // todo
}

/**
 * 创建一个作用函数，并将自动追踪函数内的依赖
 * @param fn 接收的函数
 */
export function effect (fn) {
  // todo
}

/**
 * 当前正在运行的作用追踪一个依赖
 * @param target 目标对象
 * @param prop 目标对象的属性名
 */
export function track (target, prop) {
  // todo
}

/**
 * 触发一个依赖下的所有作用
 * @param target 目标对象
 * @param prop 目标对象的属性名
 */
export function trigger (target, prop) {
  // todo
}
```

#### `trigger`

触发作用的代码非常简单，只需直接拿到对应的 dep，并触发它的 `trigger` 函数：

```javascript
export function trigger (target, prop) {
  depsMap.get(target)?.get(prop)?.trigger();
}
```

#### `track`

`trigger` 是将 dep 取出来并触发里面的 effects，那么 `track` 就是将 effect 存到 dep 中去。

需要注意的是，因为 `depsMap` 一开始是空的，所以取 dep 会包含一个初始化的过程：

```javascript
function getDep (target, prop) {
  // 从 depsMap 中找到本 target 的 Map
  let deps = depsMap.get(target);
  // 没找到，需要初始化
  if (!deps) {
    deps = new Map();
    depsMap.set(target, deps);
  }
  // 从第二级的 Map 中找到本 prop 的 dep
  let dep = deps.get(prop);
  // 没找到，需要初始化
  if (!dep) {
    dep = new Dep();
    deps.set(prop, dep);
  }
  return dep;
}
```

代码比较多，但逻辑很简单。下面是 `track` 函数的具体实现：

```javascript
export function track (target, prop) {
  // 当前没有正在运行中的作用，无需追踪，可直接退出
  if (!currentEffect) {
    return;
  }
  let dep = getDep(target, prop);
  // 追踪正在运行中的作用
  dep.track(currentEffect);
}
```

#### `effect`

effect 函数也非常简单：

```javascript
export function effect (fn) {
  let e = new ReactiveEffect(fn);
  // 直接运行
  e.run();
}
```

#### `ReactiveEffect`

最后来实现 ReactiveEffect 这个类。从上面的其它函数可以看出，这个类需要以下功能：

1. 接收一个 `fn` 函数；
2. 包含一个 `run` 成员方法，可以运行一次该作用；

下面我们来分别实现它们。

**1. 构造器**

```javascript
constructor (fn) {
   this.fn = fn;
}
```

**2. `run`**

run 函数的关键在于 `currentEffect` 的赋值：我们在这里默认在 `fn` 函数运行的过程中，会发起对相应依赖的 `track()`，而 `track` 函数中会使用到 `currentEffect`，这也是为什么它需要作为一个全局变量单独抽离出来。

```javascript
run () {
  // 赋值 currentEffect
  currentEffect = this;
  this.fn();
  // 取消赋值
  currentEffect = null;
};
```

仔细看的话会发现，这里每一次调用 `run` 都会给 `currentEffect` 赋值，可以理解为发起了依赖收集的流程。换而言之，就是每一次执行这个作用都会收集一次依赖。这其实是必要的。因为函数里面的具体代码是未知的，举个例子：

```javascript
effect(() => {
  if (a.b && a.b.c) {
    d = a.b.c;
    // ...
  }
})
```

如果依赖收集只执行一次，并且第一次执行的时候 `a.b` 是 falsely 的，那么第一次执行就只收集到了 `a.b` 这个依赖，而 `a.b.c` 没有收集到。那么当只有 `a.b.c` 发生变化时，d 将不会被重新赋值，这显然是不符合预期的。

### 小结

目前为止，我们定义了两个类以及一些工具函数：

1. `Dep` 表示一个“依赖”，它内部含有一个 `effects` 集合，用来触发与它有关的作用；
2. `ReactiveEffect` 表示一个“作用”；
3. `track` 与 `trigger` 函数，分别用来追踪依赖与触发作用。

它们可以实现如下效果：

```javascript
let obj = { a: 1, b: { c: 2 } };
let fn = jest.fn(() => {
   track(obj, 'a');
   track(obj.b, 'c');
});
effect(fn);
// fn 总共被调用了 1 次
expect(fn).toHaveBeenCalledTimes(1);

trigger(obj, 'a');
// fn 总共被调用了 2 次
expect(fn).toHaveBeenCalledTimes(2);

trigger(obj.b, 'c');
// fn 总共被调用了 3 次
expect(fn).toHaveBeenCalledTimes(3);
```

简单来说，我们：

1. 定义了一个对象 `obj`
2. 定义了一个作用函数 `fn`
3. `fn` 内部追踪了 `obj` 的两个属性
4. 当 `obj` 属性发生变化（调用 trigger）时，作用函数将自动运行

看起来好像是那么回事了，但还有点抽象！距离我们的最终目标还有一定距离。另外我们目前为止还没有看到 Proxy 的使用，它将在下一节出现。

## 响应式变量

现在我们有了依赖与依赖追踪，是时候来实现第二个关键组件：`reactive` 了。 它将帮我们完成“在作用函数内部自动调用 `track()`”以及当依赖变化时自动调用 `trigger()` 的工作。

众所周知，Vue3 使用了 Proxy 来实现响应式：

```javascript
import { track, trigger } from './effect.js';

export function reactive (obj) {
  return new Proxy(obj, {
    get (target, p, receiver) {
      // todo
    },
    set (target, p, value, receiver) {
      // todo
    }
  });
}
```

我们需要做的两件事：

1. 当 `get` 触发时，追踪依赖
2. 当 `set` 触发时，触发作用

### `get`

`get` 的第一版实现：

```javascript
 get (target, p, receiver) {
   // 追踪依赖！
   track(...arguments);
   // 获取值并返回
   let value = Reflect.get(...arguments);
   return value;
 }
```

Reflect 通常是与 Proxy 成对出现的 API，这里的 `Reflect.get(...arguments)` 约等于 `target[p]`。

但是，这么做有个问题！因为 Proxy 代理的是浅层属性，举个例子，当我取 `a.b.c` 时，实际上分了两步：

1. 先取 `a.b`，这里 `a` 是 reactive 对象，能够触发 getter，没问题；
2. 再取 `b.c`，注意这里如果不做任何操作的话，`b` 将是一个普通对象，也就是说取值到这里响应性就丢失了。

为了解决这个问题，我们需要做一点小小的改造：

```javascript
 get (target, p, receiver) {
   // 追踪依赖！
   track(...arguments);
   // 获取值
   let value = Reflect.get(...arguments);
   // 如果 value 是一个对象，需要递归调用 reactive 将它再次包裹
   if (value !== null && typeof value === 'object') {
     return reactive(value);
   }
   return value;
 }
```

### `set`

实现 setter 需要注意的点是：

1. 触发作用要在设置新值后进行；
2. 需要判断新旧值是否相等以避免死循环。

```javascript
 set (target, p, value, receiver) {
   // 先取值
   let oldValue = Reflect.get(...arguments);
   // 如果新旧值相等，则无需触发作用
   if (oldValue === value) {
      return value;
   }
   // 设置新的值，约等于 `target[p] = value`
   Reflect.set(...arguments);
   // 触发作用！这里是在设置新值后才进行的。
   trigger(...arguments);
   return value;
 }
```

大功告成！

### 小结

我们现在可以：

1. 定义响应式变量；
2. 定义作用函数；
3. 响应式变量发生变化时，函数将自动执行。

```javascript
let a = reactive({ value: 1 });
let b;

effect(() => {
  b = a.value * 2;
});
expect(b).toEqual(2);

a.value = 100;
expect(b).toEqual(200);

a.value = 300;
expect(b).toEqual(600);
```

