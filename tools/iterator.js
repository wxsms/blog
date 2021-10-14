const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');
const yamlFront = require('yaml-front-matter');

(async () => {
  const files = (await recursive(path.join(__dirname, '..', 'source'))).filter(v => !v.includes('.vuepress') && v.endsWith('.md'));
  files.forEach(file => {
    // todo
  });
})();
