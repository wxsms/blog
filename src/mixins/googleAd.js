function mergeOption (userValue, defaultValue) {
  return typeof userValue === 'undefined' ? defaultValue : userValue
}

export default function (options) {
  return {
    mounted: function () {
      options = {
        onlyInProduction: mergeOption(options.onlyInProduction, true),
        timeout: mergeOption(options.timeout, 0)
      }
      if (options.onlyInProduction && process.env.NODE_ENV !== 'production') {
        return
      }
      setTimeout(() => {
        window.adsbygoogle = window.adsbygoogle ? window.adsbygoogle : []
        // console.log(`found ${num} ad slot.`)
        for (var i = 0, num = this.$el.querySelectorAll('.adsbygoogle').length; i < num; ++i) {
          window.adsbygoogle.push({})
        }
      }, options.timeout)
    }
  }
}
