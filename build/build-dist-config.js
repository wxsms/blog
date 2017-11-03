const fs = require('fs')
const DIST_PATH = './dist/'

const ensureDir = () => {
  try {
    fs.accessSync(DIST_PATH, fs.F_OK)
  } catch (e) {
    fs.mkdirSync(DIST_PATH)
  }
}

ensureDir()

// write CNAME
fs.writeFileSync(DIST_PATH + 'CNAME', 'wxsm.space')

// https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/
// If you add a .nojekyll file, your source files will be published without any modifications.
fs.writeFileSync(DIST_PATH + '.nojekyll', '')
