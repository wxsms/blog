<template>
  <section class="page">
    <div class="page-body">
      <navbar></navbar>
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">
            <router-view :key="$route.path"></router-view>
          </div>
        </div>
      </div>
    </div>
    <page-footer></page-footer>
  </section>
</template>

<script>
  import Navbar from './Navbar.vue'
  import PageFooter from './PageFooter.vue'

  export default {
    components: {Navbar, PageFooter},
    methods: {
      scrollTop () {
        window.scrollTo(0, 0)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  .page {
    margin-left: @side-nav-width;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 100%;

    .page-body {
      flex: 1 0 auto;
      padding-bottom: 50px;
    }
  }

  @media (max-width: @screen-xs-max) {
    .page {
      margin-left: 0;
      margin-top: 0;
    }
  }
</style>
