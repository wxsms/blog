const recursive = require('recursive-readdir')
const path = require('path')
const fs = require('fs')
const yamlFront = require('yaml-front-matter');

(async () => {
  const files = (await recursive(path.join(__dirname, '..', 'source'))).filter(v => !v.includes('.vuepress') && v.endsWith('.md'))
  const yearArticles = {}
  files.forEach(f => {
    const fa = f.split(path.sep)
    const y = fa[fa.length - 3]
    const id = fa[fa.length - 2]
    if (!/\d{4}/.test(y)) {
      return
    }
    // console.log(id)
    fa.splice(fa.length - 3, 1)
    fa.pop()
    fa[fa.length - 1] += '.md'

    const flatPath = fa.join(path.sep)
    fs.copyFileSync(f, flatPath)
    console.log(f, flatPath)
  })
})()
