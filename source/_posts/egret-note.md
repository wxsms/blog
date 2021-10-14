---
title: 'Egret Note'
date: 2017-02-22 16:17:00
tags: [egret,note]
---

Egret Engine 的学习笔记。

Egret Engine 是一款基于 JavaScript 的游戏制作引擎，支持 2D 与 3D 模式，支持 Canvas 与 WebGL 渲染，目前使用 TypeScript 编写。

<!-- more -->

## 显示对象

“显示对象”，准确的含义是可以在舞台上显示的对象。可以显示的对象，既包括可以直接看见的图形、文字、视频、图片等，也包括不能看见但真实存在的显示对象容器。

在Egret中，视觉图形都是由显示对象和显示对象容器组成的。

### 对象树

* 根：舞台 `DisplayObjectContainer:Stage`
* 茎：主容器（文档类） `DisplayObjectContainer`
* 树枝：容器 `DisplayObjectContainer`
* 树叶：显示对象 `DisplayObject`

### 对象类型

* `DisplayObject`	显示对象基类，所有显示对象均继承自此类
* `Bitmap`	位图，用来显示图片
* `Shape`	用来显示矢量图，可以使用其中的方法绘制矢量图形
* `TextField`	文本类
* `BitmapText`	位图文本类
* `DisplayObjectContainer`	显示对象容器接口，所有显示对象容器均实现此接口
* `Sprite`	带有矢量绘制功能的显示容器
* `Stage`	舞台类

### 基本概念

二维坐标系。原点位于**左上角**。

```js
var shape:egret.Shape = new egret.Shape();
shape.x = 100;
shape.y = 20;
```

支持的操作：

* alpha：透明度
* width：宽度
* height：高度
* rotation：旋转角度
* scaleX：横向缩放
* scaleY：纵向缩放
* skewX：横向斜切
* skewY：纵向斜切
* visible：是否可见
* x：X 轴坐标值
* y：Y 轴坐标值
* anchorOffsetX：对象绝对锚点 X
* anchorOffsetY：对象绝对锚点 Y

#### 锚点

Display Object 显示在舞台上的的位置需要通过 Anchor 来计算（初始值位于 Display Object 的左上角），可以通过 `anchorOffsetX` 和 `anchorOffsetY` 方法来改变对象的锚点（比如移至中点）。

#### 定位

Display Object 的初始坐标为 **(0, 0)**，即位于**容器的左上角**（而非舞台）。

* 相对于容器的位置可以类比作 `position: relative`
* 相对于舞台的位置可以类比作 `position: absolute`

如果要获取绝对位置，需要调用 `container.globalToLocal(x, y)` 方法，参数代表舞台坐标，返回值为容器坐标。

至于 `z-index` 则跟 svg 的处理类似。

#### 尺寸

两种方法更改尺寸：

* height / width
* scaleX / scaleY

#### 斜切

斜切可以造成类似矩形变形为平行四边形的效果。

* skewX：横向斜切
* skewY：纵向斜切

## 对象容器

`DisplayObjectContainer` 是 `DisplayObject` 的子类。

向 Container 中添加 DisplayObject：

```js
container.addChild(displayObject);
```

> 同一个显示对象无论被代码加入显示列表多少次，在屏幕上只绘制一次。如果一个显示对象 A 被添加到了 B 这个容器中，然后 A 又被添加到了 C 容器中。那么在第二次执行 C.addChild(A) 的时候，A 自动的从 B 容器中被删除，然后添加到 C 容器中。

移除：

```js
container.removeChild(displayObject);
```

### 深度管理

DisplayObject 的 `z-index` 由其插入到容器中的顺序决定。后插入的显示在上层。

插入到指定位置使用 `container.addChildAt(object, index)` 方法。

同时也有 `container.removeChileAt(index)` 方法。

删除全部对象使用 `container.removeChildren()` 方法。

交换 DisplayObject 的位置有两个方法：

* `container.swapChildren(object, object)`
* `container.swapChildrenAt(index, index)`

手动设置 z-index 使用 `container.setChildIndex( object, index )` 方法。

### 子对象选择

通过 z-index 获取：`container.getChildAt(index)`

通过 name 获取（需要预先给 DisplayObject 设置 name 属性）：`container.getChildByName(name)`

> 通过 z-index 获取子对象性能更佳。

