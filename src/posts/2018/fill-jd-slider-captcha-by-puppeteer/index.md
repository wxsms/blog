---

title: '使用 Puppeteer 自动输入京东滑动验证码'
date: 2018-11-05T09:39:33.386Z
tags: [Puppeteer, NodeJs]
sidebar: false
draft: false

---




<!-- 「」 -->

京东网页端登录有时候需要输入滑动验证码，就像这样：

![jd-verify](https://static.wxsm.space/blog/48596434-ff732280-e993-11e8-94db-2f82be82a1ab.png)

在做自动签到脚本的时候遇到这个很不舒服，如果不处理的话就只能每次弹出浏览器手动登录，因此稍微研究了下。下面是一个非常简单，但成功率很高（达到80%）的自动识别并输入方案，使用 puppeteer 实现。

**总体思路：通过图像特征识别出滑块缺口的位置，然后通过模拟用户点击将滑块拖动到该处。**

<!-- more -->

首先，我们能够看到这个滑块缺口是一个黑色半透明的遮罩区域，通过代码分析并不能得到它的具体色值。因此只能自行比对尝试。通过肉眼测试与对比，可以得到这个遮罩的色值大约为 `rgba(0,0,0,0.65)`

![img](https://static.wxsm.space/blog/48612937-52b19900-e9c5-11e8-97c4-eab52883c540.png)

得到这个色值的目的是：通过判断相邻像素点 a, b 的色值之差，来决定像素点 b 的色值是否是像素点 a 的色值加上遮罩之后的结果，以此来推断遮罩所在的位置。

下面介绍两个函数：

* `combineRgba` rgba 色值相加，返回相加结果
* `tolerance` rgba 色值比对，通过传入一个「容忍值」，返回颜色是否相似

```typescript
/**
 * combine rgba colors [r, g, b, a]
 * @param rgba1 底色
 * @param rgba2 遮罩色
 * @returns {number[]}
 */
export function combineRgba (rgba1: number[], rgba2: number[]): number[] {
  const [r1, g1, b1, a1] = rgba1
  const [r2, g2, b2, a2] = rgba2
  const a = a1 + a2 - a1 * a2
  const r = (r1 * a1 + r2 * a2 - r1 * a1 * a2) / a
  const g = (g1 * a1 + g2 * a2 - g1 * a1 * a2) / a
  const b = (b1 * a1 + b2 * a2 - b1 * a1 * a2) / a
  return [r, g, b, a]
}

/**
 * 判断两个颜色是否相似
 * @param rgba1
 * @param rgba2
 * @param t
 * @returns {boolean}
 */
export function tolerance (rgba1: number[], rgba2: number[], t: number): boolean {
  const [r1, g1, b1] = rgba1
  const [r2, g2, b2] = rgba2
  return (
    r1 > r2 - t && r1 < r2 + t
    && g1 > g2 - t && g1 < g2 + t
    && b1 > b2 - t && b1 < b2 + t
  )
}
```

接下来就可以写出距离算法了，通过传入包含缺口的验证码图片的 base64 编码，以及图片的实际宽度，返回缺口位置 x 值。具体思路是：通过自左而右，自上而下的逐列像素分析，找出第一个跟上个像素的色值与遮罩色值相加后的结果相似的像素点，就认为是遮罩的 x 位置。

![img](https://static.wxsm.space/blog/48612892-33b30700-e9c5-11e8-94d7-a6cc6ec30c87.png)

```typescript
function getVerifyPosition (base64: string, actualWidth: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(1000, 1000)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const width: number = img.naturalWidth
      const height: number = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      const maskRgba: number[] = [0, 0, 0, 0.65]
      const t: number = 10 // 色差容忍值
      let prevPixelRgba = null
      for (let x = 0; x < width; x++) {
        // 重新开始一列，清除上个像素的色值
        prevPixelRgba = null
        for (let y = 0; y < height; y++) {
          const rgba = ctx.getImageData(x, y, 1, 1).data
          if (prevPixelRgba) {
            // 所有原图中的 alpha 通道值都是1
            prevPixelRgba[3] = 1
            const maskedPrevPixel = combineRgba(prevPixelRgba, maskRgba)
            // 只要找到了一个色值匹配的像素点则直接返回，因为是自上而下，自左往右的查找，第一个像素点已经满足"最近"的条件
            if (tolerance(maskedPrevPixel, rgba, t)) {
              resolve(x * actualWidth / width)
              return
            }
          } else {
            prevPixelRgba = rgba
          }
        }
      }
      // 没有找到任何符合条件的像素点
      resolve(0)
    }
    img.onerror = reject
    img.src = base64
  })
}
```

得到 x 位置后，就可以使用 puppeteer 操纵滑块来实现验证了：

```typescript
// 验证码图片（带缺口）
const img = await page.$('.JDJRV-bigimg > img')
// 获取缺口左x坐标
const distance: number = await getVerifyPosition(
  await page.evaluate(element => element.getAttribute('src'), img),
  await page.evaluate(element => parseInt(window.getComputedStyle(element).width), img)
)
// 滑块
const dragBtn = await page.$('.JDJRV-slide-btn')
const dragBtnPosition = await page.evaluate(element => {
// 此处有 bug，无法直接返回 getBoundingClientRect()
  const {x, y, width, height} = element.getBoundingClientRect()
  return {x, y, width, height}
}, dragBtn)
// 按下位置设置在滑块中心
const x: number = dragBtnPosition.x + dragBtnPosition.width / 2
const y: number = dragBtnPosition.y + dragBtnPosition.height / 2

if (distance > 10) {
  // 如果距离够长，则将距离设置为二段（模拟人工操作）
  const distance1: number = distance - 10
  const distance2: number = 10
  await page.mouse.move(x, y)
  await page.mouse.down()
  // 第一次滑动
  await page.mouse.move(x + distance1, y, {steps: 30})
  await page.waitFor(500)
  // 第二次滑动
  await page.mouse.move(x + distance1 + distance2, y, {steps: 20})
  await page.waitFor(500)
  await page.mouse.up()
} else {
  // 否则直接滑到相应位置
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + distance, y, {steps: 30})
  await page.mouse.up()
}
// 等待验证结果
await page.waitFor(3000)
```

![img](https://static.wxsm.space/blog/48613026-91dfea00-e9c5-11e8-988b-42d823a3699a.png)

大概就这样。
