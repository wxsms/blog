const danger = ['angular', 'error', 'firefox']
const info = ['bootstrap', 'php', 'egret-engine']
const success = ['express', 'extjs', 'node', 'mongo', 'vue', 'mean-stack']
const primary = ['css', 'sql', 'idea', 'webpack', 'jquery', 'react', 'ie', 'wordpress']
const warning = ['d3', 'git', 'grunt', 'babel']
const DANGER = new RegExp(`${danger.join('|')}`, 'i')
const INFO = new RegExp(`${info.join('|')}`, 'i')
const SUCCESS = new RegExp(`${success.join('|')}`, 'i')
const PRIMARY = new RegExp(`${primary.join('|')}`, 'i')
const WARNING = new RegExp(`${warning.join('|')}`, 'i')

export default {
  getLabelClassByTagName (tag) {
    if (DANGER.test(tag)) return 'danger'
    if (INFO.test(tag)) return 'info'
    if (SUCCESS.test(tag)) return 'success'
    if (PRIMARY.test(tag)) return 'primary'
    if (WARNING.test(tag)) return 'warning'
    return 'default'
  }
}