## 矢量绘图

> Egret中可以直接使用程序来绘制一些简单的图形，这些图形在运行时都会进行实时绘图。要进行绘图操作，我们需要使用 Graphics 这个类。但并非直接使用。 一些显示对象中已经包含了绘图方法，我们可以直接调用这些方法来进行绘图。 Graphics 中提供多种绘图方法。

已有的绘图方法包括：矩形、圆形、直线、曲线、圆弧。

以下的 `shp` 代表 shape，即一个 Shape 对象的实例。

`shp.graphics.clear()` 是通用的清楚绘图方法。

### 基本图形

#### 矩形

```js
var shp:egret.Shape = new egret.Shape();
shp.graphics.beginFill( 0xff0000, 1); //color and alpha
shp.graphics.drawRect( 0, 0, 100, 200 ); // x y width height
shp.graphics.lineStyle( 10, 0x00ff00 ); // border-width and border-color
shp.graphics.endFill();
this.addChild( shp );
```

#### 圆形

```js
shp.graphics.lineStyle( 10, 0x00ff00 );
shp.graphics.beginFill( 0xff0000, 1);
shp.graphics.drawCircle( 0, 0, 50 ); // x y r
```

> 此处需要注意的是，圆形的X轴和Y轴位置是相对于Shape对象的锚点计算的。

#### 直线

```js
shp.graphics.lineStyle( 2, 0x00ff00 );
shp.graphics.moveTo( 10,10 ); // 起点
shp.graphics.lineTo( 100, 20 ); // 终点（可以多次执行 lineTo）
```

#### 曲线

```js
shp.graphics.lineStyle( 2, 0x00ff00 );
shp.graphics.moveTo( 50, 50);
shp.graphics.curveTo( 100,100, 200,50); // 控制点 x y ，终点 x y
```

#### 圆弧

```js
drawArc( x:number, y:number, radius:number, startAngle:number, endAngle:number, anticlockwise:boolean ):void
```

前面的参数跟前面绘制圆形的一样，圆弧路径的圆心在 (x, y) 位置，半径为 radius 。后面的参数表示根据 anticlockwise ： 如果为 true，逆时针绘制圆弧，反之，顺时针绘制。

> 需要注意是传入的 startAngle 和 endAngle 均为弧度而不是角度。

## 遮罩

DisplayObject 有一个 `mask` 属性，简单来说，就是类似蒙版上面的一个洞。但这个 `mask` 是洞而不是蒙版。如果添加了 `mask` 属性，则 Object 只能显示这个“洞中”的内容。

用作遮罩的显示对象可设置动画、动态调整大小。遮罩显示对象不一定需要添加到显示列表中。**但是，如果希望在缩放舞台时也缩放遮罩对象，或者如果希望支持用户与遮罩对象的交互（如调整大小），则必须将遮罩对象添加到显示列表中**。

> 不能使用一个遮罩对象来遮罩另一个遮罩对象。

通过将 mask 属性设置为 null 可以删除遮罩。

```js
mySprite.mask = null;
```

## 碰撞检测

* 非精确：`var isHit:boolean = shp.hitTestPoint( 10, 10 );`
* 精确：`shp.hitTestPoint( 10, 10，ture);`

非精确大概可以看做面积相交，精确则是边缘相交。

> 大量使用精确碰撞检测，会消耗更多的性能。

## 文本

Egret 提供三种不同的文本类型，不同类型具有以下特点：

* 普通文本：用于显示标准文本内容的文本类型
* 输入文本：允许用户输入的文本类型
* 位图文本：借助位图字体渲染的文本类型

### 样式

```js
var label:egret.TextField = new egret.TextField(); 
label.text = "这是一个文本";
label.size = 20; // 全局默认值 egret.TextField.default_size，下同
label.width = 70;
label.height = 70;
label.textAlign = egret.HorizontalAlign.RIGHT; // CENTER LEFT
label.verticalAlign = egret.VerticalAlign.BOTTOM; // MIDDLE TOP
label.fontFamily = "KaiTi"; // default_fontFamily
label.textColor = 0xff0000; // default_textColor

//设置粗体与斜体
label.bold = true;
label.italic = true;

//设置描边属性
label.strokeColor = 0x0000ff;
label.stroke = 2;
this.addChild( label );
```

