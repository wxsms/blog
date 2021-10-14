---
title: JavaScript 的一些古怪之处
date: 2016-02-15T16:47:27+00:00
tags: [javascript]
---

大概一年前在看一本介绍JavaScript与jQuery的书籍之时看到了这么一个有趣的章节，当时印象挺深刻的。现在突然回想起来了这回事，于是就重新翻出来做了个笔记。作者将这些材料归结为两类：神奇的知识点以及WTF。这里去除了与浏览器有关的部分，因为那些和JavaScript本身并没有关联。

<!-- more -->

## 数据类型与定义

### NULL是一个对象

不同于C或者Java之类的语言，JavaScript的 `null` 值是一个对象。也许你会说“`null` 应该定义为一个完全没有意义的值”，也许你是对的，然并卵，事实是：

```javascript
alert(typeof null); //object
```

尽管如此，`null` 并不是任何对象的一个实例（补充：JavaScript中的所有“值”都是基本对象的实例，比如说数字是 `Number` 对象的实例，字符串是 `String` 对象的实例，所有对象都是 `Object` 对象的实例，等等）。于是我们可以理智地认为：如果 `null` 代表的是没有值，那么它就不能是任何对象的实例。因此下面的表达式应该返回 `false`：

```javascript
alert(null instanceof Object); //evaluates false
```

### NAN是一个数字

你以为 `null` 是一个对象已经够离谱了吗，too young too simple！`NaN`→ Not a Number → 它是一个数字。还有更过分的呢，它甚至不等于它自身。我受到了伤害。

```javascript
alert(typeof NaN); //alerts 'Number'
alert(NaN === NaN); //evaluates false
```

事实上，`NaN` 不与任何值相等。如果想要判断一个值是不是 `NaN`，唯一的办法是通过调用 `isNaN()` 函数。

### 空数组==FALSE

这个特性其实很受欢迎的呢：

```javascript
alert(new Array() == false); //evaluates true
```

要弄明白这里面到底发生了什么事，首先要知道在JavaScript世界中**真假相**的概念。它在逻辑上有一些简化。

作者认为最简单的理解方式是：在JavaScript的世界中，**所有非布尔类型的值，它们都存在有一个内置的布尔类型标志位**，当该非布尔值在要求做出布尔类型的比较时，实际上调用的是它的标志位。

（我觉得理解为JavaScript有内置的比较逻辑表也是可以的吧）

因为苹果没办法和梨比较，猫不能和狗比较，因此当JavaScript需要比较两种不同类型的数值时，它要做的第一件事必然是将其**强转**为通用的可比较的类型。`False`，`null`，`undefined`，`NaN`,空字符串以及零到最后全都会变成 `false`。不过这当然不是永久的，这种转换只在特定的表达式（布尔表达式）中生效。

```javascript
var someVar = 0;
alert(someVar == false); //evaluates true
```

以上就是一个**强转**的例子。

至此还没有开始讨论数组的行为呢。空数组是一件非常奇特的事物，它们实际上是表示真，但如果你拿它来做布尔运算，它又是假的。我总觉得这里面隐藏着什么不可告人的秘密 (¬_¬)

```javascript
var someVar = []; //empty array
alert(someVar == false); //evaluates true
if (someVar) alert('hello'); //alert runs, so someVar evaluates to true
```

为了避免类似的困扰，我们可以使用**全等操作符**（三个等号，同时比较类型与值）：

```javascript
var someVar = 0;
alert(someVar == false); //evaluates true – zero is a falsy
alert(someVar === false); //evaluates false – zero is a number, not a boolean
```

