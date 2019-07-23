<template>
  <div class="theme-container no-sidebar">
    <main class="page">
      <div class="theme-default-content content__default">
        <div class="title">
          <h3>{{format($page.frontmatter.date, 'MMM DD, YYYY')}}</h3>
          <h1>{{$page.title}}</h1>
        </div>
        <Content/>
      </div>
    </main>
  </div>

</template>

<script>
  import format from 'date-fns/format'

  export default {
    methods: {
      format
    }
  }
</script>

<style scoped lang="less">
  .title {
    h3 {
      font-size: 13px;
      color: #999;
      width: 100px;
      flex-shrink: 0;
      margin: 0 0 10px 0;
    }

    h1 {
      letter-spacing: 1px;
      margin-bottom: 1.5rem !important;
    }
  }
</style>