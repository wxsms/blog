---
title: WordPress 百度主动提交工具
date: 2016-02-29T09:41:20+00:00
tags: [php,wordpress]
---

作为目前的国内搜索主流，百度的收录规则与国外搜索引擎如谷歌、必应等不太一样，虽然它也有提供普通的Sitemap模式，但是据它自己所言通过这种方式收录效率是最低的。另外还有一种是自动推送，即在网站所有页面都加入一个JS脚本，有人访问时就会自动向百度推送该链接，但实测经常会被浏览器的AD Block插件阻拦。因此还剩下效率最高的一种方式：主动推送。我试过了一些现成的插件，好像都不太好用。因为是一个简单的功能，所以就自己写了一个小工具来实现。

<!-- more -->

## 主动推送规则

通过调用百度的一个接口，并给它传送要提交的链接，即完成了主动推送的过程，根据接口返回的信息可以判断提交的结果如何（成功/部分成功/失败）。

核心代码如下（由百度提供）：

```php
$urls = array(
    'http://www.example.com/1.html',
    'http://www.example.com/2.html',
);
$api = 'http://data.zz.baidu.com/urls?site=xxx&token=xxx';
$ch = curl_init();
$options =  array(
    CURLOPT_URL => $api,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POSTFIELDS => implode("\n", $urls),
    CURLOPT_HTTPHEADER => array('Content-Type: text/plain'),
);
curl_setopt_array($ch, $options);
$result = curl_exec($ch);
echo $result;
```

`$urls` 就是我们需要推送的 url 数组了，除此之外还有两个需要修改的地方，都在第5行。一是自己站点的域名，二是准入密钥。密钥会由百度站长工具提供。域名则有一点需要注意，必须填写在百度站长平台注册的域名，比如注册的时候是带有 www 的，则这里也必须带 www，否则会返回域名不一致的错误。

API返回的 `$result` 是一个 JSON 对象，若推送成功可能包含以下字段：


<div class="table-responsive">
  <table class="table table-hover">
    <tr>
      <th>字段</th>
      <th>是否必选</th>
      <th>参数类型</th>
      <th>说明</th>
    </tr>
    <tr>
      <td>success</td>
      <td>是</td>
      <td>int</td>
      <td>成功推送的url条数</td>
    </tr>
    <tr>
      <td>remain</td>
      <td>是</td>
      <td>int</td>
      <td>当天剩余的可推送url条数</td>
    </tr>
    <tr>
      <td>not_same_site</td>
      <td>否</td>
      <td>array</td>
      <td>由于不是本站url而未处理的url列表</td>
    </tr>
    <tr>
      <td>
        not_valid
      </td>
      <td>
        否
      </td>
      <td>
        array
      </td>
      <td>
        不合法的url列表
      </td>
    </tr>
  </table>
</div>

示例：

```json
{
    "remain":4999998,
    "success":2,
    "not_same_site":[],
    "not_valid":[]
}
```

推送失败可能返回的字段：

<div class="table-responsive">
  <table class="table table-hover">
    <tr>
      <th>
        字段
      </th>
      <th>
        是否必选
      </th>
      <th>
        参数类型
      </th>
      <th>
        说明
      </th>
    </tr>
    <tr>
      <td>
        error
      </td>
      <td>
        是
      </td>
      <td>
        int
      </td>
      <td>
        错误码，与状态码相同
      </td>
    </tr>
    <tr>
      <td>
        message
      </td>
      <td>
        是
      </td>
      <td>
        string
      </td>
      <td>
        错误描述
      </td>
    </tr>
  </table>
</div>

示例：

```json
{
    "error":401,
    "message":"token is not valid"
}
```

实测小站点一天只能推500条链接，超过了就会报错。不过目前来说是绝对够用了。

## 实现逻辑

关于这个工具，我能想到的比较合理的使用逻辑是这样的：

  * 建站已有一段时间，但是从来没用过百度主动推送，需要能够选择以往的链接并推送之
  * 旧的链接都已推送过，需要在有新页面发布时自动将其推送

需要推送的页面包括但不限于：

  * 首页
  * 文章（Post）
  * 页面（Page）
  * 目录
  * 标签

由于是第一版，目前这个工具的逻辑就是这样的：

  1. 首先获取到Wordpress站点下所有的正常页面（已发布，无密码）
  2. 让用户选择哪些页面需要被推送
  3. 用户点击按钮，请求经由AJAX发回后台
  4. 后台调用百度接口，实行推送
  5. 返回并显示结果

实际的效果就像这样（<del>点此参观</del> 2016-03-10更新：由于已更换为插件模式，原页面失效）：

![](https://static.wxsm.space/blog/48595794-3eec3f80-e991-11e8-9965-17782fe609a2.jpg)

这个工具目前还很简陋。当然，如果你没有登录或者已登陆但没有管理员权限的话，点击Submit是会被拒绝的。

## 未来的目标

虽然是一个简单的东西，但我觉得它可以变得更好：

  1. 用户应该可以填写自定义的链接
  2. 它应该记住哪些链接已经被提交过了，这个状态应该显示在页面上，并且不再自动勾选
  3. 自动触发推送的功能尚未实现，这个也是很重要的
  4. 表格可以以一种更好的形式展现
  5. Log可以写得更友好一些
  6. 做成插件
  7. &#8230;&#8230;

如无意外，这些都将在之后的版本更新。

GitHub: [https://github.com/wxsms/baidu-submit-for-wordpress](https://github.com/wxsms/baidu-submit-for-wordpress)
