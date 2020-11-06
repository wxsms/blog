---
permalink: '/posts/2020-10-26-enable-soft-wrap-for-markdown-files-in-idea-by-default.html'
title: 'IDEA 为 Markdown 文件默认启用 SoftWrap'
date: 2020-10-26T03:23:49.630Z
tags: []
---

<!-- 「」 -->

应该 JetBrains 家的所有 IDE 都有这个配置。习惯了用 Markdown 写博客的人每次都要手动点一下 SoftWrap 挺烦的。后来发现了一个配置可以帮我省去这一步：

打开设置，找到：`Editor` > `General` > `Soft Wraps`，将 `Soft-wrap files` 选项勾上即可。IDE 默认已经填上了 `*.md; *.txt; *.rst; *.adoc`，因此不需要再做别的事情。

![image](https://static.wxsm.space/blog/98069913-fc341280-1e9a-11eb-82d4-2dbaa96672bd.png)

这样一来，每次只要打开以上格式的文件，编辑器就会自动开启 SoftWrap，一劳永逸。

<!-- more -->