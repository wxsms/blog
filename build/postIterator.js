/**
 * Use this file to iterate posts and do anything needed.
 */


const fs = require('fs');
const yamlFront = require('yaml-front-matter');

function readFilesFromDirSync (dirname, onFileContent, onError) {
  try {
    let fileNames = fs.readdirSync(dirname);
    fileNames.forEach(filename => {
      if (!filename.endsWith('.md')) {
        return;
      }
      let content = fs.readFileSync(dirname + '/' + filename, 'utf-8');
      try {
        if (typeof onFileContent === 'function') {
          onFileContent(filename, content);
        }
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e);
        }
      }
    });
  } catch (e) {
    if (typeof onError === 'function') {
      onError(e);
    }
  }
}

const base = '../src/posts/';

readFilesFromDirSync(base, (filename, content) => {
  if (filename === 'README.md') {
    return;
  }
  let _content = content.replace(/(permalink:.+)/, '');
  const [year, month, date, ...slugArr] = filename.replace('.md', '').split('-');
  const slug = slugArr.join('-');
  console.log(year, slug);
  fs.writeFileSync(base + filename, _content);
  if (!fs.existsSync(base + year)) {
    fs.mkdirSync(base + year, { recursive: true });
  }
  if (!fs.existsSync(base + year + '/' + slug)) {
    fs.mkdirSync(base + year + '/' + slug);
  }

  fs.copyFileSync(base + filename, base + year + '/' + slug + '/' + 'index.md')
  fs.unlinkSync(base + filename)
  // console.log(_content)
}, (err) => {
  console.error(err);
});

