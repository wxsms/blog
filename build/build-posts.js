const fs = require('fs')
const utils = require('./utils')
const ejs = require('ejs')
const chalk = require('chalk')
const yamlFront = require('yaml-front-matter')
const MarkdownIt = require('markdown-it')
const hljs = require('highlight.js')

const JSON_EXT = '.json'
const POSTS_PATH = './posts/'
const DIST_PATH = './dist/'
const POSTS_DIST_PATH = './dist/posts/'
const POSTS_INDEX_FILE_NAME = 'index' + JSON_EXT
const POST_FEED_FILE_NAME = 'feed.xml'
const EXCERPT_REGEX = /([\s\S]*)<!--[\s]*?more[\s]*?-->/i

const ensureDir = () => {
  try {
    fs.accessSync(POSTS_PATH, fs.F_OK)
  } catch (e) {
    fs.mkdirSync(POSTS_PATH)
  }
  try {
    fs.accessSync(DIST_PATH, fs.F_OK)
  } catch (e) {
    fs.mkdirSync(DIST_PATH)
  }
  try {
    fs.accessSync(POSTS_DIST_PATH, fs.F_OK)
  } catch (e) {
    fs.mkdirSync(POSTS_DIST_PATH)
  }
}

let count = 0
let postIndex = []
let md = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {
      }
    }
    return '' // use external default escaping
  }
})
md.use(require('markdown-it-anchor'), {
  permalink: true,
  permalinkSymbol: '&#128279;'
})

ensureDir()

utils.readFilesFromDirSync(POSTS_PATH, (filename, content) => {
  count++
  let post = yamlFront.loadFront(content)
  post.html = md.render(post['__content'])
  delete post['__content']
  // console.log(post)
  if (post['draft']) {
    return
  }
  try {
    let excerpt = EXCERPT_REGEX.exec(post.html)
    if (excerpt) {
      post.excerpt = excerpt[1]
    } else {
      post.excerpt = post.html
      post.full = true
    }
    postIndex.push(Object.assign({}, post))
    delete post.excerpt
    fs.writeFileSync(POSTS_DIST_PATH + post.id + JSON_EXT, JSON.stringify(post))
  } catch (e) {
    console.error(e)
  }
}, (err) => {
  console.error(err)
})

console.log(chalk.bold.green(`[Generate Posts] (${postIndex.length} / ${count}) success.`))

// sort post index by date desc
postIndex.sort((a, b) => b.date - a.date)

// generate feed
let data = {
  title: 'wxsm\'s blog',
  url: 'https://wxsm.space',
  description: 'wxsm\'s personal blog.',
  posts: postIndex
}
let str = fs.readFileSync('./build/server-views/feed.xml.ejs', 'utf8')
str = ejs.render(str, data)
fs.writeFileSync(DIST_PATH + POST_FEED_FILE_NAME, str)

postIndex = postIndex.map((v, i) => {
  delete v.html
  if (i >= 10) {
    delete v.excerpt
  }
  return v
})
fs.writeFileSync(POSTS_DIST_PATH + POSTS_INDEX_FILE_NAME, JSON.stringify(postIndex))

