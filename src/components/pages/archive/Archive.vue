<template>
  <section>
    <h1>Archive</h1>
    <p class="text-muted">
      <b>{{list.length}}</b> posts in total.
    </p>
    <template v-for="group in listGroupedByYear">
      <h2 class="year">{{group.year}}</h2>
      <table class="archive">
        <tbody>
        <tr v-for="post in group.posts">
          <td class="date text-muted">{{post.dateStr}}</td>
          <td>
            <router-link :to="'/p/' + post.id">{{post.title}}</router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>

<script>
  import ListItem from './ArchiveListItem.vue'
  import uniq from 'lodash/uniq'
  import dateUtils from '../../../utils/dateUtils'

  export default {
    components: { ListItem },
    computed: {
      list () {
        return this.$store.state.postList
      },
      listGroupedByYear () {
        return uniq(this.list.map(post => post.date.getFullYear()))
          .map(year => {
            return {
              year: year.toString(),
              posts: this.list
                .filter(post => post.date.getFullYear() === year)
                .map(post => {
                  post.dateStr = dateUtils.getDateStrByPost(post, false)
                  return post
                })
            }
          })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";

  @date-width: 60px;

  .year {
    color: @brand-primary;
    border: none !important;
    margin: 25px 0 !important;
    padding: 0 !important;
  }

  table.archive {
    margin-left: 35px;
    border: none;
    border-left: 3px solid @gray-lighter;

    @media (max-width: @screen-xs-max) {
      margin-left: 0;
      border-left: none;
    }

    tr, td {
      border: none;
    }

    td {
      padding: 10px 0;
      vertical-align: middle;
      text-align: left;

      &.date {
        font-size: 0.8em;
        padding-left: 20px;
        width: @date-width + 20px;
        min-width: @date-width + 20px;

        @media (max-width: @screen-xs-max) {
          padding-left: 0;
          width: @date-width;
          min-width: @date-width;
        }
      }

      a {
        color: inherit !important;
        text-decoration: none !important;
      }
    }
  }
</style>
