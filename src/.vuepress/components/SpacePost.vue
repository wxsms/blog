<template>
  <div class="theme-container no-sidebar">
    <main class="page">
      <div class="theme-default-content content__default">
        <space-header/>
        <div class="title">
          <h3 v-if="$page.frontmatter.date">{{format($page.frontmatter.date, 'MMM DD, YYYY')}}</h3>
          <h1>{{$page.title}}</h1>
        </div>
        <Content/>
      </div>
    </main>
  </div>
</template>

<script>
  import format from 'date-fns/format'
  import SpaceHeader from './SpaceHeader'

  export default {
    components: {SpaceHeader},
    methods: {
      format
    }
  }
</script>

<style scoped lang="less">
  .title {
    margin-top: 50px;

    h3 {
      font-size: 13px;
      color: #999;
      width: 100px;
      flex-shrink: 0;
      margin: 0 0 15px 0;
      font-weight: lighter;
    }

    h1 {
      letter-spacing: 1px;
      margin: 0 0 40px 0 !important;
      font-weight: normal;
    }
  }
</style>