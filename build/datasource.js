'use strict';

const fs = require('fs')
const utils = require('./utils')

const JSON_EXT = '.json'
const POSTS_PATH = './posts/'
const DIST_PATH = './dist/'
const POSTS_DIST_PATH = './dist/posts/'
const POSTS_INDEX_FILE_NAME = 'index' + JSON_EXT

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
let generateDir = function () {
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
exports.generatePosts = function () {
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
        postIndex.push({ meta: JSON.parse(JSON.stringify(post.meta)) })
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
  postIndex = postIndex.map((v, i) => {
    if (i >= 10) {
      delete v.meta.excerpt
    }
    return v
  })
  return fs.writeFileSync(POSTS_DIST_PATH + POSTS_INDEX_FILE_NAME, JSON.stringify(postIndex))
}


