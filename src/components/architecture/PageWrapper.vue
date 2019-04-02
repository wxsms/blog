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

  body, html {
    max-width: 100%;
    position: relative;
  }

  #app {
    max-width: 100%;
    overflow: hidden;
  }

  #nprogress .bar {
    background: @brand-primary !important;
  }

  .page {
    .page-body {
      h1, h2, h3, h4, h5, h6 {
        position: relative;

        .header-anchor {
          font-size: 80%;
          display: none;
          text-decoration: none !important;
        }

        &:hover {
          .header-anchor {
            display: inline;
          }
        }
      }

      // Add `page-header` style
      h1, h2 {
        padding-bottom: 9px;
        margin: 40px 0 20px;
        border-bottom: 1px solid #eee;
      }

      img {
        max-width: 100%;
      }
    }

    .container-fluid {
      max-width: 960px;
      margin: 0 50px;

      @media (max-width: @screen-xs-max) {
        margin: 0;
      }
    }
  }

  .archives-list {
    list-style: none;
    margin: 0;
    padding: 10px 0;
  }

  .nav-pills > li > a {
    border-radius: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    a {
      color: inherit !important;
      text-decoration: none !important;
    }
  }

  code.hljs {
    background: transparent;
  }

  pre {
    border-radius: 0;
    border: none;
    padding: 0;

    code {
      white-space: pre;
      word-wrap: normal;
      display: block;
      overflow-x: auto;
      border-radius: 0;
      border: none;
      padding: 12px !important;
    }
  }

  .label-muted {
    background-color: @gray-light;
  }

  .well.well-arrow {
    margin-bottom: 0;
    position: relative;
    border: 1px solid @site-well-border;

    &:before, &:after {
      display: block;
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      left: 10px;
      border-style: solid;
      border-width: 0 15px 12px 15px;
    }

    &:before {
      top: -12px;
      border-color: transparent transparent @site-well-border transparent;
    }

    &:after {
      top: -11px;
      border-color: transparent transparent @well-bg transparent;
    }
  }

  .icon-spin {
    animation: spinIt 1.5s infinite linear;
  }

  @keyframes spinIt {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  img + em {
    margin-top: 20px;
    margin-bottom: 10px;
    display: block;
    color: @text-muted;
  }

</style>
