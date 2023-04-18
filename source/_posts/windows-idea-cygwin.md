---
title: 在 Windows 中使用 Cygwin
date: 2021-10-25 10:23:24
tags: windows
---

之前在 [WSL on Windows 10](/2020/wsl-on-windows-10-and-node-js/) 中尝试了 WSL，但是几经周折最后发现问题比较多，用得有点难受。最后还是换回了 windows。

<!-- more -->

## 下载

[https://www.cygwin.com/](https://www.cygwin.com/)

## 设置 Windows Terminal

注意，后面的 `C:\cygwin64` 换成实际安装路径。

### 增加 cygwin 配置

![](fc7090eae0d94fd881cf53c5b6c8b1ce.png)

### 效果

![](96560471a12f469db0212b2f065de6c9.png)

## 设置 IDEA

### 修改 Shell path

注意里面填的是 `C:\cygwin64\bin\env.exe CHERE_INVOKING=1 /bin/bash -l`，这样才能在项目目录打开终端：

![](7455121287654941ac9f9a935d0ccf07.png)

### 效果

![](b04eda3d7db64fdaaccb489f41c392a2.png)

## 设置 ssh keys

可以建一对新的 key pair，也可以直接使用 windows 下面建好的。

如果要使用 windows 的，只需将 `.ssh` 文件夹下面的内容复制到 `C:\cygwin64\home\user\.ssh` 即可。
