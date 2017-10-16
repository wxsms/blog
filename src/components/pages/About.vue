<template>
  <section>
    <page-header title="About"></page-header>
    <div class="container-fluid" ref="container">
      <div class="row">
        <div class="col-xs-12">
          <pre><code>let me = {
  id: 9527,
  name: 'wxsm',
  gender: 'M',
  born: 1991,
  graduated: 'JNU, China',
  location: 'Zhuhai, China',
  profession: 'IT Engineer',
  interests: ['JavaScript', 'DOTA', 'Movie']
  contact: {
    mail: 'edisond#qq.com', // Replace '#' as '@'
    github: 'https://github.com/wxsms',
    steam: 'http://steamcommunity.com/id/wxsm/',
    zhihu: 'https://www.zhihu.com/people/wxsm'
  }
}</code></pre>
          <br/>
          <p>
            <span>Project:</span>
            <a href="https://github.com/wxsms/wxsms.github.io" rel="nofollow">
              https://github.com/wxsms/wxsms.github.io
            </a>
          </p>
          <p>
            <span>Base on</span>
            <a href="https://vuejs.org/" rel="nofollow">Vue.js</a>
            <span>&</span>
            <a href="https://webpack.github.io/" rel="nofollow">webpack</a>
            <span>Hosted by</span>
            <a href="https://pages.github.com/" rel="nofollow">Github Pages</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'
  import hljs from '../../utils/hljsUtils'

  export default {
    components: {PageHeader},
    mounted () {
      let blocks = this.$refs.container.querySelectorAll('pre code')
      for (let i = 0; i < blocks.length; i++) {
        hljs.highlightBlock(blocks[i])
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
