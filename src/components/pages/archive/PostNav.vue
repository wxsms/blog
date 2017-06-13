<template>
  <section class="row" v-if="prevPost||nextPost">
    <div class="col-xs-12">
      <hr/>
    </div>
    <div class="col-md-6 text-left">
      <router-link v-if="prevPost" class="btn btn-link" :to="'/p/'+prevPost.meta.id">
        <i class="glyphicon glyphicon-menu-left"></i>
        <span>{{prevPost.meta.title}}</span>
      </router-link>
    </div>
    <div class="col-md-6 text-right">
      <router-link v-if="nextPost" class="btn btn-link" :to="'/p/'+nextPost.meta.id">
        <span>{{nextPost.meta.title}}</span>
        <i class="glyphicon glyphicon-menu-right"></i>
      </router-link>
    </div>
    <div class="col-xs-12">
      <hr/>
    </div>
  </section>
</template>

<script>
  export default {
    props: ['post'],
    computed: {
      postList () {
        return this.$store.state.postList
      },
      prevPost () {
        if (this.post && this.post.meta) {
          for (let i = 0, l = this.postList.length; i < l; i++) {
            if (this.postList[i].meta.id === this.post.meta.id) {
              return i < l - 1 ? this.postList[i + 1] : undefined
            }
          }
        }
        return undefined
      },
      nextPost () {
        if (this.post && this.post.meta) {
          for (let i = 0, l = this.postList.length; i < l; i++) {
            if (this.postList[i].meta.id === this.post.meta.id) {
              return i > 0 ? this.postList[i - 1] : undefined
            }
          }
        }
        return undefined
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @media print {
    section {
      display: none;
    }
  }
</style>
