<template>
  <div>
    <ul>
      <li v-for="post in posts" :key="post.key">
        <router-link :to="post.regularPath">{{post.title}}</router-link>
        {{post}}
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    computed: {
      posts () {
        return this.$site.pages
          .filter(page => page.path !== '/')
          .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
      }
    }
  }
</script>

<style scoped>

</style>
