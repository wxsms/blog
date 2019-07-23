<template>
  <div>
    <space-header/>
    <ul class="list">
      <li v-for="post in posts" :key="post.key">
        <h3>{{format(post.frontmatter.date, 'MMM DD, YYYY')}}</h3>
        <router-link :to="post.path" class="title-link">{{post.title}}</router-link>
        <!--{{post}}-->
      </li>
    </ul>
  </div>
</template>

<script>
  import SpaceHeader from './SpaceHeader'
  import format from 'date-fns/format'

  export default {
    components: { SpaceHeader },
    computed: {
      posts () {
        return this.$site.pages
          .filter(page => page.path.indexOf('/posts') === 0)
          .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
      }
    },
    methods: {
      format
    }
  }
</script>

<style scoped lang="less">
  .list {
    list-style: none;
    margin-top: 20px;

    li {
      position: relative;
      padding: 30px 0 30px;
      border-bottom: 1px solid #e6e6e6;
      display: flex;
      flex-direction: row;
      align-items: center;

      h3 {
        font-size: 13px;
        color: #999;
        margin: 0;
        width: 100px;
        flex-shrink: 0;
        font-weight: lighter;
      }

      a {
        margin-left: 30px;
        display: block;
        color: #2c3e50 !important;
        font-size: 20px;
        text-decoration: none !important;
        letter-spacing: 1px;
        font-weight: normal;
      }
    }
  }

  @media screen and (max-width: 420px) {
    .list {
      list-style: none;

      li {
        border-bottom: 1px solid #e6e6e6;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        h3 {
          font-size: 13px;
          color: #999;
          margin: 0 0 10px 0;
        }

        a {
          margin-left: 0;
        }
      }
    }
  }
</style>
