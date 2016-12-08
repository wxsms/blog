<template>
  <section>
    <page-header title="About"></page-header>
    <div class="container-fluid" ref="container">
      <div class="row">
        <div class="col-xs-12">
          <p>
<pre><code>let me = {
  id: 9527,
  name: 'wxsm',
  gender: 'M',
  born: 1991,
  education: {
    graduated: 'CNJNU', //China Jinan University
    major: 'SE' //Software Engineering
  },
  location: 'CNZHA', //China Zhuhai
  profession: 'IT Engineer',
  interests: ['JavaScript', 'DOTA', 'Movie']
}</code></pre>
          <br/>
          <p>Blog built with vue and love. Hosted By Aliyun.</p>
          <p>* If the comment box can't be loaded, it probably blocked by <abbr title="Great Fire Wall">GFW</abbr>.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'
  import hljs from './../../util/hljsUtils'

  export default {
    components: { PageHeader },
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
