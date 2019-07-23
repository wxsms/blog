---
id: 'case-insensitive-auto-complete-in-oxs-terminal'
title: 'Case insensitive auto-complete in OSX Terminal'
date: 2018-11-23T07:48:00.844Z
tags: [OSX]
sidebar: false
draft: false
layout: SpacePost
---




在 Mac OSX 终端里面由于默认 Home 下面的文件夹都是大写开头，如 Downloads / Desktop 等，cd 的时候比较烦。解决方法：

```
$ echo "set completion-ignore-case On" >> ~/.inputrc
```

然后重启终端即可。
