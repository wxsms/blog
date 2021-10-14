---
title: WordPress 更改后台字体为雅黑
date: 2016-05-25T19:33:45+00:00
tags: [wordpress]
---

这个问题其实困扰了我很久。默认的后台字体实在是惨不忍睹。今天终于发现了一个很好的方案，完美解决。

在当前主题的 `functions.php` 中，加上如下代码：

```php
/**
 * 更改后台字体为雅黑
 */
function change_admin_font(){
    echo '<style type="text/css">.wp-admin{font-family: \'Helvetica Neue\', Helvetica, \'Microsoft Yahei\', \'Hiragino Sans GB\', \'WenQuanYi Micro Hei\', sans-serif;}</style>';
}
add_action('admin_head', 'change_admin_font');
```

顺便提供一下更改 Twenty Sixteen 主题字体的代码吧，要改的地方挺多的。

<!-- more -->

```css
/* reset font */
body,
button,
input,
select,
textarea,
button,
button[disabled]:hover,
button[disabled]:focus,
input[type="button"],
input[type="button"][disabled]:hover,
input[type="button"][disabled]:focus,
input[type="reset"],
input[type="reset"][disabled]:hover,
input[type="reset"][disabled]:focus,
input[type="submit"],
input[type="submit"][disabled]:hover,
input[type="submit"][disabled]:focus,
.post-password-form label,
.main-navigation,
.post-navigation,
.post-navigation .post-title,
.pagination,
.image-navigation,
.comment-navigation,
.site .skip-link,
.logged-in .site .skip-link,
.widget .widget-title,
.widget_recent_entries .post-date,
.widget_rss .rss-date,
.widget_rss cite,
.tagcloud a,
.site-title,
.entry-title,
.entry-footer,
.sticky-post,
.page-title,
.page-links,
.comments-title,
.comment-reply-title,
.comment-metadata,
.pingback .edit-link,
.comment-reply-link,
.comment-form label,
.no-comments,
.required,
.site-footer .site-title:after,
.widecolumn label,
.widecolumn .mu_register label {
    font-family: 'Helvetica Neue', Helvetica, 'Microsoft Yahei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}

::-webkit-input-placeholder {
    font-family: 'Helvetica Neue', Helvetica, 'Microsoft Yahei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}

:-moz-placeholder {
    font-family: 'Helvetica Neue', Helvetica, 'Microsoft Yahei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}

::-moz-placeholder {
    font-family: 'Helvetica Neue', Helvetica, 'Microsoft Yahei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}

:-ms-input-placeholder {
    font-family: 'Helvetica Neue', Helvetica, 'Microsoft Yahei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}
```

&nbsp;
