---
title: '简单 CSS 实现暗黑模式'
date: 2021-10-08T03:38:08.745Z
tags: [css]
---

<!-- 「」 -->

```css
@media (prefers-color-scheme: dark) {
    html {
        filter: invert(90%) hue-rotate(180deg);
    }

    img, video, svg, div[class*="language-"] {
        filter: invert(110%) hue-rotate(180deg);
        opacity: .8;
    }
}
```

具体效果参考本站（打开系统级别的暗黑模式）。 解释：

1. `invert` 将所有色值反转，`hue-rotate` 将黑白以外的其它主色调再反转回来（防止页面主题色出现大的变化）；
2. 网上的 `invert` 通常取值为 `100%`，但是这样反转得到的黑色往往太过黑，眼睛看起来有点累，因此我觉得 `90%` 是一个更合理的值；
3. 将图片、视频等其它不需要被反转的元素再反转回来，并加一个透明度，让其不那么刺眼；
4. 如果 html 反转 `90%`，则图片等元素需要反转 `110%`；
5. `div[class*="language-"]` 对应的是本站 (VuePress) 上的代码块。
