---
permalink: '/posts/2016-02-22-wordpress-unable-to-send-email-under-aliyun-virtual-host.html'
title: WordPress 在阿里云虚拟主机下无法发送邮件
date: 2016-02-22T11:16:24+00:00
categories:
  - CMS
tags:
  - PHP
  - Wordpress

---



安装在阿里云虚拟主机环境下的Wordpress死活都发不出邮件，用户注册的邮件发不出，评论总结也发不出，等等等等，尝试了各种方法都以失败告终。今天用更改代码+SMTP插件终于试成功了，以下是解决方案。

<!--more-->

## 更改主机设置

首先阿里云虚拟主机发邮件相关的函数只开放了一个，即 `fsockopen`，默认情况下还是禁用的，所以我们要去控制台打开它（主机管理 ⇒ 站点信息 ⇒ 高级环境设置 ⇒ PHP.ini设置）。如图所示。

![](https://user-images.githubusercontent.com/5960988/48595792-3e53a900-e991-11e8-9513-b8e2070d461e.jpg)

## 更改Wordpress代码

找到代码安装路径下的 `wp-includes/class-smtp.php` 文件，搜索以下代码段：

```
$this->smtp_conn = @stream_socket_client(
    $host . ":" . $port,
    $errno,
    $errstr,
    $timeout,
    STREAM_CLIENT_CONNECT,
    $socket_context
);
```

将其**替换**成：

```
$this->smtp_conn = fsockopen($host, $port, $errno, $errstr);
```

**注意**：升级Wordpress可能会导致这段修改过的代码丢失，因此可能每次Wordpress主程序升级后都要再次修改此段代码！

## 安装SMTP插件

改完代码以后，到Wordpress控制台搜索插件**Easy WP SMTP**（其它类似插件应该也行，这里以它为例），安装并启用。如图所示配置好。

![](https://user-images.githubusercontent.com/5960988/48595793-3eec3f80-e991-11e8-800e-e4dab8c116be.jpg)

配置好后点击Save，保存成功后下方会有一个测试发送的表单。可以用它来测试SMTP是否已经可以正确工作。

如果测试邮件已经可以正常发送接收，则说明Wordpress的其它邮件也都可以正常收发了。

另外，本人测试过使用QQ和126的SMPT服务器，均以失败告终，原因未知。

## 问题待解决

现在Wordpress主程序是可以正常发邮件了，但是**BackWPup**插件的邮件依然是完全发不出去，使用它提供的所有方式都不行，使用同样的SMTP配置也是不行，它也没有提供什么有用的错误信息，完全摸不着头脑。

为什么需要这个插件发邮件呢。因为它是网站的备份主力，但是因为邮件发不出去的关系，不能通过邮件发送备份，只能备份到主机的文件夹下。这样就很没安全感了，要完蛋都是一锅端的感觉，有无备份没什么区别。它提供的其它方案也好像都被墙了，比如Dropbox什么的。

这个问题待解决。
