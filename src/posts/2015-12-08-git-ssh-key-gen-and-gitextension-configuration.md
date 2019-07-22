---
id: git-ssh-key-gen-and-gitextension-configuration
title: Git SSH key 生成与 GitExtension 配置
date: 2015-12-08T16:26:07+00:00
categories:
  - VCS
tags:
  - Git
---

# Git SSH key 生成与 GitExtension 配置

使用ssh key配置git可以省去每次操作时输入ID/Password的麻烦，操作一旦频繁起来还是很有必要的。实际操作需要添加一些环境变量，或者到git/bin目录下执行。<!--more-->

### 设置Git的默认username和email

这一步没有验证过是否可以省略。

```
$ git config --global user.name "xxx"
$ git config --global user.email "xxx@xxx.xxx"
```

### 本地生成SSH Key

#### 查看是否已有密钥

有的教程说通过 `$ cd ~/.ssh` 查看目录是否存在，不过我的机器上测试无论有没有这一步的结果都是不存在。所以我的方法是到c:/users/username/下查看是否存在.ssh文件夹，存在则将里面的内容删除。

#### 生成密钥

执行 `$ ssh-keygen`，连续回车确认，到最后 ssh key 就会在 `.ssh` 文件夹下生成，带 .pub 后缀的为公钥。遇到找不到路径的情况则需要手动指定 `.ssh` 文件夹的正确位置，我尝试把它放在 D 盘结果 server 不认，还是要指定 `c:/users/username/.ssh` 这个目录去生成，密钥名字为 id_rsa

#### 上传到server

生成结束后需要将公钥上传到相应 server，以 <a href="https://github.com" target="_blank">Github</a> 为例：

![](https://user-images.githubusercontent.com/5960988/48595777-3b58b880-e991-11e8-8ba0-c12bab65ad9e.png)

将公钥文件中的所有内容copy到key输入框中，添加保存即可。

### 配置Git Extension（windows）

以上步骤执行完后可以使用命令行执行推拉等操作，但是在Git Extension就死活不行，后来发现这个工具安装的时候默认使用了putty作为ssh代理，需要手动换成git自带的ssh工具，如图所示：

![](https://user-images.githubusercontent.com/5960988/48595778-3b58b880-e991-11e8-831a-0966dd6ec738.png)
