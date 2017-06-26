<template>
  <div id="disqus_thread" ref="container">
    <loading :status="0" loading-text="Loading Disqus..."></loading>
  </div>
</template>

<script>
  import config from './../../config/global'
  import Loading from './Loading.vue'

  export default {
    components: {Loading},
    mounted () {
      let self = this
      if (window.DISQUS) {
        setTimeout(() => {
          this.$refs.container.innerHTML = ''
          self.reset(window.DISQUS)
        }, 100)
        return
      }
      this.init()
    },
    data () {
      return {
        shortName: config.disqusShortName
      }
    },
    methods: {
      reset (dsq) {
        const self = this
        dsq.reset({
          reload: true,
          config: function () {
            this.page.identifier = (self.$route.path || window.location.pathname)
            this.page.url = 'https://wxsm.space' + this.page.identifier
          }
        })
      },
      init () {
        const self = this
        window.disqus_config = function () {
          let identifier = (self.$route.path || window.location.pathname)
          if (identifier.indexOf('/', identifier.length - 1) !== -1) {
            identifier = identifier.substr(0, identifier.length - 1)
          }
          this.page.identifier = identifier
          this.page.url = 'https://wxsm.space' + this.page.identifier
        }
        setTimeout(() => {
          let d = document
          let s = d.createElement('script')
          s.type = 'text/javascript'
          s.async = true
          s.setAttribute('id', 'embed-disqus')
          s.setAttribute('data-timestamp', +new Date())
          s.src = `//${this.shortName}.disqus.com/embed.js`
          let ele = d.head || d.body
          ele.appendChild(s)
        }, 0)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @media print {
    #disqus_thread {
      display: none;
    }
  }
</style>
