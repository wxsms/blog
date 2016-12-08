<template>
  <section>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <a href="http://wxsm.space">© {{year}} WXSM</a>
          <span>/</span>
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow" target="_blank">
            <abbr title="LICENSE">CC BY 4.0</abbr>
          </a>
          <span>/</span>
          <a href="http://www.miitbeian.gov.cn/" rel="nofollow" title="工业和信息化部ICP/IP地址/域名信息备案管理系统" target="_blank">
            YUE ICP #15047747
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

  section {
    flex-basis: @footer-height;
    display: flex;
    align-items: center;
    border-top: 1px solid darken(@gray, 10%);

    a {
      color: @site-color;

      &:hover {
        color: @site-color;
        text-decoration: none;
      }
    }
  }
</style>
