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
    components: {SideNav, Page, Backdrop}
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "./../../assets/css/variables";

  #app {
    max-width: 100%;
    overflow: hidden;
  }

  #nprogress .bar {
    background: @blue !important;
  }
</style>
