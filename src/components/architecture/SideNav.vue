<template>
  <aside :class="{'show':isAsideShow}">
    <div class="brand">
      <h4 @click="toggleAside(false)" class="brand-link">
        <router-link to="/">wxsm's space</router-link>
      </h4>
      <div class="brand-search-btn">
        <div @click="toggleAside(false)">
          <router-link to="/q" class="btn btn-link">
            <i class="glyphicon glyphicon-search"></i>
          </router-link>
        </div>
      </div>
    </div>
    <ul class="nav nav-pills nav-stacked" role="tablist">
      <li role="presentation" v-for="item in asideItems" @click="toggleAside(false)">
        <router-link :to="item.path" class="btn btn-link">{{item.label}}</router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
  import types from '../../store/mutationTypes'
  import Logo from './../common/Logo.vue'

  export default {
    components: { Logo },
    data () {
      return {}
    },
    computed: {
      isAsideShow () {
        return this.$store.state.asideShow
      },
      asideItems () {
        return this.$store.state.asideItems
      }
    },
    methods: {
      toggleAside (show) {
        this.$store.commit(types.TOGGLE_ASIDE, show)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  aside {
    position: fixed;
    left: 0;
    top: 0;
    width: @side-nav-width;
    height: 100vh;
    flex-shrink: 0;
    overflow-y: auto;
    box-shadow: 0 0 3px rgba(0, 0, 0, .35), 0 2px 2px rgba(0, 0, 0, .2);
    z-index: 5;
    background: @aside-bg;

    .brand {
      padding: 0 15px;
      height: @brand-height;
      display: flex;
      align-items: center;
      border-bottom: 1px solid darken(@gray, 10%);

      .logo {
        flex-basis: 40px;
        margin-right: 10px;
      }

      .brand-search-btn {
        flex-basis: 50px;
        text-align: right;
      }

      .brand-link {
        margin: 0;
        font-weight: normal;
        flex: 1;

        a {
          color: @site-color;
          text-decoration: none !important;
        }
      }
    }

    .nav {
      li {
        margin: 0;

        a {
          color: @site-color;
          transition: all .3s ease-in-out;
          text-align: left;
          text-transform: none;

          &.router-link-active {
            background: @gray;
            box-shadow: inset -5px 0 0 darken(@gray, 20%);
          }

          &:hover {
            background: @gray;
          }
        }
      }
    }
  }

  @media (max-width: @screen-xs-max) {
    aside {
      left: -275px;
      transition: left .3s ease-in-out;

      &.show {
        left: 0;
        z-index: 1002;
      }
    }
  }
</style>
