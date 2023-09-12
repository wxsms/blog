'use strict';

hexo.extend.filter.register('before_post_render', function (data) {
  // vuepress style tips
  data.content = data.content
    .replace(/::: tip/g, '{% note info %}')
    .replace(/:::tip/g, '{% note info %}')
    .replace(/::: info/g, '{% note info %}')
    .replace(/:::info/g, '{% note info %}')
    .replace(/::: warning/g, '{% note warning %}')
    .replace(/:::warning/g, '{% note warning %}')
    .replace(/::: warn/g, '{% note warning %}')
    .replace(/:::warn/g, '{% note warning %}')
    .replace(/::: danger/g, '{% note danger %}')
    .replace(/:::danger/g, '{% note danger %}')
    .replace(/::: error/g, '{% note danger %}')
    .replace(/:::error/g, '{% note danger %}')
    .replace(/:::/g, '{% endnote %}');

  return data;
});
