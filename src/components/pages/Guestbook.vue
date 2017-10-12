<template>
  <section>
    <page-header title="Guestbook"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <disqus></disqus>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'
  import Disqus from './../common/Disqus.vue'

  export default {
    components: { PageHeader, Disqus }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
