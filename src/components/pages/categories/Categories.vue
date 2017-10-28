<template>
  <section>
    <h1>Categories</h1>
    <ul>
      <li v-for="c in categories">
        <h5>
          <router-link :to="'/c/'+c.name">{{c.name}}</router-link>
          <small>({{c.num}})</small>
        </h5>
      </li>
    </ul>
  </section>
</template>

<script>
  export default {
    computed: {
      postList () {
        return this.$store.state.postList
      },
      categories () {
        let categories = []
        let nums = []
        this.postList.forEach(post => {
          try {
            post.categories.forEach(c => {
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
