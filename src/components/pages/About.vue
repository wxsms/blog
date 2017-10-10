<template>
  <section>
    <page-header title="关于"></page-header>
    <div class="container-fluid" ref="container">
      <div class="row">
        <div class="col-xs-12">
          <pre><code>let me = {
  id: 9527,
  name: 'wxsm',
  gender: 'M',
  born: 1991,
  education: {
    graduated: '暨南大学',
    major: '软件工程'
  },
  location: '中国珠海',
  profession: '码农',
  interests: ['JavaScript', 'DOTA', 'Movie']
  contact: {
    mail: 'edisond#qq.com', // Replace '#' as '@'
    wechat: 'Edisondplus',
    github: 'https://github.com/wxsms'
    zhihu: 'https://www.zhihu.com/people/wxsm'
  }
}</code></pre>
          <br/>
          <p>
            <span>项目地址：</span>
            <a href="https://github.com/wxsms/wxsms.github.io" rel="nofollow">
              https://github.com/wxsms/wxsms.github.io
            </a>
          </p>
          <p>
            <span>基于</span>
            <a href="https://vuejs.org/" rel="nofollow">Vue.js</a>
            <span>与</span>
            <a href="https://webpack.github.io/" rel="nofollow">webpack</a>
            <span>搭建，</span>
            <span>由</span>
            <a href="https://pages.github.com/" rel="nofollow">Github Pages</a>
            <span>托管。</span>
          </p>
          <p>如果评论框无法显示，那估计是被墙了。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'
  import hljs from './../../util/hljsUtils'

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