这个问题十分广泛，这里也就不过多介绍了。如果想要深入了解其内部原理，可以阅读[ECMA-262标准之11.9.3章节](http://www.mozilla.org/js/language/E262-3.pdf)文档。

## 正则表达式

### REPLACE()可以接受回调函数

这绝对是JavaScript最为隐秘的特性之一，从1.3版本之后加入。绝大多数人都是这么用它的：

```javascript
alert('10 13 21 48 52'.replace(/\d+/g, '*')); //replace all numbers with *
```

（原文中有一些疏忽，比如使用了 `d+` 而非 `\d+`，这里均做出了修正）

简单的替换，字符串，星号。但如果我们想要更进一步的控制呢？比如我们只想替换30以下的数字？这个逻辑通过正则来实现会较为困难，毕竟它不是数学运算，我们可以这样：

```javascript
alert('10 13 21 48 52'.replace(/\d+/g, function(match) {
	return parseInt(match) < 30 ? '*' : match;
}));
```

这段代码的意思是，如果匹配到的字符串转换为整型数值后小于30，则替换为星号，否则原样返回。

### 不仅仅是比较和替换

通常情况下我们都只用到了正则表达式的比较和替换功能，但其实JavaScript提供的方法远远不止两个。

比如说 `test()` 函数，它和比较十分类似，但它不反回比较值，只确认字符串是否匹配。这样代码可以更轻一些。

```javascript
alert(/\w{3,}/.test('Hello')); //alerts 'true'
```

以上表达式判断了字符串是否有3个或以上的字符。

还有就是 `RegExp` 对象，通过它我们可以构建动态的正则表达式。一般情况下正则表达式都是通过短格式声明的（封闭在斜杠中，就像上面所用到的）。这么做的话，我们不能在其中插入变量。当然，我们还有 `RegExp`：

```javascript
function findWord(word, string) {
	var instancesOfWord = string.match(new RegExp('\\b'+word+'\\b', 'ig'));
	alert(instancesOfWord);
}
findWord('car', 'Carl went to buy a car but had forgotten his credit card.');
```

这里我们基于 `word` 参数构建了一个动态的正则表达式。这个函数会返回car作为独立单词在字符串中出现的次数。本例只有一次。

由于 `RegExp` 使用字符串来表示正则表达式，而非斜杠，因此我们可以在里面插入变量。但是，与此同时，需要注意的是，表达式中特殊符号前的反斜杠我们也要写两次（转义处理）。

## 函数与作用域

### 你可以伪造作用域

作用域决定了变量可以在哪些地方被访问。独立（即不在函数内部）的JavaScript可以在全局作用域（对浏览器来说是 `window` 对象）下访问，函数内部定义的变量则只能在内部访问，其对外部不可见。

```javascript
var animal = 'dog';
function getAnimal(adjective) { alert(adjective+' '+this.animal); }
getAnimal('lovely'); //alerts 'lovely dog';
```

这里，我们的变量和函数都是在全局作用域下定义的（比如 `window`）。因为 `this` 总是指向当前作用域，因此在本例中它指向了 `window.animal`，于是就找到了。一切看起来都没问题。但是，我们可以骗过函数本身，让它认为自己执行在另一个作用域下，并无视其原本的作用域。我们通过调用内置的 `call()` 函数来达到目的：

```javascript
var animal = 'dog';
function getAnimal(adjective) { alert(adjective+' '+this.animal); };
var myObj = {animal: 'camel'};
getAnimal.call(myObj, 'lovely'); //alerts 'lovely camel'
```

在这里，函数不在 `window` 而在 `myObj` 中运行 — 作 为 `call` 方法的第一个参 数。本质上说 `call` 方法将函数 `getAnimal` 看成 `myObj` 的一个方法（如果没看懂这是什么意思， 你可能需要去看一下 JavaScrip t的原型继承系统相关内容）。注意，我们传递给 `call` 的第一个参数后面的参数都会被传递给我们的函数 — 因此我们将 lovely 作为相关参数传递进来。尽管好的代码设计不需要采用这种伪造手段，这依然是非常有趣的知识。`apply` 函数与 `call` 函数作用相似，它的参数应该被指定为数组。所以，上面的例子如果用 `apply` 函数的话如下：

```javascript
getAnimal.apply(myObj, ['lovely']); //func args sent as array
```

### 函数可以自执行

显然：

```javascript
(function() { alert('hello'); })(); //alerts 'hello'
```

这个语法非常简单：我们定义了一个函数，然后立刻就调用了它，就像调用其它函数一样。也许你会觉得这有些奇怪，函数包含的代码一般都是在之后执行的，比如我们想在某个时刻调用它，既然它需要立即执行，那为什么要把代码放在函数体内呢？

自执行函数的一大用处就是将**变量的当前值**绑定到将来要被执行的函数中去。就比如说回调，延迟或者持续运行：

```javascript
var someVar = 'hello';
setTimeout(function() { alert(someVar); }, 1000);
var someVar = 'goodbye';
```

这段代码有一个问题，它的输出永远都是goodbye而不是hello，这是因为timeout中的函数在真正执行之前永远不会去关心里面的变量发生了什么变化，到那时候，`someVar` 早就被goodbye覆盖了。

（JavaScript新手经常会犯的一个错误就是在循环中定义事件，并且将index作为参数传入，到最后发现真正绑上了事件的只有最后的那个元素，这也是同理）

解决办法如下：

```javascript
var someVar = 'hello';
setTimeout((function(someVar) {
	return function()  { alert(someVar); }
})(someVar), 1000);
var someVar = 'goodbye';
```

在这里，被传入函数中的相当于是一个快照，而不是真正的变量本身。

## 其它

### 0.1 + 0.2 !== 0.3

其实这是计算机科学中的一个普遍问题，我已经在很多编程语言中都发现了它的影子，它是由浮点数不能做到完全精确导致的。实际的计算结果是0.30000000000000004

如何解决，归根到底取决于计算需求：

  * 转换成整型计算，而后再转回浮点
  * 允许某个范围内的误差

因此，与其：

```javascript
var num1 = 0.1, num2 = 0.2, shouldEqual = 0.3;
alert(num1 + num2 == shouldEqual); //false
```

不如：

```javascript
alert(num1 + num2 > shouldEqual - 0.001 && num1 + num2 < shouldEqual + 0.001); //true
```

这就是一个简单的允许误差的办法。

### UNDEFINED可以被DEFINED

这个看起来有点蠢了。undefined在JavaScript中其实不是一个关键字，尽管它一般是用来表示一个变量是否未被定义。就像这样：

```javascript
var someVar;
alert(someVar == undefined); //evaluates true
```

然而也可以这样：

```javascript
undefined = "I'm not undefined!";
var someVar;
alert(someVar == undefined); //evaluates false!
```

看起来很有趣的样子&#8230;&#8230;
