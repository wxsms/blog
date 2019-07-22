---
id: 'plug-alipay-and-wxpay-with-react-native-webview'
title: 'ReactNative WebView 接入支付宝与微信支付'
date: 2019-03-14T07:22:18.133Z
tags: [ReactNative]
index: false
draft: false
---

# ReactNative WebView 接入支付宝与微信支付


在 ReactNative App 的 WebView 中接入支付宝与微信支付其实很简单。首先前提是：使用 H5 网页提前做好了支付相关的动作，ReactNative 方面只负责展示 H5 页面，以及调起相应的 App 来完成支付，不需要接入底层相关的 SDK 或其它代码。

对于 Android 平台来说，经过一番研究，发现 ReactNative 方不需要添加任何额外代码即可达成目的，通过 WebView 拉起支付 App 完成相应支付功能，并在支付成功后返回原 App，体验完美。**但是有一点要注意的是，不要随意修改 WebView 的 UserAgent，如果需要修改的话最好使用追加的方式**，因为支付宝的支付页面如果检测不到 Android 相关的 UserAgent 则不会拉起 App，只能在网页上支付。

iOS 使用以下代码来达到拉起 App 的目的。但有一个问题是，从 App 完成支付动作后，系统会打开浏览器来显示支付结果，而不是回到原 App，这个缺陷应该是使用 WebView 方式无法避免的。

```javascript
onShouldStartLoadWithRequest = ({url}) => {
  // 实际上应该不需要判断， 因为 onShouldStartLoadWithRequest 只支持 iOS，但是保险起见
  if (Platform.OS !== 'ios') {
    return;
  }
  const isAlipay = url && url.startsWith('alipay'); // 支付宝支付链接为 alipay:// 或 alipays:// 开头
  const isWxPay = url && url.startsWith('weixin'); // 微信支付链接为 weixin:// 开头
  const isPay = isAlipay || isWxPay;
  if (isPay) {
    // 检测客户端是否有安装支付宝或微信 App
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url); // 使用此方式即可拉起相应的支付 App
        } else {
          console.log(`请先安装${isAlipay ? '支付宝' : '微信'}客户端`);
        }
      });
    return false; // 这一步很重要
  } else {
    return true;
  }
};
```


