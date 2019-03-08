var scriptLoaded = false

function mergeOption (userValue, defaultValue) {
  return typeof userValue === 'undefined' ? defaultValue : userValue
}

function appendScript () {
  if (scriptLoaded) {
    return
  }
  var script = document.createElement('script')
  script.async = true
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
  document.head.appendChild(script)
  scriptLoaded = true
}

export default function (options) {
  return {
    mounted: function () {
      options = {
        onlyInProduction: mergeOption(options.onlyInProduction, false),
        timeout: mergeOption(options.timeout, 0)
      }
      if (options.onlyInProduction && process.env.NODE_ENV !== 'production') {
        return
      }
      appendScript()
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
