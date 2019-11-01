const read = require('readline-sync')
const fs = require('fs')
const path = require('path')

let str = fs.readFileSync(path.join(__dirname, 'server-views/post-template.md'), 'utf8')

const postTitle = read.question('Enter post title: ')
const postId = read.question('Enter post id: ')
const tags = read.question('Enter tags (separate by comma): ')
const folder = read.question('Which folder (tech / life, etc.): ')
const isoDateStr = new Date().toISOString()

const slug = `${isoDateStr.substr(0, 10)}-${postId}`
const filename = `${slug}.md`
const permalink = `/posts/${slug}.html`

str = str
  .replace('{{permalink}}', permalink)
  .replace('{{title}}', postTitle)
  .replace('{{tags}}', tags)
  .replace('{{date}}', isoDateStr)

fs.writeFileSync(path.join(__dirname, `../src/posts/${folder}/${filename}`), str)
console.log(`${filename} created.`)
