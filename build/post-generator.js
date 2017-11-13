const read = require('readline-sync')
const fs = require('fs')

let str = fs.readFileSync('./build/server-views/post-template.md', 'utf8')

let postTitle = read.question('Enter post title: ')
let postId = read.question('Enter post id: ')
let categories = read.question('Enter categories (separate by comma): ')
let tags = read.question('Enter tags (separate by comma): ')
let useIndex = read.keyInYN('Use index? ')
let isDraft = read.keyInYN('Is this a draft? ')
let isoDateStr = new Date().toISOString()

str = str
  .replace('{{id}}', postId)
  .replace('{{title}}', postTitle)
  .replace('{{categories}}', categories)
  .replace('{{tags}}', tags)
  .replace('{{date}}', isoDateStr)
  .replace('{{index}}', !!useIndex)
  .replace('{{draft}}', !!isDraft)

let filename = `${isoDateStr.substr(0, 10)}-${postId}.md`
fs.writeFileSync(`./posts/${filename}`, str)
console.log(`${filename} created.`)
