---
permalink: '/posts/2021-04-03-regex-assertions.html'
title: '正则断言'
date: 2021-04-03T11:59:18.278Z
tags: [javascript]
---

<!-- 「」 -->

> Assertions include boundaries, which indicate the beginnings and endings of lines and words, and other patterns indicating in some way that a match is possible (including look-ahead, look-behind, and conditional expressions).

断言是正则表达式组成的一部分，包含两种断言。本文记录了一些常用断言。

<!-- more -->

## 边界类断言

### `^`

**匹配输入的开头**。在多行模式匹配中，`^` 在换行符后也能匹配。

```javascript
/^A/.test('Apple');
// true

/^B/.test('Apple\nBanana');
// false

/^B/m.test('Apple\nBanana');
// true
```

### `$`

**匹配输入的结尾**。在多行模式匹配中，`$` 在换行符前也能立即匹配。

```javascript
/e$/.test('Apple');
// true

/e$/.test('Apple\nBanana');
// false

/e$/m.test('Apple\nBanana');
// true
```

## 其它断言

### `x(?=y)`

**向前断言**。x 被 y 跟随时匹配 x，匹配结果不包括 y。

举例：

```javascript
/Jack(?=Sprat)/.exec('JackSprat');
// ["Jack", index: 0, input: "JackSprat", groups: undefined]

/Jack(?=Sprat)/.exec('Jack Sprat');
// null
// 因为多了一个空格，无法匹配

/Jack(?=\s?Sprat)/.exec('Jack Sprat');
// ["Jack", index: 0, input: "Jack Sprat", groups: undefined]
// 加上空格后匹配成功

/Jack(?=Sprat|Frost)/.exec('JackFrost');
// ["Jack", index: 0, input: "JackFrost", groups: undefined]
```

### `x(?!y)`

**向前否定断言**。x 没有被 y 紧随时匹配 x，匹配结果不包括 y。

举例，匹配小数点后的数字：

```javascript
/\d+(?!\.)/.exec('3.1415926');
// ["1415926", index: 2, input: "3.1415926", groups: undefined]
```

### `(?<=y)x`

**向后断言**。x 跟随 y 的情况下匹配 x，匹配结果不包括 y。

举例：

```javascript
/(?<=Jack)Sprat/.exec('JackSprat');
// ["Sprat", index: 4, input: "JackSprat", groups: undefined]

/(?<=Jack\s?)Sprat/.exec('Jack Sprat');
// ["Sprat", index: 5, input: "Jack Sprat", groups: undefined]
```

### `(?<!y)x`

**向后否定断言**。x 不跟随 y 时匹配 x，匹配结果不包括 y。

举例，匹配小数点前的数字：

## 综合举例

### 匹配二级域名

匹配某个完整域名中的二级域名：

```javascript
/\w+(?=\.daily\.xoyo)/.exec('https://tg.daily.xoyo.com/');
// ["tg", index: 8, input: "https://tg.daily.xoyo.com/", groups: undefined]

/\w+(?=\.daily\.xoyo)/.exec('https://tg.service.daily.xoyo.com/');
// ["service", index: 11, input: "https://tg.service.daily.xoyo.com/", groups: undefined]
```

### 社交场景

比如，某条 ugc 内容包含以下规则：

1. `@某人` 表示 @
2. `#某话题` 表示话题
3. `[某表情]` 表示表情

某个字符串如下：

```javascript
const str = '@大吧主 @小吧主 你们好，什么时候能把我的号解封[微笑][微笑] #狗管理 #玩不了了';
```

#### 获取所有 @ 人

```javascript
str.match(/(?<=@).+?(?=\s|$)/g)
// ["大吧主", "小吧主"]
```

#### 获取所有话题

```javascript
str.match(/(?<=#).+?(?=\s|$)/g);
// ["狗管理", "玩不了了"]
```

#### 获取所有表情

```javascript
str.match(/(?<=\[).+?(?=\]|$)/g);
// ["微笑", "微笑"]
```

#### 一次性获取所有特殊内容

```javascript
str.match(/(?<=@).+?(?=\s|$)|(?<=#).+?(?=\s|$)|(?<=\[).+?(?=\]|$)/g);
// ["大吧主", "小吧主", "微笑", "微笑", "狗管理", "玩不了了"]
```