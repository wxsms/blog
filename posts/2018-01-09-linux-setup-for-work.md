---
id: 'linux-setup-for-work'
title: 'Linux Setup for Work'
date: 2018-01-09T12:56:59.393Z
tags: []
index: true
draft: false
---

因为各种烦人的原因，公司搬家后到新办公室第一件事先把老电脑格了。犹豫了一下，最终还是放弃了重装 Windows，支持我做出选择的原因有几：

* 不需要进行（纯）MS 系开发
* 没有必须使用的 Windows 软件
* Windows 上跑 Android emulator 卡得头疼
* NVIDIA 已有支持 Linux 的官方显卡驱动
* Linux 开发效率更高
* Linux 学习价值更高

本文是办公室适用（对我来说）的安装记录。

<!-- more -->

## System Installation

这次选择的发行版是 Ubuntu 16.04 LTS，从 https://www.ubuntu.com/download/desktop 下载镜像安装包，复制到 u 盘后启动。

这里有一点问题是，我这台机器必须选择 UEFI 安装，Ubuntu 才能正常安装与启动。如果选择了 Legacy 安装，Ubuntu 可以正常安装，但启动后会一直停留在黑屏光标闪烁的状态，原因未知。

## NVIDIA Driver Setup

系统默认安装了一个第三方的显卡驱动，基本上没什么可用性，在桌面上都有点卡。因此官方驱动是必须的。但如果安装不正确，会导致系统重启后无限卡在登录界面。如果不幸已经发生了这种情况，可以按 Ctrl + Alt + F1 进入纯命令行操作界面进行修复。

（以下步骤应该在纯命令行界面下执行）

首先禁用开源驱动：

```
$ sudo vim /etc/modprobe.d/blacklist.conf
```

添加以下内容：

```
blacklist amd76x_edac
blacklist vga16fb
blacklist nouveau
blacklist nvidiafb
blacklist rivatv
```

然后，依次执行（注意先到 NVIDIA 官网查询适用自己显卡的版本号，比如我的辣鸡 GTX650 是适用 384）：

```
$ sudo apt-get remove  --purge nvidia-*
$ sudo add-apt-repository ppa:graphics-drivers/ppa
$ sudo apt-get update
$ sudo service lightdm stop
$ sudo apt-get install nvidia-384 nvidia-settings nvidia-prime
$ sudo nvidia-xconfig
$ sudo update-initramfs -u
```

最后重启系统：

```
$ sudo reboot
```

如此，显卡驱动就装好了。

## Chrome Setup

