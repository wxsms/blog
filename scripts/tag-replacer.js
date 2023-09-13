'use strict';

hexo.extend.filter.register('before_post_render', function (data) {
  // vuepress style tips
  data.content = data.content
    .replace(/:::\s?(tip|info)/ig, '{% note info %}')
    .replace(/:::\s?(warning|warn)/ig, '{% note warning %}')
    .replace(/:::\s?(danger|error)/ig, '{% note danger %}')
    .replace(/:::/ig, '{% endnote %}');

  return data;
});
