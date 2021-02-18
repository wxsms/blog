const read = require('readline-sync')
const fs = require('fs')
const path = require('path')
const pinyin = require('pinyin')
const git = require('simple-git')()

/**
 * convert title string to a slug string
 * https://stackoverflow.com/questions/1053902/how-to-convert-a-title-to-a-url-slug-in-jquery
 * @param str
 * @returns {string}
 */
function titleToSlug (str) {
  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()
  str = pinyin(str, { style: pinyin.STYLE_NORMAL }).map(v => v[0]).join('-')
  // remove accents, swap ñ for n, etc
  const from = 'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;'
  const to = 'AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------'
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
  return str
}

/**
 * get all folder names from a directory
 * https://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
 * @param source
 * @returns {[string]}
 */
function getDirectories (source) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter(v => v.isDirectory())
    .map(v => v.name)
}

(async () => {
  const postsPath = path.join(__dirname, '..', 'src', 'posts')
  const folders = getDirectories(postsPath)
  const str = fs.readFileSync(path.join(__dirname, 'templates', 'post-template.md'), 'utf8')
  const postTitle = read.question('Enter post title: ') || ''
  const postId = read.question('Enter post id (auto-generate if leave blank): ') || ''
  const tags = read.question('Enter tags (separate by comma): ') || ''
  const folderIndex = read.keyInSelect(folders, 'Which folder?')
  if (folderIndex === -1) {
    return
  }
  const folder = folders[folderIndex]
  const isoDateStr = new Date().toISOString()
  const slug = `${isoDateStr.substr(0, 10)}-${postId || titleToSlug(postTitle)}`
  const filename = `${slug}.md`
  const permalink = `/posts/${slug}.html`

  const file = str
    .replace('{{permalink}}', permalink)
    .replace('{{title}}', postTitle)
    .replace('{{tags}}', tags)
    .replace('{{date}}', isoDateStr)

  const filePath = path.join(postsPath, folder, filename)
  fs.writeFileSync(filePath, file)
  await git.add(filePath)
  console.log(`${filename} created.`)
})()
