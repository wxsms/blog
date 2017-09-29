const path = require('path')
const fs = require('fs')
const config = require('../config')
const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSpaPlugin = require('prerender-spa-plugin')
const SitemapPlugin = require('sitemap-webpack-plugin')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env

// Generate url list for pre-render
let staticPaths = ['/', '/a', '/g', '/t', '/c', '/q', '/o/cv', '/p']
let categories = []
let tags = []
let postIndex = fs.readFileSync('./dist/posts/index.json').toString()
postIndex = JSON.parse(postIndex)
postIndex.forEach((post) => {
  if (post.meta) {
    if (post.meta.categories) categories = categories.concat(post.meta.categories)
    if (post.meta.tags) tags = tags.concat(post.meta.tags)
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
utils.readFilesFromDirSync('./dist/posts/', (filename, content) => {
  if (filename === 'index.json') return
  ajaxPaths.push('/p/' + filename.replace('.json', ''))
}, (err) => {
  console.error(err)
})

let finishedAjaxPaths = []
let processProgress = 0

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    loaders: utils.styleLoaders({sourceMap: config.build.productionSourceMap, extract: true})
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  vue: {
    loaders: utils.cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css')),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: 'head',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // This is for github pages 404 redirect, since using html vue-router mode
    // It is the same with index.html
    new HtmlWebpackPlugin({
      filename: '404.html',
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // static routes (no ajax)
    new PrerenderSpaPlugin(
      // (REQUIRED) Absolute path to static root
      path.join(__dirname, './../dist'),
      // (REQUIRED) List of routes to prerender
      staticPaths
    ),
    // ajax routes
    new PrerenderSpaPlugin(
      // (REQUIRED) Absolute path to static root
      path.join(__dirname, './../dist'),
      // (REQUIRED) List of routes to prerender
      ajaxPaths,
      // Options
      {
        captureAfterElementExists: '#post-content',
        navigationLocked: true,
        postProcessHtml: function (context) {
          finishedAjaxPaths.push(context.route)
          // console.log('Not Finish:', ajaxPaths.filter(path => finishedAjaxPaths.indexOf(path) < 0).join(', '))
          console.log(`${++processProgress}/${ajaxPaths.length} ${context.route}`)
          return context.html
        }
      }
    ),
    new SitemapPlugin('https://wxsm.space', [].concat(staticPaths, ajaxPaths), {
      skipGzip: true,
      changeFreq: 'weekly'
    })
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackConfig
