---
permalink: '/posts/2017-10-16-difference-between-npm-dependencies-types.html
title: 'Difference Between NPM Dependencies Types'
date: 2017-10-16T07:36:52.405Z
categories: [JavaScript]
tags: [NodeJs]
sidebar: false
draft: false

---




ref: [stackoverflow](https://stackoverflow.com/questions/18875674/whats-the-difference-between-dependencies-devdependencies-and-peerdependencies)

Summary of important behavior differences:

* **`dependencies`** are installed on both:
  * `npm install` from a directory that contains `package.json`
  * `npm install $package` on any other directory
* **`devDependencies`** are:
  * also installed on `npm install` on a directory that contains `package.json`, unless you pass the `--production` flag
  * not installed on `npm install $package` on any other directory, unless you give it the `--dev` option.
  * are not installed transitively.
* **`peerDependencies`** are:
  * before 3.0: are always installed if missing, and raise an error if multiple incompatible versions of the dependency would be used by different dependencies.
  * expected starting on 3.0 (untested): give a warning if missing on `npm install`, and you have to solve the dependency yourself manually. When running, if the dependency is missing, you get an error.
* **Transitivity**:
  * `dependencies` are installed transitively: if A requires B, and B requires C, then C gets installed, otherwise B could not work, and neither would A.
  * `devDependencies` are not installed transitively. E.g. we don't need to test B to test A, so B's testing dependencies can be left out.
