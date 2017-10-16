import moment from 'moment'

export default {
  getDateStrByPost (post, withYear = true) {
    if (post && post.meta && post.meta.date) {
      let format = 'MMM-DD'
      if (withYear) {
        format += '-YYYY'
      }
      let date = moment(post.meta.date)
      return date.format(format)
    }
    return 'Invalid Date'
  }
}
