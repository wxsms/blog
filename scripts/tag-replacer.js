'use strict';

hexo.extend.filter.register('before_post_render', function (data) {
  // vuepress style tips
  data.content = data.content
    .replace(/::: tip/g, '{% note info %}')
    .replace(/::: warning/g, '{% note warning %}')
    .replace(/::: danger/g, '{% note danger %}')
    .replace(/:::/g, '{% endnote %}')

  return data;
});
