<template>
  <ul class="toc-ul" v-scrollspy>
    <li v-for="h2 in data">
      <a :href="h2.href">
        <b>{{h2.label}}</b>
      </a>
      <ul v-if="h2.items && h2.items.length">
        <li v-for="h3 in h2.items">
          <a :href="h3.href">{{h3.label}}</a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
  import {scrollspy} from 'uiv'

  export default {
    props: ['data'],
    directives: {scrollspy}
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  .toc-ul {
    list-style: none;
    margin: 20px 20px;
    padding: 0;

    li {
      color: @side-nav-link-color;

      a {
        color: inherit !important;
        text-decoration: none !important;
      }

      &.active {
        color: @brand-primary !important;
      }
    }

    ul {
      list-style: none;
      margin: 0;
      padding-left: 15px;
    }
  }
</style>
