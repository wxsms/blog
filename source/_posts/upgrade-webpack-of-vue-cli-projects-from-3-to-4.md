---
title: 'Upgrade Webpack of Vue-Cli Projects from 3 to 4'
date: 2020-10-10T08:59:49.288Z
tags: [webpack,vue]
---

## package.json

Change webpack related devDependencies versions:

1. `webpack` to `^4`
1. `webpack-dev-server` to `^3`
1. Add `webpack-cli`
1. Replace `extract-text-webpack-plugin` with `mini-css-extract-plugin`
1. Replace `uglifyjs-webpack-plugin` with `terser-webpack-plugin`

```json{3-7}
{
  "devDependencies": { 
    "mini-css-extract-plugin": "^1",
    "terser-webpack-plugin": "^4",
    "webpack": "^4",
    "webpack-cli": "^3",
    "webpack-dev-server": "^3"
  }
}
```

## webpack.base.conf.js

Add `mode` option.

```javascript{4}
// ...

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: path.resolve(__dirname, '../'),
  // ...
}
```

## webpack.prod.conf.js

1. Add `performance` and `optimization` option
1. Replace `ExtractTextPlugin` with `MiniCssExtractPlugin`
1. Remove `UglifyJsPlugin` and all `webpack.optimize.CommonsChunkPlugin`

```javascript{2-3,7-38,58-61}
// ...
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin');
// ...
const webpackConfig = merge(baseWebpackConfig, {
  // ...
  performance: {
    hints: false
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSPlugin({
        cssProcessorOptions: config.build.productionSourceMap
          ? { safe: true, map: { inline: false } }
          : { safe: true }
      }),
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: false,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          priority: -10
        }
      }
    }
  },
  // ...
  plugins: [
    // new UglifyJsPlugin({
    //   uglifyOptions: {
    //     compress: {
    //       warnings: false
    //       }
    //     },
    //    sourceMap: config.build.productionSourceMap,
    //    parallel: true
    //  }),
    // new ExtractTextPlugin({
    //   filename: utils.assetsPath('css/[name].[contenthash].css'),
    //   // Setting the following option to `false` will not extract CSS from codesplit chunks.
    //   // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
    //   // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
    //   // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
    //   allChunks: true,
    // }),
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].css'),
      chunkFilename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // split vendor js into its own file
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks (module) {
    //     // any required modules inside node_modules are extracted to vendor
    //     return (
    //       module.resource &&
    //       /\.js$/.test(module.resource) &&
    //       module.resource.indexOf(
    //         path.join(__dirname, '../node_modules')
    //       ) === 0
    //     )
    //   }
    // }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   minChunks: Infinity
    // }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'app',
    //   async: 'vendor-async',
    //   children: true,
    //   minChunks: 3
    // }),
  ],
  // ...
})
```

That's it, enjoy. 🎉
