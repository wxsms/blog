/**
 * Use this file to iterate posts and do anything needed.
 */

/*
const fs = require('fs')
const yamlFront = require('yaml-front-matter')

readFilesFromDirSync = function (dirname, onFileContent, onError) {
  try {
    let fileNames = fs.readdirSync(dirname)
    fileNames.forEach(filename => {
      let content = fs.readFileSync(dirname + '/' + filename, 'utf-8')
      try {
        if (typeof onFileContent === 'function') {
          onFileContent(filename, content)
        }
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e)
        }
      }
    })
  } catch (e) {
    if (typeof onError === 'function') {
      onError(e)
    }
  }
}

readFilesFromDirSync('../src/life', (filename, content) => {
  if (filename === 'README.md') {
    return
  }
  let _content = content.replace(/(permalink:.+)/, `permalink: '/posts/${filename.replace('.md', '.html')}'`)
  fs.writeFileSync('../src/life/' + filename, _content)
}, (err) => {
  console.error(err)
})
*/
