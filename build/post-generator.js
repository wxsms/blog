const read = require('readline-sync')
const fs = require('fs')
const path = require('path')

let str = fs.readFileSync(path.join(__dirname, 'server-views/post-template.md'), 'utf8')

let postTitle = read.question('Enter post title: ')
let postId = read.question('Enter post id: ')
let tags = read.question('Enter tags (separate by comma): ')
let isoDateStr = new Date().toISOString()

str = str
  .replace('{{id}}', postId)
  .replace('{{title}}', postTitle)
  .replace('{{tags}}', tags)
  .replace('{{date}}', isoDateStr)

let filename = `${isoDateStr.substr(0, 10)}-${postId}.md`
fs.writeFileSync(path.join(__dirname, `../src/posts/${filename}`), str)
console.log(`${filename} created.`)
