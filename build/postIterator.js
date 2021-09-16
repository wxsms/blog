const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');
const yamlFront = require('yaml-front-matter');

const dest = path.join(__dirname, '..', 'src', 'README.md');

(async () => {
  const files = (await recursive(path.join(__dirname, '..', 'src'))).filter(v => !v.includes('.vuepress') && v.endsWith('.md'));
  const yearArticles = {};
  files.forEach(f => {
    const fa = f.split(path.sep);
    const y = fa[fa.length - 3];
    if (!/\d{4}/.test(y)) {
      return;
    }
    fs.copyFileSync(f, f.replace('index.md', 'README.md'))
    fs.unlinkSync(f)
  });
})();
