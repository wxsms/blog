'use strict';

const fs = require('fs')
const utils = require('./utils')
const ejs = require('ejs')

const JSON_EXT = '.json'
const POSTS_PATH = './posts/'
const DIST_PATH = './dist/'
const POSTS_DIST_PATH = './dist/posts/'
const POSTS_INDEX_FILE_NAME = 'index' + JSON_EXT
const POST_FEED_FILE_NAME = 'feed.xml'


/**
 * Marked processor
 */
let prepareMarked = () => {
  const marked = require('meta-marked')

  let renderer = new marked.Renderer();
  renderer.heading = (text, level) => {
    let escapedText = text.replace(/[ .,\/#!$%\^&*;:{}=\-_`~()]+/g, '-');
    return `<h${level}>
            <a name="${escapedText}" role="anchor">
              <span>${text}</span>
            </a>
          </h${level}>`
  }

  marked.setOptions({
    highlight: code => require('highlight.js').highlightAuto(code).value,
    renderer
  })

  return marked
}


/**
 * Before writing files into disk, need some insurance
 */
let generateDir = () => {
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


/**
 * Generate post index file (json) and save to the posts folder
 * This function should run before webpack starts
 */
exports.generatePosts = () => {
  let count = 0
  let postIndex = []
  let marked = prepareMarked()
  generateDir()
  utils.readFilesFromDirSync(POSTS_PATH, (filename, content) => {
    count++
    let post = marked(content)
    if (post.meta && !post.meta['draft']) {
      try {
        let excerptIndex = post.html.indexOf('<!--more-->')
        excerptIndex = excerptIndex >= 0 ? excerptIndex : post.html.length
        post.meta['excerpt'] = post.html.substr(0, excerptIndex);
        postIndex.push(JSON.parse(JSON.stringify(post)))
        delete post.markdown
        delete post.meta['excerpt']
        fs.writeFileSync(POSTS_DIST_PATH + post.meta.id + JSON_EXT, JSON.stringify(post))
        console.log('Generated post:', post.meta.id)
      } catch (e) {
        console.error(e)
      }
    }
  }, (err) => {
    console.error(err)
  })
  console.log('Generated post index:', postIndex.length, '/', count, 'success.')
  postIndex.sort((a, b) => {
    let _a = new Date(a.meta.date).getTime()
    let _b = new Date(b.meta.date).getTime()
    return _b - _a
  })

  // generate feed
  let data = {
    title: 'wxsm\'s blog',
    url: 'https://wxsm.space',
    description: 'wxsm\'s personal blog.',
    posts: postIndex
  }
  let str = fs.readFileSync('./server/feed.xml.ejs', 'utf8')
  str = ejs.render(str, data)
  fs.writeFileSync(DIST_PATH + POST_FEED_FILE_NAME, str)

  postIndex = postIndex.map((v, i) => {
    delete v.html
    delete v.markdown
    if (i >= 10) {
      delete v.meta.excerpt
    }
    return v
  })
  return fs.writeFileSync(POSTS_DIST_PATH + POSTS_INDEX_FILE_NAME, JSON.stringify(postIndex))
}


