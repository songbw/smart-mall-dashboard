<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noredirect'||index===levelList.length-1"
              class="no-redirect">{{ generateTitle(item.meta) }}</span>
        <router-link v-else :to="item.redirect||item.path">{{ generateTitle(item.meta) }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
  export default {
    data() {
      return {
        levelList: null
      }
    },
    watch: {
      $route() {
        this.getBreadcrumb()
      }
    },
    created() {
      this.getBreadcrumb()
    },
    methods: {
      getBreadcrumb() {
        let matched = this.$route.matched.filter(item => item.name)
        const first = matched[0]
        if (first && first.name !== 'home') {
          matched = [{
            path: '/home',
            meta: { header: 'Home', title_key: 'home_title' }
          }].concat(matched)
        }
        this.levelList = matched
      },
      generateTitle(meta) {
        if (meta.title_key && this.$te(meta.title_key)) {
          return this.$t(meta.title_key)
        }
        if (meta.header) {
          return meta.header
        } else {
          return ''
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 10px;

    .no-redirect {
      color: #97a8be;
      cursor: text;
    }
  }
</style>
