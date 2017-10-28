const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PrerenderSpaPlugin = require('prerender-spa-plugin')
const SitemapPlugin = require('sitemap-webpack-plugin')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {indentedSyntax: true}),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.readFilesFromDirSync = function (dirname, onFileContent, onError) {
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
    });
  } catch (e) {
    if (typeof onError === 'function') {
      onError(e)
    }
  }
}

// Generate url list for pre-render
exports.generateRenderPlugins = () => {
  let staticPaths = ['/', '/a', '/g', '/t', '/c', '/q', '/p']
  let categories = []
  let tags = []
  let postIndex = fs.readFileSync(path.resolve(__dirname, '../dist/posts/index.json')).toString()
  postIndex = JSON.parse(postIndex)
  postIndex.forEach((post) => {
    if (post.categories) {
      categories = categories.concat(post.categories)
    }
    if (post.tags) {
      tags = tags.concat(post.tags)
    }
  })
  categories = [...new Set(categories)]
  tags = [...new Set(tags)]
  categories.forEach((c) => {
    staticPaths.push(`/c/${encodeURI(c)}`)
  })
  tags.forEach((t) => {
    staticPaths.push(`/t/${encodeURI(t)}`)
  })

  let ajaxPaths = []
  this.readFilesFromDirSync(path.resolve(__dirname, '../dist/posts'), (filename) => {
    if (filename === 'index.json') {
      return
    }
    ajaxPaths.push('/p/' + filename.replace('.json', ''))
  }, (err) => {
    console.error(err)
  })
  // console.log(staticPaths.length, ajaxPaths.length)
  let totalRoutes = ajaxPaths.length + staticPaths.length
  let chunkSize = 10
  let staticChunks = _.chunk(staticPaths, chunkSize)
  let ajaxChunks = _.chunk(ajaxPaths, chunkSize)
  let plugins = []
  let distPath = path.join(__dirname, '../dist')
  let progress = 0
  staticChunks.forEach(chunk => {
    // console.log('static', chunk)
    plugins.push(new PrerenderSpaPlugin(distPath, chunk, {
        navigationLocked: true,
        captureAfterTime: 2000,
        postProcessHtml (context) {
          console.log(`[PRE-RENDER] (${++progress} / ${totalRoutes}) ${context.route}`)
          return context.html
        }
      }
    ))
  })
  ajaxChunks.forEach(chunk => {
    // console.log('ajax', chunk)
    plugins.push(new PrerenderSpaPlugin(distPath, chunk, {
        navigationLocked: true,
        captureAfterElementExists: '#post-content',
        postProcessHtml (context) {
          console.log(`[PRE-RENDER] (${++progress} / ${totalRoutes}) ${context.route}`)
          return context.html
        }
      }
    ))
  })
  // site map plugin
  plugins.push(new SitemapPlugin('https://wxsm.space', [].concat(staticPaths, ajaxPaths), {
    skipGzip: true,
    changeFreq: 'weekly'
  }))
  return plugins
}
