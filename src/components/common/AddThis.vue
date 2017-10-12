<template>
  <div class="addthis_inline_share_toolbox"></div>
</template>

<script>
  export default {
    mounted () {
      if (window.addthis) {
        this.reset()
      }
    },
    methods: {
      reset () {
        try {
          window.addthis.layers.refresh()
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
