<template>
  <section class="page-footer">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <a href="http://wxsm.space">© {{year}} WXSM</a>
          <span>/</span>
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow" target="_blank">
            <abbr title="LICENSE">CC BY 4.0</abbr>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    props: ['title'],
    data () {
      return {
        year: new Date().getFullYear()
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  .page-footer {
    flex-basis: @footer-height;
    display: flex;
    align-items: center;
    background: #263238;

    a {
      color: #fff;

      &:hover {
        color: #fff;
        text-decoration: none;
      }
    }
  }
</style>
