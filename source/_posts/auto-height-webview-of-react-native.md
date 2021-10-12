---

title: 'Auto-height Webview of ReactNative'
date: 2018-04-24T06:32:30.482Z
tags: [JavaScript,ReactNative]
sidebar: false
draft: false
---

自动高的 Webview 实现方式其实跟 iframe 无二，无非是计算其内容高度后再赋值给容器样式。但是普通的办法实际上用起来差强人意，**其问题主要体现在页面加载过慢，需要整个页面（包括图片）加载完成后才能计算出高度**。而实际想要的效果往往是跟普通“网页”的表现一致，即：**先加载文字，图片等内容异步加载、显示**。在尝试了多款开源解决方案后，问题均没有得到解决，因此有了自己动手的想法。

不过本方案目前也只适用于自己拼接的 HTML，不适用于直接打开链接的 Webview，应用场景主要是在 ReactNative 应用内打开由 CMS 编辑的类新闻页面。

<!-- more -->

主要思路为：通过 Webview 提供的 `postMessage` 交互方式，不断地从 HTML 页面把自己计算好的高度抛送给 APP 端。但是这里其实有个问题，ReactNative Webview 的 `postMessage` 必须在页面加载完成以后才会注入，因此可以先加载一个空白页，待 `postMessage` 注入完成以后，再将实际文章内容插入到 `body` 中。

但是这么做有一个问题就是，页面将无法知道真正的内容“是否已加载完”，因为 `window.onload` 事件在加载开始之前就已经结束了。因此它只能不停地抛送高度信息，直到页面被销毁。

核心代码（HTML）：

```html
<html>
<head>
    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <script>
      var inserted = false;
      var interval = setInterval(function () {
        var body = document.body, html = document.documentElement;
        var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        if (window.postMessage) {
          if (!inserted) {
            document.body.innerHTML = '${valueParsed}';
            inserted = true;
          }
          window.postMessage(height + '');
        }
        if (document.readyState === 'complete') {
          //clearInterval(interval)
        }
      }, 200);
    </script>
</head>
<body></body>
</html>
```

核心代码（App）：

```javascript
export default class AutoHeightWebview extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      webviewHeight: 0
    };
  }

  assembleHTML = (value) => {
    // 组装HTML，略
  };

  onMessage = (event) => {
    const webviewHeight = parseFloat(event.nativeEvent.data);
    if (!isNaN(webviewHeight) && this.state.webviewHeight !== webviewHeight) {
      this.setState({webviewHeight});
    }
  };

  render () {
    const HTML = this.assembleHTML(this.props.html);
    const onLoadEnd = this.props.onLoadEnd || function () {};
    // 防止 postMessage 与页面原有方法冲突
    const patchPostMessageFunction = function () {
      var originalPostMessage = window.postMessage;
      var patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
      };
      patchedPostMessage.toString = function () {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
      };
      window.postMessage = patchedPostMessage;
    };

    const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';

    return (
      <WebView
        injectedJavaScript={patchPostMessageJsCode}
        source={{html: HTML, baseUrl: 'http:'}}
        scalesPageToFit={Platform.OS !== 'ios'}
        bounces={false}
        scrollEnabled={false}
        startInLoadingState={false}
        automaticallyAdjustContentInsets={true}
        onMessage={this.onMessage}
        onLoadEnd={onLoadEnd}
      />
    );
  }
}
```

