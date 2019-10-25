<template>
  <section class="v-comment-container">
    <div id="vcomments"></div>
  </section>
</template>

<script>
  export default {
    name: 'Valine',
    mounted () {
      console.log('mounted')
      if (typeof window !== 'undefined') {
        const Valine = require('valine')
        window.AV = require('leancloud-storage')
        new Valine({
          el: '#vcomments',
          appId: 'PXFnynf8h6Qnpm9cIWT0BMgG-gzGzoHsz',
          appKey: 'GshYVR9jngnBj94to63biynJ',
          path: this.$route.path,
          placeholder: 'Leave a comment...',
          verify: false,
          notify: false,
          avatar: 'retro',
          lang: 'en'
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .v-comment-container {
    margin: 5rem 0;
  }

</style>