虽然 Ubuntu App Store 有提供开源版本的 Chromium，但是经过实测它在有些情况下并不能完全替代 Chrome（比如有些工具会调用 `google-chrome` 来打开一个浏览器页，如果安装的是 Chromium 就会失败）。因此，还是建议到 [Google Chrome Downloads](https://www.google.com/chrome/browser/desktop/index.html) 下载适用于 Linux 平台的 Chrome 完全体。

## Secondary Drive Mount

两块硬盘已经不是什么新鲜事了。痛苦的是系统盘以外的另一块硬盘需要手动挂载。

首先，使用 `sudo fdisk -l` 命令来显示目前可用的所有硬盘。假设 `/dev/sdb` 是未分区并且想要挂载的一块硬盘：

执行 `sudo fdisk /dev/sdb`：

1. Press <kbd>O</kbd> and press <kbd>Enter</kbd> (creates a new table)
2. Press <kbd>N</kbd> and press <kbd>Enter</kbd> (creates a new partition)
3. Press <kbd>P</kbd> and press <kbd>Enter</kbd> (makes a primary partition)
4. Then press <kbd>1</kbd> and press <kbd>Enter</kbd> (creates it as the 1st partition)
5. Finally, press <kbd>W</kbd> (this will write any changes to disk)

然后，执行 `sudo mkfs.ext4 /dev/sdb1`

现在新硬盘就已经被分区并格式化了。接下来让系统在启动的时候自动挂载它，执行 `sudo gnome-disks` 打开一个 GUI 界面。

![img](https://i.stack.imgur.com/WZeoX.png)

选择刚才添加的那块硬盘，点击配置按钮，选择目标挂载点，并点击 OK 即可。

![img](https://i.stack.imgur.com/h529h.png)

需要注意的是，目前硬盘是只有读权限的，使用以下命令来给用户赋予读写权限：

```
$ cd /mount/point
$ sudo chmod -R -v 777 *
$ sudo chown -R -v username:username *
```

## Input Method Setup

到 https://pinyin.sogou.com/linux/ 下载合适的输入法包，并安装之。然后从 Settings -> Language Support 中将 Keyboard input method system 从 iBus 切换为 fcitx（有可能会遇到语言包安装不完全的情况，输入 `sudo apt-get install -f` 可以修复），然后重启。

重启后，右键桌面右上角的 fcitx 图标，选择 ConfigureFcitx，点击 + 号添加输入法，**去掉 Only show current language 的勾**，然后输入 sogou 搜索即可看到安装好的搜狗输入法。添加即可。

## Email Setup

因为我的公司邮箱是用的 Ms Exchange，所以设置步骤很简单：

1. Ubuntu 自带 [Mozilla Thunderbird](https://www.mozilla.org/en-US/thunderbird/) 邮件客户端，直接用这个就行了。
2. 它本身是不支持 Exchange 配置的，需要添加一个插件 [ExQuilla for Microsoft Exchange](https://addons.mozilla.org/en-US/thunderbird/addon/exquilla-exchange-web-services/) 以支持。
3. 安装好插件后，从菜单栏的 Tools -> ExQuilla for Microsoft Exchange -> Add Microsoft Exchange Account 进入配置入口，然后就是正常的邮件配置了。

## Screen Shot

以下安装截图工具 Shutter，并设置快捷键：

```
$ sudo add-apt-repository ppa:shutter/ppa
$ sudo apt-get update
$ sudo apt-get install shutter
```

打开 Settings -> Keyboard -> Shortcuts -> Custom Shortcuts，点击 + 添加，输入 Name (Shutter Select) Command (shutter -s)，保存。然后点击刚才添加的项目，在快捷键那里按下 <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>A</kbd> 即可。

![shutter-1](http://www.linuxidc.com/upload/2015_07/150711194568203.png)

![shutter-2](http://www.linuxidc.com/upload/2015_07/150711194568205.png)

## JDK Setup

JDK 可以到 Oracle 网站下载，也可以通过 apt-get 安装 openjdk，以下是安装 openjdk 的过程：

```
$ sudo apt-get install openjdk-8-jdk
$ apt-cache search jdk
$ export JAVA_HOME=/usr/lib/jvm/java-8-openjdk
$ export PATH=$PATH:$JAVA_HOME/bin
```

注意 JAVA_HOME 的 folder 可能有所变化，注意使用实际目录。

## Node.js Setup

Node.js 不直接安装，而是选择使用 [nvm](https://github.com/creationix/nvm) 进行管理。

```
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
$ export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
$ command -v nvm
```

使用方法：https://github.com/creationix/nvm#usage

## MongoDB Setup

这里其实参照[官方文档](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)就行了。

```
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo service mongod start
```

## Change Launcher Position

Ubuntu 默认的 Launcher 设置在了屏幕的左边，但是如果有三屏的话，那用起来其实并不方便。可以通过一个简单的命令将其下置：

```
$ gsettings set com.canonical.Unity.Launcher launcher-position Bottom
```

这样 Launcher 就到了屏幕下方了，就像 Windows 默认的任务栏一样。Ubuntu 会记住这个设定，所以下次登录时也无需重新输入。

## Other Apps

* [微信](https://github.com/geeeeeeeeek/electronic-wechat)
* [有道词典](http://cidian.youdao.com/index-linux.html)
* [网易云音乐](http://music.163.com/#/download)
* [Steam](http://store.steampowered.com/about/)

Linux 下可玩的 Steam 游戏还是挺多的。玩 DOTA2 感觉跟 Windows 也没什么差别。
