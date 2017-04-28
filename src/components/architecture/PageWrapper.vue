<template>
  <section id="app">
    <backdrop></backdrop>
    <side-nav></side-nav>
    <page></page>
  </section>
</template>

<script>
  import SideNav from './SideNav.vue'
  import Page from './Page.vue'
  import Backdrop from './Backdrop.vue'

  export default {
    components: { SideNav, Page, Backdrop },
    events: {}
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  #app {
    max-width: 100vw;
    overflow: hidden;
  }
</style>
