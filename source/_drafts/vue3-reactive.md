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

也就是说，`watchEffect` 无需指定它监听的值，可以完成自动的追踪。

下面我们分别来实现它们。再次强调，这里的实现与 Vue.js 真正的实现是有区别的。

#### watchEffect

```javascript
import { effect } from './effect';

export const watchEffect = effect;
```

有点简单粗暴了。但是它实际上需要达到的效果就是和上面实现的 `effect` 是一模一样的。也就是说我们从一开始就已经实现了 `watchEffect`。

```javascript
let a = ref(1);
let b = ref(0);
watchEffect(() => {
  b.value = a.value * 2;
});
expect(b.value).toEqual(2);

a.value = 100;
expect(b.value).toEqual(200);
```

然而，需要注意的是，`effectWatch` 根据官方文档，它会返回一个函数，该函数可以用来“清理”effect，即停止该 effect 的继续运行。我们在上面实现的 `ReactiveEffect` 类中并没有包含这部分逻辑。

#### watch

```javascript
export function watch (source, callback) {
  let oldValue;
  let firstrun = true;

  return effect(() => {
    if (firstrun) {
      firstrun = false;
      oldValue = JSON.parse(JSON.stringify(source));
      return;
    }
    callback(source, oldValue);
    oldValue = JSON.parse(JSON.stringify(source));
  });
}
```

```javascript
let a = reactive({ value: 1 });
let b = 0;

watch(a, (val, oldVal) => {
  b = oldVal.value + val.value;
});
expect(b).toEqual(0);

a.value = 100;
expect(b).toEqual(101);

a.value = 200;
expect(b).toEqual(300);
```