支持格式混排：

```js
// JSON 模式
label.textFlow = <Array<egret.ITextElement>>[
    {text: "妈妈再也不用担心我在", style: {"size": 12}}
    , {text: "Egret", style: {"textColor": 0x336699, "size": 60, "strokeColor": 0x6699cc, "stroke": 2}}
    , {text: "里说一句话不能包含各种", style: {"fontFamily": "楷体"}}
    , {text: "五", style: {"textColor": 0xff0000}}
    , {text: "彩", style: {"textColor": 0x00ff00}}
    , {text: "缤", style: {"textColor": 0xf000f0}}
    , {text: "纷", style: {"textColor": 0x00ffff}}
    , {text: "、\n"}
    , {text: "大", style: {"size": 36}}
    , {text: "小", style: {"size": 6}}
    , {text: "不", style: {"size": 16}}
    , {text: "一", style: {"size": 24}}
    , {text: "、"}
    , {text: "格", style: {"italic": true, "textColor": 0x00ff00}}
    , {text: "式", style: {"size": 16, "textColor": 0xf000f0}}
    , {text: "各", style: {"italic": true, "textColor": 0xf06f00}}
    , {text: "样", style: {"fontFamily": "楷体"}}
    , {text: ""}
    , {text: "的文字了！"}
];

// HTML 模式 （标签与属性部分支持）
label.textFlow = (new egret.HtmlTextParser).parser(
    '没有任何格式初始文本，' +
    '<font color="#0000ff" size="30" fontFamily="Verdana">Verdana blue large</font>' +
    '<font color="#ff7f50" size="10">珊瑚色<b>局部加粗</b>小字体</font>' +
    '<i>斜体</i>'
);
```

### 事件与链接

```js
tx.textFlow = new Array<egret.ITextElement>(
    { text:"这段文字有链接", style: { "href" : "event:text event triggered" } }
    ,{ text:"\n这段文字没链接", style: {} }
);
tx.touchEnabled = true;
tx.addEventListener( egret.TextEvent.LINK, function( evt:egret.TextEvent ){
    console.log( evt.text );
}, this );
```

也可以直接将 `href` 设置为 url，这样不需要事件监听，将直接打开链接。但**只适用 Web 端**。

### 文本输入

关键代码是设置其类型为 INPUT。

```js
var txInput:egret.TextField = new egret.TextField;
txInput.type = egret.TextFieldType.INPUT;
```

绘制输入背景可以用其它 DisplayObject，目前没有内置实现。

获取焦点使用 `textIput.setFocus();` 方法。

除此以外，还有 `inputType` 属性表示输入内容的区别，这个主要用于移动端弹出相应的键盘。

## 事件处理

事件类：`egret.Event`

### 执行流程

> 事件机制包含4个步骤：注册侦听器，发送事件，侦听事件，移除侦听器。这四个步骤是按照顺序来执行的。

### 事件类

其构建器可以传 3 个参数：事件类型、是否冒泡、是否可取消（什么是取消？）。

```js
class DateEvent extends egret.Event
{
    public static DATE:string = "约会";
    public _year:number = 0;
    public _month:number = 0;
    public _date:number = 0;
    public _where:string = "";
    public _todo:string = "";
    public constructor(type:string, bubbles:boolean=false, cancelable:boolean=false)
    {
        super(type,bubbles,cancelable);
    }
}
```

### 监听器

跟常见的情况不太一样，Egret 的事件**绑定在发送者上**（而不是接收者）。

#### 监听器函数

> 一个侦听器必须是函数，它可以是一个独立函数，也可以是一个实例的方法。侦听器必须有一个参数，并且这个参数必须是 Event 类实例或其子类的实例， 同时，侦听器的返回值必须为空（void）。

#### 注册与移除事件监听

注册侦听器

```js
eventDispatcher.addEventListener(eventType, listenerFunction, this);
```

移除侦听器

```js
eventDispatcher.removeEventListener(eventType, listenerFunction, this);
```

检测侦听器

```js
eventDispatcher.hasEventListener(eventType);
```

#### 优先级

```js
public addEventListener(type:string, listener:Function, thisObject:any, useCapture:boolean = false, priority:number = 0)
```

> 该属性为一个number类型，当数字越大，则优先级越大。在触发事件的时候优先级越高。
