---
title: Vue3 响应式原理
tags: vue
date: 2023-03-17 16:09:48
---


Vue3 与 Vue2 的最大不同点之一是响应式的实现方式。众所周知，Vue2 使用的是 `Object.defineProperty`，为每个对象设置 getter 与 setter，从而达到监听数据变化的目的。然而这种方式存在诸多限制，如对数组的支持不完善，无法监听到对象上的新增属性等。因此 Vue3 通过 Proxy API 对响应式系统进行了重写，并将这部分代码封装在了 `@vue/reactivity` 包中。

本文主要记录对 Vue3 的响应式实现方式的学习过程以及一些思考。注意本文引用的代码与实际的 Vue3 实现方式会有出入，Vue3 需要更多地考虑高效与兼容各种边界情况，此处以易懂为主，但主要思想与其类似。

本文中提到的大部分代码可以在 [https://github.com/wxsms/learning-vue](https://github.com/wxsms/learning-vue) 找到。

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

## 依赖与依赖监听

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
  return e;
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

1. 实现 getter：当 `get` 触发时，追踪依赖
2. 实现 setter：当 `set` 触发时，触发作用

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
   let newValue = Reflect.set(...arguments);
   // 触发作用！这里是在设置新值后才进行的。
   trigger(...arguments);
   // 注意这里返回的是 Reflect.set 的返回值，而不是 value
   return newValue;
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

实际上当进行到这里的时候，响应式的两大基石就已经完成了。因此下面其它的 API 实现我决定都通过 `reactive` 与 `effect` 来实现。当然实际上 Vue3 考虑的更多，做的也会更复杂一些，但是原理是类似的。

## 其它响应式 API

### ref

上面的 `reactive` API 可以对对象和数组这样的复杂类型完成监听，但对于字符串、数组或布尔值这样的基本类型，它是无能为力的。因为 Proxy 不能监听这种基本类型。因此，我们需要对它进行一层包裹：先将它包裹到一个对象中，然后通过 `a.value` 来访问实际的值。这实际上是 Vue3 目前仍在致力于解决的问题之一，如通过[响应性语法糖](https://cn.vuejs.org/guide/extras/reactivity-transform.html)。

下面，我们将以惊人的效率实现 `ref`：

```javascript
export function ref (value) {
  return reactive({ value: value });
}
```

这种方式非常简单直接，并且能够完美地运行：

```javascript
let a = ref(1);
let b;

effect(() => {
  b = a.value * 2;
});
expect(b).toEqual(2);

a.value = 100;
expect(b).toEqual(200);
```

当然实际上 Vue3 不是这么干的：它实现了一个 `RefImpl` 类，并且与 `reactive` 类似地，通过 getter 与 setter 完成对 value 的追踪。

### computed

计算属性 (`computed`) 是经典的 Vue.js API，它能够接受一个 getter 函数，并且返回一个实时更新的值。

#### 仅 getter

我们先来实现一个最常见的版本：

```javascript
export function computed (getter) {
   // 计算属性返回的是一个 ref
   let result = ref(null);
   // 调用 getter 函数，更新 ref 的值
   effect(() => {
      result.value = getter();
   });
   return result;
}
```

这是一个只包含 getter 函数的计算属性，它可以这么用：

```javascript
let a = ref(1);
let b = computed(() => a.value + 1);
expect(b.value).toEqual(2);

a.value = 100;
expect(b.value).toEqual(101);

a.value = 300;
expect(b.value).toEqual(301);
```

#### getter & setter

实际上，计算属性可以同时拥有 getter 和 setter：

```javascript
let a = ref(1);
let b = computed({ get: () => a.value + 1, set: (val) => a.value = val - 1});
```

为了优雅起见，我们先对 computed 内部的函数做一下封装，首先是 getterEffect，它与上面的实现一样，接受一个 ref 与一个 effect 函数：

```javascript
function getterEff (computedRef, eff) {
  effect(() => {
    computedRef.value = eff();
  });
}
```

然后是 setterEffect：

```javascript
function setterEff (computedRef, eff) {
  effect(() => {
    eff(computedRef.value);
  });
}
```

与 getterEffect 不同的是，setter 是将 ref 值作为参数传入到 effect 函数内，而 getterEffect 是将 effect 函数的返回赋值给 ref。

最后，我们就可以得到完整的 `computed` 函数了：

```javascript
export function computed (eff) {
  let result = ref(null);
  if (typeof eff === 'function') {
    // 这是一个简单的 getter 函数
    getterEff(result, eff);
  } else {
    // 同时传入了 getter 和 setter
    getterEff(result, eff.get);
    setterEff(result, eff.set);
  }
  return result;
}
```

### watch

除了经典的 `watch` API 以外，Vue3 还带来了一个新的 `watchEffect` API。与 `watch` 不同的是，它可以：

> 立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

也就是说，`watchEffect` 无需指定它监听的值，可以完成自动的追踪，且会立即执行。

然而在实现这两个 API 之前，需要先对 ReactiveEffect 做一点小小的扩展改造。

#### effect 改造 - 允许停止运行

Vue3 的 watch/watchEffect API 会返回一个 stop 函数，该函数可以将侦听器停止，停止后即不再自动触发。而我们目前的 ReactiveEffect 尚不支持停止。因此我们需要给它加一个 `stop` 函数。

想要停止一个 effect，我们需要做的事情就是把它从所有的 dep 中移除，这样一来 effect 就不能被 dep 触发了。比如：

```javascript
for (let deps of depsMap) {
  for (let dep of deps) {
    dep.untrack(thisEffect);
  }
}
```

但是，这样做有几个问题：

1. 太过暴力，性能堪忧；
2. 由于 Vue3 实际上在第一层使用了 WeakMap，而 WeakMap 是不支持遍历的。

因此，我们需要对 ReactiveEffect 做一些改造，将这些相关的 dep 存下来。

```javascript
export class ReactiveEffect {
   constructor (fn) {
      this.fn = fn;
      // 新增一个 deps Set，表示所有与本 effect 相关的依赖
      this.deps = new Set();
      // 新增一个 active 属性，表示是否已停止
      this.active = true;
   }

   run () {
      // effect 已经停止了，无需再收集依赖。
      // 但既然 run 被调用了，还是运行并返回一下吧！
      if (!this.active) {
         return this.fn();
      }
      // 与之前一样
      // ...
   };

   /**
    * 新增的 stop 函数，用来停止 effect
    */
   stop () {
      // 将 active 设置为 false，表示已停止
      this.active = false;
      // 将本 effect 实例从所有 deps 中移除
      for (let dep of this.deps) {
         dep.untrack(this);
      }
      // 清空 deps
      this.deps.clear();
   }
}
```

同时，我们需要在追踪依赖时，将依赖添加到 effect 的 deps 中（双向追踪）：

```javascript
export function track (target, prop) {
  if (!currentEffect) {
    return;
  }
  let dep = getDep(target, prop);
  dep.track(currentEffect);
  // 新增！将 dep 也添加到 currentEffect 的 deps 中
  currentEffect.deps.add(dep);
}
```

#### watchEffect

加入 stop 函数后，watchEffect 实现如下：

```javascript
export const watchEffect = (cb) => {
   let e = effect(cb);
   // 注意这里要 bind(e)，否则 this 指针会错乱
   return e.stop.bind(e);
};
```

非常地“水到渠成”。

```javascript
let a = ref(1);
let b = ref(0);
let stop = watchEffect(() => {
  b.value = a.value * 2;
});
expect(b.value).toEqual(2);

a.value = 100;
expect(b.value).toEqual(200);

// 调用停止函数，后续 a.value 再变化时，函数将不再执行
stop();
```

#### effect 改造 - 加入 scheduler

与 watchEffect 不同的是，watch 有更多特性：

1. watch 方法接收两个参数：source 和 callback，分别代表监听的对象和 effect 函数；
2. effect 函数接收两个参数，value 和 oldValue，分别代表新的值和变化后的值；
3. 初次定义时，effect 函数不会运行；
4. 只有 source 的改变才能触发 effect。

为了实现第 3&4 点，我们需要给 ReactiveEffect 加入一个 scheduler 的概念：它将决定 `run` 函数何时执行。

首先我们需要修改一下 Dep 类：

```javascript
export class Dep {
  // 同上...

  trigger () {
    for (let e of this._effects) {
      if (e.scheduler) {
        // 如果存在 scheduler，则执行 scheduler
        e.scheduler();
      } else {
        // 否则直接 run
        e.run();
      }
    }
  }
}
```

然后修改 effect：

```javascript
export class ReactiveEffect {
   constructor (fn, scheduler) {
      // 同上...
      // 但添加一个 scheduler 选项
      this.scheduler = scheduler;
   }
    
   // 同上...
}

// 添加了一个 scheduler 参数
export function effect (fn, scheduler) {
   let e = new ReactiveEffect(fn, scheduler);
   e.run();
   return e;
}
```

OK，完成了。实际上只是添加了一个可以自由更改 run 执行时机的选项。但 scheduler 非常强大，Vue 的另一个核心功能 `nextTick` 也是基于它实现的，此处先不展开。

#### watch

watch 的函数重载非常多，为了简单起见，我们只实现其中一种形式：

1. getter：函数，返回监听的值；
2. cb：回调函数

```javascript
export function watch (getter, cb) {
   let oldValue;

   let job = () => {
      // 获取新值
      let newVal = e.run();
      // 调用回调函数
      cb(newVal, oldValue);
      // 设置“新的旧值”
      oldValue = newVal;
   };
   // 定义 effect
   // 注意 effect 的本体是 getter，
   // 也就是说只有 getter 可以触发依赖收集
   // 而 job 将作为 scheduler 传入
   let e = effect(getter, job);
   // 首次运行，完成第一个旧值的获取
   oldValue = e.run();
   // 与 watchEffect 一样返回 stop 函数
   return e.stop.bind(e);
}
```

至此，watch 函数也实现完了。

```javascript
let a = reactive({ value: 1 });
let fn = jest.fn();
let stop = watch(() => a.value, fn);
expect(fn).not.toBeCalled();

a.value = 2;
expect(fn).toBeCalledWith(2, 1);

stop();

a.value = 3;
expect(fn).toHaveBeenCalledTimes(1);
```

### 小结

在本节中，我们使用现成的 `effect` 与 `reactive` API 实现了 `ref` 与 `computed`，并且通过对 effect 扩展的两个功能（stop、scheduler）分别实现了 `watchEffect` 与 `watch`。

至此，Vue3 响应式的核心功能已全部实现完！

## One More Thing

现在既然已经实现了响应式，那么我们回到最初的问题：

```javascript
let col = [1, 2, 3, 4, 5]
let s = sum(col)
```

我们如何将这段代码变成响应式的，或者说，是否可以更进一步，直接将它变成响应式的 UI？

那么我们直接来定义一个（似曾相识的）组件：

```javascript
const App = {
   // 一个最原始的 render 函数，接收 ctx 参数
   // 返回一个 HTML Node
   render (ctx) {
      let div = document.createElement('div');
      // 使用 reduce 获得累加的和
      div.textContent = ctx.col.reduce((a, b) => a + b, 0);
      return div;
   },
   // 模仿组合式 API 的 setup 函数...
   setup () {
      const col = reactive([1, 2, 3, 4, 5])
      return { col }
   }
}
```

然后，我们编写一个 createApp 函数：

```javascript
function createApp (Component) {
   return {
      // 挂载函数
      mount (root) {
         // 一点兼容代码，获取挂载的根节点
         let rootNode = typeof root === 'string' ? document.querySelector(root) : root;
         // 调用 setup 获取 context
         let context = Component.setup();
         // 每当 context 发生变化时，effect 都将自动执行
         effect(() => {
            rootNode.innerHTML = '';
            let node = Component.render(context);
            rootNode.append(node);
         });
      }
   };
}
```

最后，我们将组件挂载到 `#app` 上：

```javascript
createApp(App).mount('#app')
```

（当然我们还需要一个 HTML）：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="app"></div>
<script src="index.js" type="module"></script>
</body>
</html>
```

到这里，Vue3 的整体框架已经呼之欲出了。
