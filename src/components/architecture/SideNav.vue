<template>
  <aside :class="{'show':isAsideShow}">
    <div class="brand">
      <div class="logo" @click="toggle(false)">
        <router-link to="/">
          <logo></logo>
        </router-link>
      </div>
      <h4 @click="toggle(false)" class="brand-link">
        <router-link to="/">wxsm's space</router-link>
      </h4>
    </div>
    <div class="search-container">
      <search-form :box="true" @search="toggle(false)"></search-form>
    </div>
    <div class="nav-container">
      <div class="nav-div">
        <ul class="nav nav-pills nav-stacked" role="tablist">
          <li role="presentation" v-for="item in routes" @click="toggle(false)">
            <btn type="link" :to="item.path">{{item.name}}</btn>
          </li>
        </ul>
      </div>
      <div class="toc-div" v-if="asideTocItems">
        <toc :data="asideTocItems"></toc>
      </div>
    </div>
  </aside>
</template>

<script>
  import {Btn} from 'uiv'
  import types from '../../store/mutationTypes'
  import Logo from './../common/Logo.vue'
  import SearchForm from './../common/SearchForm.vue'
  import Toc from './Toc.vue'
  import {routes} from './../../router/routes'

  export default {
    components: {Logo, SearchForm, Toc, Btn},
    data () {
      return {
        query: '',
        routes: routes.filter(route => route.meta && route.meta.nav)
      }
    },
    computed: {
      isAsideShow () {
        return this.$store.state.asideShow
      },
      asideTocItems () {
        return this.$store.state.asideToc
      }
    },
    methods: {
      toggle (show) {
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
    overflow-y: auto;
    overflow-x: hidden;
    background: @site-nav-bg;
    box-shadow: @site-nav-box-shadow;

    @media (max-width: @screen-xs-max) {
      left: 0 - @side-nav-width - 10px;
      z-index: 1002;
      transition: left .3s ease-in-out;
      box-shadow: none;

      &.show {
        left: 0;
        box-shadow: @site-nav-box-shadow;
      }
    }

    @media print {
      display: none;
    }

    .brand {
      padding: 0 15px;
      height: @site-brand-height;
      display: flex;
      align-items: center;
      border-bottom: @side-nav-item-border;

      .logo {
        flex-basis: 40px;
        margin-right: 10px;
      }

      .brand-link {
        margin: 0;
        font-weight: normal;
        flex: 1;

        a {
          color: @side-nav-link-color;
          text-decoration: none !important;
        }
      }
    }

    .search-container {
      height: 42px;
      border-bottom: @side-nav-item-border;
      background: #fff;
      box-sizing: border-box;
      box-shadow: none;
      padding: 8px 20px;
      position: relative;
    }

    .nav-container {
      position: relative;

      .nav-div {
        position: relative;
      }

      .nav {
        li {
          margin: 0;
          border-bottom: @side-nav-item-border;

          a {
            color: @side-nav-link-color;
            transition: all .3s ease-in-out;
            text-align: left;
            text-transform: none;
            padding-left: 20px;

            &.router-link-active {
              background: @side-nav-item-active-bg;
              color: @brand-primary;
              box-shadow: -6px 0 0 @brand-primary inset;
            }

            &:hover {
              background: @side-nav-item-active-bg;
            }
          }
        }
      }

      .toc-div {
        padding: 0;
        position: relative;
      }
    }
  }
</style>
