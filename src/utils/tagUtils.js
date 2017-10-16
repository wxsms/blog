export default {
  getLabelClassByTagName (tag) {
    let danger = ['angular', 'error']
    let info = ['bootstrap', 'php']
    let success = ['express', 'extjs', 'node', 'mongo', 'vue']
    let primary = ['css', 'sql', 'idea', 'webpack', 'jquery', 'react']
    let warning = ['d3', 'git', 'grunt']
    if (typeof tag === 'string') {
      tag = tag.toLowerCase()
      if (danger.length && new RegExp(`(${danger.join('|')})`).test(tag)) return 'danger'
      if (info.length && new RegExp(`(${info.join('|')})`).test(tag)) return 'info'
      if (success.length && new RegExp(`(${success.join('|')})`).test(tag)) return 'success'
      if (primary.length && new RegExp(`(${primary.join('|')})`).test(tag)) return 'primary'
      if (warning.length && new RegExp(`(${warning.join('|')})`).test(tag)) return 'warning'
    }
    return 'default'
  }
}
