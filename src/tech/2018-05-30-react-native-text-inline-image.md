---
permalink: '/posts/2018-05-30-react-native-text-inline-image.html
title: 'React Native Text Inline Image'
date: 2018-05-30T02:09:05.427Z
tags: [ReactNative]
sidebar: false
draft: false

---




原文地址（需科学上网）：[medium.com](https://medium.com/@yloeza/react-native-text-inline-image-6055dabd9399)

RN 版本：0.49

<!-- 「」 -->

图文混排（在文字中插入图片，并保持正确换行）是客户端普遍的需求，但在 RN 中它有一点问题，具体表现在 Android 平台下图片显得异常的小，并且相同系统不同设备之间的表现也不尽一样，而 ios 则表现正常。

<!-- more -->

就像这样：

```javascript
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f6f7f8',
  },
  image: {
    width: 80,
    height: 80,
  },
  text: {
    backgroundColor: '#dcdcde',
  },
});

class App extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Hello people!
          <Image
            style={styles.image}
            source={{uri: 'http://s3.hilariousgifs.com/displeased-cat.jpg'}}
          />
        </Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('App', () => App);
```

它在 ios 下看起来是这样的：

![ios-before](https://user-images.githubusercontent.com/5960988/48595774-3ac02200-e991-11e8-8320-d5763b33b4e1.png)

而在 Android 下看起来是这样的：

![android-before](https://user-images.githubusercontent.com/5960988/48595773-3ac02200-e991-11e8-90a8-f7cc619eed50.png)

**可以看到，在 Android 下面这张图异常地小！**

实际上这与设备的像素比（pixel ratio）有关，是现版本 React Native 在渲染文字内联图片时的一个 Bug，为了解决这个问题，我们可以给图片设定一个基于设备像素比的宽高。

就像这样:

```javascript
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  PixelRatio,
} from 'react-native';

const width = 80 * (Platform.OS === 'ios' ? 1 : PixelRatio.get());
const height = 80 * (Platform.OS === 'ios' ? 1 : PixelRatio.get());

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f6f7f8',
  },
  image: {
    width: width,
    height: height,
  },
  text: {
    backgroundColor: '#dcdcde',
  },
});

class App extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Hello people!
          <Image
            style={styles.image}
            source={{uri: 'http://s3.hilariousgifs.com/displeased-cat.jpg'}}
          />
        </Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('App', () => App);
```

结果：

![android-after](https://user-images.githubusercontent.com/5960988/48595772-3a278b80-e991-11e8-922d-f2a5885debfc.png)

如此一来，内联图片在 Android 下就能以正常缩放比显示了。

方便起见，可以将这段逻辑封装到组件中去。

```javascript
import React from 'react';
import {
  StyleSheet,
  Image,
  Platform,
  PixelRatio,
} from 'react-native';

// This component fixes a bug in React Native with <Image> component inside of
// <Text> components.
const InlineImage = (props) => {
  let style = props.style;
  if (style && Platform.OS !== 'ios') {
    // Multiply width and height by pixel ratio to fix React Native bug
    style = Object.assign({}, StyleSheet.flatten(props.style));
    ['width', 'height'].forEach((propName) => {
      if (style[propName]) {
        style[propName] *= PixelRatio.get();
      }
    });
  }

  return (
    <Image
      {...props}
      style={style}
    />
  );
};

// "Inherit" prop types from Image
InlineImage.propTypes = Image.propTypes;

export default InlineImage;
```
