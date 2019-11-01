const fs = require('fs')
const path = require('path')
const DIST_PATH = path.join(__dirname, '../src/.vuepress/dist/')

// write CNAME
fs.writeFileSync(DIST_PATH + 'CNAME', 'wxsm.space')

// write baidu verification file
fs.writeFileSync(DIST_PATH + 'baidu_verify_WrnmKQXx4O.html', 'WrnmKQXx4O')

// https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/
// If you add a .nojekyll file, your source files will be published without any modifications.
fs.writeFileSync(DIST_PATH + '.nojekyll', '')

// https://support.google.com/adsense/answer/7532444?hl=zh-Hans
fs.writeFileSync(DIST_PATH + 'ads.txt', 'google.com, pub-4714899946256166, DIRECT, f08c47fec0942fa0')
