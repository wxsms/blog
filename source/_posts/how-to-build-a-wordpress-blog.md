---
title: WordPress 博客搭建
date: 2016-02-22T09:12:03+00:00
tags: [wordpress]
---

本文是本站的建站历程记录。每个人都可以使用极少的代价（甚至免费）拥有一个域名独立且完全自主的个人网站或博客，在于怎么选择而已。此类网站的搭建很多情况下并不要求其操作者是一个程序狗，所以个人感觉可玩性还是挺强的。整个过程一共需要准备三种事物：**域名**，**托管**与**程序**（特殊情况，如果选择国内主机则需要准备第四种，即**备案**）。

<!-- more -->

## 域名

搭建一个网站首先必不可少的就是自己的域名，比如本站的域名是[wxsm.space](http://wxsm.space)，域名可以在任意服务商处购买，不需要与托管的服务商一致。根据域名后缀的不同，价格在几十元至百元每年之间不等，大多数服务商都会提供首年优惠，少部分首年的价格甚至可以达到个位数（比如万网的 `.top` 域名购买首年只需4软妹币）。

域名的选择没什么技术含量，主要就是自己喜欢。本站的域名是在[万网](http://wanwang.aliyun.com/)购买。域名购买以后可以解析到托管的IP地址。

需要注意的地方：

  1. 如果打算购买国内（特指大陆）主机，就一定要确定自己购买的域名后缀是可以备案的类型。具体可以在工信部网站（公共查询 ⇒ 域名类型）查询，能查到的则是可备案后缀。切记切记。
  2. 为自己的安全着想，最好不要使用 `.cn` 类型的域名。

## 托管

托管有很多种选择，首先从大的方向说，尽量选择靠谱的供应商。淘宝小商家之类的虽然便宜，但是很多时候我们需要的更多是稳定，毕竟是把代码和数据都放在别人家，还是很要命的一件事。当然如果免费的话又另当别论。至于配置就纯看个人需求了。如果是玩玩个人小网站，一般选最低的那些都没问题。

### 国内/香港/国外

国内主机理论上来说从国内访问速度最快，其最大的特点是需要备案，其二是会被GFW限制，主机上的程序将会无法访问到Google等公司提供的服务。

香港主机速度可媲美国内主机，是主攻国内但是又不想备案的不二之选。

国外主机在国内的访问速度可能会非常之慢，尤其是欧美地区，稍快一些的可以选择新加坡。其特点是很多都相对国内以及香港主机较为便宜，以及有部分免费（比如AppHarbor，免费空间，免费SQL Server，无限流量，同步Github仓库，自动部署，简直不要太良心，可惜只能跑.Net）。

本站目前使用的是万网提供的国内主机。

### 虚机/VPS/其它

虚机即虚拟主机。该类型主机一般都是共享系统资源，如CPU，内存，带宽，IP等。虚机好像只有ASP.Net和PHP两种类型（反正我是没见过其它的），并且所有功能都是由外部配置好的，用户只能使用服务商所提供的功能，超出范围则无能为力，因此它的限制会比较大。操作方式就是通过FTP访问其储存空间，然后将写好的程序上传，马上就能在浏览器看到结果，不需要考虑部署、环境等。如果使用CMS（如Wordpress）的话，这种主机已经足够用了。

VPS相当于一台属于自己的计算机，用户可以通过各种方式登录并且对它操作，安装环境，部署网站等。Java，Node.js等类型的程序好像只能跑在VPS上。因为没有用过所以不太了解。其价格要普遍比虚机贵一些。

还有一些是类似Github Pages的静态服务器，它们只能够作为静态网页的托管。这些可能会很便宜，但是需要一定的技巧才能玩出花样来。

本站目前使用的是万网提供的虚机，免费版。每个人都可以申请，使用期限为两年。运行Wordpress完全没有问题。传送门：<http://wanwang.aliyun.com/hosting/free/>

## 程序

有了域名和托管，我们需要的最后一件事物就是程序。程序才是真正运行着的东西。

程序可以自己写，也可以用开源软件。自己写的好处就是完全控制，以及比较有意思，但如果更多的是想要做内容的话还是用开源软件比较好，这样就可以更好地关注于网站的内容本身而不是实现。

本站使用的是开源Wordpress CMS，我们要做的事情很简单，在中文官网<https://cn.wordpress.org/>首页把Wordpress程序下载回来，解压，然后将文件夹上传到服务器根目录，通过访问其任意页面来配置站点的基本信息，如名字，描述，数据库连接等，就可以非常方便地搭建好整个网站。数据库表等其它事物都会由程序自动生成。关于这个软件的安装和使用方法网络上有非常多的详细教程，遇到问题多用搜索就好啦。

WordPress的主题和插件简直数不过来，我觉得满足98%个人网站用户的需求完全是没问题的。加之它有强大的缓存插件，可以自动将所有的动态页面都缓存成HTML然后301之，所以访问性能也不在话下。当然如果想要实现某些特别的自定义功能的话，还是要懂一点点编程技巧才行。

## 备案

如果使用的是国内的托管，则需要进行最麻烦的一步：备案。

备案一般是由代理商完成，不需要我们自己直接与工信部沟通。

整个流程有两个地方稍微麻烦，一是初审填表，需要下载、打印、填表、扫描、上传这么多的步骤。其次是“当面核验”，其实就是拍个照上传，但是需要它专用的背景幕布，可以到指定的拍照地点免费拍摄，或者代理商以免费或者到付的形式快递幕布给申请人，然后自行拍照上传。

管局审核需要的时间从从两个小时到三十天不等，主要看运气。反正我是这个时间段内的都遇到过（广东）。

备案通过以后，需要把备案号以链接的形式加到网站的底部，然后就可以该干嘛干嘛了。
