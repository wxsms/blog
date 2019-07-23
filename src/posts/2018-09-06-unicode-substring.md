---
id: 'unicode-substring'
title: 'Unicode substring'
date: 2018-09-06T06:46:40.741Z
tags: [JavaScript]
sidebar: false
draft: false
layout: SpacePost
---




最近遇到一个问题：在做字符串截取操作时，如果字符串中包含了 emoji 字符（一个表情占多个 unicode 字符），而碰巧又把它截断了，程序会出错。在 ReactNative App 下的具体表现就是崩溃。由于以前做的是网页比较多，基本没有输入表情字符的案例，而在手机上就不一样了，因此这个问题还是第一次发现。

比如说：

```javascript
'😋Emoji😋'.substring(0, 2) // 😋
```

因此，如果对这个字符串做 `substring(0, 1)` 操作，就会截取到一个未知字符。

<!-- more -->

中间的探索过程就不谈了，Google 了一下解决方案，以及咨询同事们以后，发现最简单的办法是通过 `lodash` 自带的 `toArray` 方法，先将它转为数组，然后将整个逻辑改为数据的截取操作，最后再转回字符串。

```javascript
export function safeSubStr (str, start, end) {
  const charArr = _.toArray(str);
  return _.slice(charArr, start, end).join('');
}
```

实际上解决问题的是 `_.toArray`，它帮我们把表情字符正确地截了出来：

```javascript
_.toArray('😋Emoji😋') // ["😋", "E", "m", "o", "j", "i", "😋"]
```

其实我也比较好奇它是怎么做的，通过观察源码，发现了真正的解决方案：

```javascript
// lodash/_unicodeToArray.js
/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

module.exports = unicodeToArray;
```

一大堆正则就不谈了，也不知道它是从哪里找来的这些值，最后组装了一个 `reUnicode` 正则来实现 unicode 转数组。话又说回来，这么做会不会有性能问题呢？我表示比较担忧。好在项目里面需要这么做的场景不多，字符串也不长，可以如此暴力解决。如果换个场景，还真不好说。也许又需要一种更高效的解决方案了。
