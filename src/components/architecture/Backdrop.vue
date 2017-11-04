<template>
  <transition name="fade">
    <section v-show="isAsideShow" @click="toggle"></section>
  </transition>
</template>

<script>
  import types from '../../store/mutationTypes'

  export default {
    computed: {
      isAsideShow () {
        return this.$store.state.asideShow
      }
    },
    methods: {
      toggle () {
        this.$store.commit(types.TOGGLE_ASIDE)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  section {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
    background: @modal-backdrop-bg;
    opacity: @modal-backdrop-opacity;
  }

  .fade-enter-active, .fade-leave-active {
    transition: all .3s ease-in-out;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
</style>
