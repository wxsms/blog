const { writeFileSync } = require('fs')
const { join } = require('path')

function write (filename, content) {
  writeFileSync(join(__dirname, '..', 'src', '.vuepress', 'dist', filename), content)
}

// write CNAME
write('CNAME', 'wxsm.space')
// write baidu verification file
write('baidu_verify_WrnmKQXx4O.html', 'WrnmKQXx4O')
// https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/
// If you add a .nojekyll file, your source files will be published without any modifications.
write('.nojekyll', '')
// https://support.google.com/adsense/answer/7532444?hl=zh-Hans
write('ads.txt', 'google.com, pub-4714899946256166, DIRECT, f08c47fec0942fa0')
