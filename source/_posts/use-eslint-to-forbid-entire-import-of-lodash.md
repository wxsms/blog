---
title: '使用 Eslint 来禁止 Lodash 的整体引入'
date: 2020-07-03T09:57:39.599Z
tags: [javascript,eslint]
---

前端项目使用 lodash 时需要注意，一不小心就会把整个库引入进来，大大增加最终打包体积。

<!-- more -->

两种真正可以实现按 method 引入的方式，一是：

```javascript
import get from 'lodash/get'
```

二是：

```javascript
// yarn add lodash.get
import get from 'lodash.get'
```

除此以外，其它所有方式都会导致整体引入。如：

```javascript
import { get } from 'lodash'
import _ from 'lodash'
import * as _ from 'lodash'
```

虽然我知道这件事，但有时候我的队友不知道，辛辛苦苦改了半天的成果可以被别人一行代码就摧毁。因此我决定找一个方法来永久杜绝这件事的发生：

```javascript
// http://eslint.org/docs/user-guide/configuring
module.exports = {
  'rules': {
    // ...
    'no-restricted-imports': [2, {
      'paths': [
        {
          'name': 'lodash',
          'message': '仅允许类似 import get from \'lodash/get\' 的引入方式'
        }
      ]
    }]
  }
}
```

这样的话，只要代码里面一出现 `import ... from 'lodash'`，eslint 就会报错，提示他去改代码。就算提交了，CI 也通过不了。岂不美哉。
