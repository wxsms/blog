---
title: Vue3 响应式原理
tags: vue
---

Vue3 与 Vue2 的最大不同点之一是响应式的实现方式。众所周知，Vue2 使用的是 `Object.defineProperty`，为每个对象设置 getter 与 setter，从而达到监听数据变化的目的。然而这种方式存在诸多限制，如对数组的支持不完善，无法监听到对象上的新增属性等。因此 Vue3 通过 Proxy API 对响应式系统进行了重写，并将这部分代码封装在了 `@vue/reactivity` 包中。

本文主要记录对 Vue3 的响应式实现方式的学习过程以及一些思考。注意本文引用的代码与实际的 Vue3 实现方式会有出入，Vue3 需要更多地考虑高效，此处以易懂为主，但主要思想与其类似。

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

先放置一个骨架代码结构，一个依赖监听模块大致需要以下内容：

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

触发作用的代码非常简单，先来实现它：

```javascript
export function trigger (target, prop) {
  depsMap.get(target)?.get(prop)?.trigger();
}
```

就是直接拿到了对应的 dep，并触发了它的 `trigger` 函数。

#### `track`

`trigger` 是将 dep 取出来并触发里面的 effects，那么 `track` 自然就是将 effect 存到 dep 中去。

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

代码比较多，但逻辑很简单。下面就是 `track` 函数的实现：

```javascript
export function track (target, prop) {
  // 当前没有正在运行中的作用，无需追踪，可直接退出
  if (!currentEffect) {
    return;
  }
  let dep = getDep(target, prop);
  // 追踪正在运行中的作用
  dep.track(currentEffect);
  // 作用也有一个 deps 变量，储存该作用的所有依赖。这部分在下面实现。
  currentEffect.deps.add(dep);
}
```

#### `effect`

effect 函数也非常简单：

```javascript
export function effect (fn) {
  let e = new ReactiveEffect(fn);
  // 直接运行
  e.run();
  // 返回一个函数，用来停止 effect
  return e.stop.bind(e);
}
```

#### ReactiveEffect

最后来实现 ReactiveEffect 这个类。从上面的其它函数可以看出，这个类需要以下功能：

1. 接收一个 `fn` 函数；
2. 包含一个 `deps` 成员变量，储存有该作用的所有依赖；
3. 包含一个 `run` 成员方法，可以运行一次该作用；
4. 包含一个 `stop` 成员方法，可以停止该作用的自动执行；

以下我们来分别实现它们。

**1. 构造器**

这里没什么特别的，就是创建变量与赋值。

```javascript
constructor (fn) {
   this.fn = fn;
   // deps 同样是一个 set，自动去重
   this.deps = new Set();
   // active 变量用来标识该作用是否已停止
   this.active = true;
}
```

**2. `run`**

run 函数的关键在于 `currentEffect` 的赋值：我们在这里默认在 `fn` 函数运行的过程中，会发起对相应依赖的 `track()`，而 `track` 函数中会使用到 `currentEffect`，这也是为什么它需要作为一个全局变量单独抽离出来。

```javascript
run () {
  // 该作用已停止了，无需再收集依赖，
  // 因此直接运行 fn 即可
  if (!this.active) {
    return this.fn();
  }
 
  // 赋值 currentEffect
  currentEffect = this;
  this.fn();
  // 取消赋值
  currentEffect = null;
};
```

**3. `stop`**

stop 函数只需做一些简单的清理工作即可：

```javascript
stop () {
  this.active = false;
  // 从本作用依赖的左右 dep 中，取消追踪
  for (let dep of this.deps) {
    dep.untrack(this);
  }
  // 清除本作用的 deps
  this.deps.clear();
}
```

### 小结

目前为止，我们定义了两个类以及一些工具函数：

1. `Dep` 表示一个“依赖”，它内部含有一个 `effects` 集合，用来触发与它有关的作用；
2. `ReactiveEffect` 表示一个“作用”。它内部也含有一个 `deps` 集合，但这里只是用来停止该 effect。
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
