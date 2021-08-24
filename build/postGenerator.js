const read = require('readline-sync');
const fs = require('fs');
const path = require('path');
const git = require('simple-git')();

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
    .map(v => v.name);
}

(async () => {
  const now = new Date();
  const year = now.getFullYear().toString();

  const postsPath = path.join(__dirname, '..', 'src', year);
  if (!fs.existsSync(postsPath)) {
    fs.mkdirSync(postsPath);
  }

  const str = fs.readFileSync(path.join(__dirname, 'templates', 'post-template.md'), 'utf8');
  const postTitle = read.question('Enter post title: ') || '';
  const postId = read.question('Enter post id: ') || '';
  const tags = read.question('Enter tags (separate by comma): ') || '';

  const isoDateStr = new Date().toISOString();
  const slug = path.join(postsPath, postId);
  const filename = `index.md`;

  fs.mkdirSync(slug);

  const file = str
    .replace('{{title}}', postTitle)
    .replace('{{tags}}', tags)
    .replace('{{date}}', isoDateStr);

  const filePath = path.join(slug, filename);
  fs.writeFileSync(filePath, file);
  await git.add(filePath);
  console.log(`${filename} created.`);
})();
