<template>
  <div v-if="!rs.hidden&&rs.children" class="menu-wrapper">

    <router-link v-if="hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow"
                 :to="resolvePath(onlyOneChild.path)">
      <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
        <svg-icon v-if="onlyOneChild.meta&&onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon" />
        <span v-if="onlyOneChild.meta&&onlyOneChild.meta.title_key"
              slot="title">{{ $t(onlyOneChild.meta.title_key) }}</span>
        <span v-else-if="onlyOneChild.meta&&onlyOneChild.meta.header" slot="title">{{ onlyOneChild.meta.header }}</span>
      </el-menu-item>
    </router-link>

    <el-submenu v-else :index="item.name||item.path">
      <template slot="title">
        <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon" />
        <span v-if="item.meta&&item.meta.title_key" slot="title">{{ $t(item.meta.title_key) }}</span>
        <span v-else-if="item.meta&&item.meta.header" slot="title">{{ item.meta.header }}</span>
      </template>

      <template v-for="child in rs.children">
        <sidebar-item
          v-if="!child.hidden && child.children && child.children.length>0"
          :is-nest="true"
          :item="child"
          :key="child.path"
          :base-path="resolvePath(child.path)"
          class="nest-menu" />

        <router-link v-else-if="!child.hidden" :to="resolvePath(child.path)" :key="child.name">
          <el-menu-item :index="resolvePath(child.path)">
            <svg-icon v-if="child.meta&&child.meta.icon" :icon-class="child.meta.icon" />
            <span v-if="child.meta&&child.meta.title_key" slot="title">{{ $t(child.meta.title_key) }}</span>
            <span v-else-if="child.meta&&child.meta.header" slot="title">{{ child.meta.header }}</span>
          </el-menu-item>
        </router-link>
      </template>
    </el-submenu>

  </div>
</template>

<script>
  import path from 'path'
  import store from '../../../../store'

  export default {
    name: 'SidebarItem',
    props: {
      // route配置json
      item: {
        type: Object,
        required: true
      },
      isNest: {
        type: Boolean,
        default: false
      },
      basePath: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        rs: null,
        onlyOneChild: null
      }
    },
    created() {
      this.rs = this.item
      const storeRoles = store.getters.roles
      if (this.rs && this.rs.name && this.rs.name === 'User') {
        this.rs.hidden = true
      }
      for (const r in storeRoles) {
        // console.log(storeRoles[r])
        if (this.rs && this.rs.name && this.rs.name === 'User') {
          if (storeRoles[r].match('user')) {
            this.rs.hidden = false
            break
          }
        }
      }
    },
    methods: {
      hasOneShowingChild(children) {
        const showingChildren = children.filter(item => {
          if (item.hidden) {
            return false
          } else {
            // temp set(will be used if only has one showing child )
            this.onlyOneChild = item
            return true
          }
        })
        if (showingChildren.length === 1) {
          return true
        }
        return false
      },
      resolvePath(...paths) {
        return path.resolve(this.basePath, ...paths)
      }
    }
  }
</script>
