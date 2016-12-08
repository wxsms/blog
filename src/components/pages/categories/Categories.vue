<template>
  <section>
    <page-header title="Categories"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div>
            <ul>
              <li v-for="c in categories">
                <h6>
                  <router-link :to="'/c/'+c.name">{{c.name}}</router-link>
                  <small>({{c.num}})</small>
                </h6>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'

  export default {
    components: { PageHeader },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      categories () {
        let categories = []
        let nums = []
        this.postList.forEach(post => {
          try {
            post.meta.categories.forEach(c => {
              let index = categories.indexOf(c)
              if (index < 0) {
                categories.push(c)
                nums.push(1)
              } else {
                nums[index]++
              }
            })
          } catch (e) {
            // ignore
          }
        })
        return categories.map((v, i) => {
          return {
            name: v,
            num: nums[i]
          }
        }).sort((a, b) => a.name.localeCompare(b.name))
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
