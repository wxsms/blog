<template>
  <section>
    <div class="meta-block">
      <span class="text-muted">{{postDate}}</span>
    </div>
    <div class="meta-block" v-if="post.meta.categories && post.meta.categories.length">
      <span class="text-muted">/</span>
      <template v-for="(c,index) in postCategories">
        <router-link :to="'/c/'+c" class="text-muted" :title="'Category: '+c">{{c}}</router-link>
        <span class="text-muted" v-show="index!==postCategories.length-1">,&nbsp;</span>
      </template>
    </div>
    <div class="meta-block">
      <span>&nbsp;</span>
      <tag v-for="tag in postTags" :tag="tag"></tag>
    </div>
  </section>
</template>

<script>
  import Tag from './../../common/Tag.vue'

  export default {
    components: {Tag},
    props: ['post'],
    computed: {
      postDate () {
        if (this.post && this.post.meta) {
          let date = this.post.meta.date
          if (typeof date === 'string') {
            date = new Date(date)
          }
          return date.toISOString().slice(0, 10)
        }
      },
      postTags () {
        try {
          return this.post.meta.tags
        } catch (e) {
          return []
        }
      },
      postCategories () {
        try {
          return this.post.meta.categories
        } catch (e) {
          return []
        }
      }
    }

  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  section {
    margin: 20px 0;
  }

  .meta-block {
    display: inline-block;
    vertical-align: center;
  }

  a.text-muted {
    color: #bbbbbb !important;
    text-decoration: none !important;
  }

  @media print {
    section {
      display: none;
    }
  }
</style>
