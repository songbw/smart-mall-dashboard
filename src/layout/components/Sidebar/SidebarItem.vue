<template>
  <div class="menu-wrapper">
    <template v-if="onlyOneChild && (!onlyOneChild.children || onlyOneChild.noShowingChildren) ">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <svg-icon :icon-class="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" />
          <span slot="title">{{ onlyOneChild.meta.title }}</span>
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <svg-icon :icon-class="item.meta && item.meta.icon" />
        <span slot="title">{{ item.meta.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import AppLink from './Link'

export default {
  name: 'SidebarItem',
  components: { AppLink },
  props: {
    // route object
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
      onlyOneChild: null
    }
  },
  created() {
    this.hasOneShowingChild()
  },
  methods: {
    hasOneShowingChild() {
      const showingChildren = this.item.children || []
      if (showingChildren.length === 1) {
        // When there is only one child router, the child router is displayed by default
        this.onlyOneChild = showingChildren[0]
      } else if (showingChildren.length === 0) {
        // Show parent if there are no child router to display
        this.onlyOneChild = { ...this.item, path: '', noShowingChildren: true }
      }
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
