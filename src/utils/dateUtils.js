export default {
  getDateStrByPost (post, withYear = true) {
    try {
      let str = new Date(post.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      if (!withYear) {
        str = str.replace(/[,|/]?\s*?\d{4}\s*?[,|/]?/, '')
      }
      return str
    } catch (err) {
      return 'Invalid Date'
    }
  }
}
