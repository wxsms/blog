---
permalink: '/posts/2016-02-03-using-idea-to-config-ftp-auto-deployment.html
title: 使用 IDEA 配置自动同步到FTP服务器
date: 2016-02-03T16:45:27+00:00
categories:
  - IDE
tags:
  - FTP
  - IntelliJ-IDEA

---



使用虚拟主机的时候经常会想到一个问题，就是改了代码以后还要手动上传到服务器上，非常麻烦，且不利于保持本地开发代码与服务器上运行代码之间的同步，容易出错。今天突然想着能不能用IDE来完成类似自动同步的事情，如果可以的话开发效率自然是大幅度提高。拜强大到没朋友的IDEA所赐，结果非常可观。

首先确保安装好IDEA，测试用IDEA版本为15.0.1，然后我们从FTP服务器上copy一份代码到本地，并创建好存放目录。此时代码应该是完全同步的。以上为准备工作。

<!--more-->

然后我们打开IDEA，选择File -> Open，打开代码根目录。

打开Tools -> Deployment -> Configuration

![](https://user-images.githubusercontent.com/5960988/48595786-3d227c00-e991-11e8-8b42-bbf3f871ab10.png)

在弹出的界面中点击 `+` 按钮，添加一个服务器。

![](https://user-images.githubusercontent.com/5960988/48595787-3dbb1280-e991-11e8-9519-0876ffc4f595.png)

如下图所示，填写主机地址，端口（如果不一样），用户名与密码以后，就可以点 `Test FTP connection` 按钮进行连接测试，如果连接成功，IDEA会有相应的提示。以下的步骤需要以此为前提。

点击 `Autodetect` 按钮后，选择服务器的根目录，一般选择最顶端的文件夹就OK了。即使代码并不是在根目录，我们也还有后面的配置来选择代码所处的实际目录。

最下面的 `Web server root URL` 字段可以填写网站的实际访问地址，这样在使用IDEA的实时预览功能时，浏览器就会以该Domain为基准进行路由。

![](https://user-images.githubusercontent.com/5960988/48595788-3dbb1280-e991-11e8-9438-a8d09ef6921f.png)

切换到 `Mappings` 标签，我们需要填写的字段也如下图。

`Local path` 即本地代码根目录，IDEA已经自动设置好了。

`Deployment path`则是FTP服务器上实际同步的位置，在此选择代码所处的文件夹即可。以上都填好后点击 `OK` 按钮。

![](https://user-images.githubusercontent.com/5960988/48595789-3dbb1280-e991-11e8-9332-0cbd1058f81d.png)

现在就大功告成了。我们可以选中一些文件或者文件夹，右键，然后就可以看到 Deployment 菜单，其子菜单有 Upload，Download，Compare，Sync四个。其中 Sync 就是我们所期望的功能，IDEA 会帮我们完成文件比较，与 VCS 的文件比较系统非常相似，确认无误后点击绿色的向右箭头按钮，代码就同步到服务器上去了。如下所示。

![](https://user-images.githubusercontent.com/5960988/48595790-3e53a900-e991-11e8-80bf-0f6212ac3d70.png)

当然每次都要右键然后找到 Sync 选项可能会有点太麻烦。我们可以把这个功能放到主工具栏上去，以后每次点它就行了。

![](https://user-images.githubusercontent.com/5960988/48595791-3e53a900-e991-11e8-9a35-1116a1f7461f.png)

接下来就可以享受愉快的开发体验了。唯一需要注意的是在网络不是非常理想的情况下，Sync 的时候不要选择项目根目录，选择真正有改变的文件或者文件夹即可，因为它毕竟不是 VCS，所有文件一个个比对的话实在是太慢。当然我们也可以配合 VCS 使用，效果更佳，这里就不再赘述。
