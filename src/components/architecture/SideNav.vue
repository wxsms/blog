<template>
  <aside :class="{'show':isAsideShow}">
    <div class="brand">
      <div class="logo" @click="toggleAside(false)">
        <router-link to="/">
          <logo></logo>
        </router-link>
      </div>
      <h4 @click="toggleAside(false)" class="brand-link">
        <router-link to="/">wxsm's space</router-link>
      </h4>
    </div>
    <ul class="nav nav-pills nav-stacked" role="tablist">
      <li role="presentation" class="search-box">
        <form @submit.prevent="doSearch()">
          <div class="form-group">
            <input type="search"
                   name="search"
                   placeholder="SEARCH POSTS..."
                   v-model="query"
                   required="required"
                   minlength="2">
            <button type="submit" class="btn btn-primary hidden"></button>
          </div>
        </form>
      </li>
      <li role="presentation" v-for="item in asideItems" @click="toggleAside(false)">
        <router-link :to="item.path" class="btn btn-link">{{item.label}}</router-link>
      </li>
    </ul>
    <div class="social-links">
      <a href="javascript:void(0)" target="_blank">
        <i class="iconfont icon-zhihu"></i>
      </a>
    </div>
  </aside>
</template>

<script>
  import types from '../../store/mutationTypes'
  import Logo from './../common/Logo.vue'

  export default {
    components: { Logo },
    data () {
      return {
        query: ''
      }
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
      },
      doSearch () {
        this.$router.push(`/q/${this.query}`)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  .search-box-placeholder-mixin {
    color: #CFD8DC;
    font-size: 12px
  }

  aside {
    position: fixed;
    left: 0;
    top: 0;
    width: @side-nav-width;
    height: 100vh;
    flex-shrink: 0;
    overflow-y: auto;
    z-index: 5;
    background: @aside-bg;
    box-shadow: 3px 0 6px rgba(0, 0, 0, 0.24);
    display: flex;
    flex-direction: column;

    .brand {
      padding: 0 15px;
      height: @brand-height;
      flex-basis: @brand-height;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid darken(@gray, 10%);

      .logo {
        flex-basis: 40px;
        margin-right: 10px;
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
      flex: 1;

      li {
        margin: 0;
        border-bottom: 1px solid rgba(207, 216, 220, 0.56);

        &.search-box {
          background: @side-nav-item-active-bg;
          box-sizing: border-box;
          box-shadow: none;
          padding: 8px;
          height: 42px;
          position: relative;

          input {
            background: #fff;
            border: none;
            border-radius: 200px;
            box-sizing: border-box;
            color: #888;
            display: inline-block;
            font-size: 14px;
            height: 26px;
            margin: 0;
            padding: 0 8px;
            width: 100%;
            outline: 0;

            &::-webkit-input-placeholder {
              .search-box-placeholder-mixin();
            }

            &::-moz-placeholder {
              .search-box-placeholder-mixin();
            }

            &:-ms-input-placeholder {
              .search-box-placeholder-mixin();
            }

            &:-moz-placeholder {
              .search-box-placeholder-mixin();
            }
          }
        }

        a {
          color: #888;
          transition: all .3s ease-in-out;
          text-align: left;
          text-transform: none;

          &.router-link-active {
            background: @side-nav-item-active-bg;
            color: @blue;
            font-weight: 600;
            box-shadow: -6px 0 0 @blue inset;
          }

          &:hover {
            background: @side-nav-item-active-bg;
          }
        }
      }
    }

    .social-links {
      flex-basis: 50px;
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 10px 15px;

      a {
        color: #888;
        text-decoration: none;

        &:hover, &:active, &:focus {
          text-decoration: none;
        }

        i {
          font-size: x-large;
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
