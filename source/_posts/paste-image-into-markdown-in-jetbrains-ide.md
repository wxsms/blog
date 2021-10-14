---
title: '在 JetBrains IDE 中向 Markdown 粘贴图片'
date: 2021-09-30T09:14:26.910Z
tags: [idea]
---

其实不需要装任何插件，IDE 自带的 Markdown 插件即可支持该操作：

1. 使用任意截图软件截图到剪贴板；
2. Ctrl + V 复制到编辑器中；
3. IDE 会自动生成图片文件 `img.png`（如果已存在，则会加自增后缀），以及相应的 Markdown 标签 `![img.png](img.png)`。

但是，默认的插件不能配置保存路径（只能是 markdown 文件所在的路径），也不能配置命名规则，因此找了一个插件来增强这个功能。

<!-- more -->

插件名：Markdown Image Support。

![](0f014f66da4940ed84c124e4febd0010.png)

配置界面如下：

![](d39ec6e11506404ea595afff42a20b43.png)

不过，这个插件也有个 bug：当取消粘贴时，会回退到 ide 自身的操作，也就是创建 `img.png`。
