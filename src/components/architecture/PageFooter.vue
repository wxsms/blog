<template>
  <section class="page-footer">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <p class="text-muted">
            <span>Links:</span>
            <template v-for="(friend, index) in friendLinks">
              <span v-if="index>0">&nbsp;/</span>
              <a :href="friend.href" target="_blank">{{friend.label}}</a>
            </template>
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <a href="https://wxsm.space">© {{year}} WXSM</a>
          <span>/</span>
          <a href="/feed.xml" rel="nofollow" target="_blank">FEED</a>
          <span>/</span>
          <a v-tooltip="'LICENSE'" href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow">CC BY 4.0</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import config from './../../config/global'

  export default {
    data () {
      return {
        year: new Date().getFullYear(),
        friendLinks: config.friendLinks
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
    background: @footer-bg;
    border-top: 1px solid darken(@gray, 10%);

    a {
      color: #888 !important;
      text-decoration: none !important;
    }
  }
</style>
