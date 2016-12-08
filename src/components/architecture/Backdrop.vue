<template>
  <section :class="{'show':isAsideShow}" @click="toggleAside()"></section>
</template>

<script>
  import types from '../../store/mutationTypes'

  export default {
    data () {
      return {}
    },
    computed: {
      isAsideShow () {
        return this.$store.state.asideShow
      }
    },
    methods: {
      toggleAside () {
        this.$store.commit(types.TOGGLE_ASIDE)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  section {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: none;
    z-index: 1001;
    background: rgba(0, 0, 0, .5);

    &.show {
      display: block;
    }
  }
</style>
