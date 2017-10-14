[![Build Status](https://travis-ci.org/wxsms/wxsms.github.io.svg?branch=src)](https://travis-ci.org/wxsms/wxsms.github.io)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/wxsms/wxsms.github.io/src/LICENSE)

## Introduction

This is [my personal blog](https://wxsm.space).

* A typical [Vue](https://github.com/vuejs/vue) project scaffold by [official webpack template](https://github.com/vuejs-templates/webpack).
* Using [Bootstrap](https://github.com/twbs/bootstrap) CSS.
* Generated static site with no need for back-end servers.
* Desktop (IE 10+) and mobile compatible.
* Pre-render all pages for SEO with lazy-load posts.
* Integrated with [Disqus](https://disqus.com).

You can use the blog program as yours as well. Just simply remove my posts and add your own, then build it & enjoy.

> Note: `master` branch is serving generated files, checkout `src` branch for source code.

## Build Setup

``` bash
# install dependencies
npm install

# generate post by template
npm run post

# serve with hot reload at localhost:8080
npm run dev

# build posts (Markdown to HTML & generate index file)
npm run build-posts

# build for production with minification
npm run build
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## LICENSE

MIT
