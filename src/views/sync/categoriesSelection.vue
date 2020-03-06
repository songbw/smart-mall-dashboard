<template>
  <div>
    <el-form label-width="120px">
      <el-form-item label="类别等级">
        <el-radio-group v-model="syncLevel" @change="onTypeChanged">
          <el-radio :label="3">三级类别</el-radio>
          <el-radio :label="2">二级类别</el-radio>
          <el-radio :label="1">一级类别</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否包含子类">
        <el-switch v-model="includeAllSub" :disabled="syncLevel === 3" />
      </el-form-item>
      <el-form-item label="已选类别">
        <el-button
          icon="el-icon-edit"
          type="primary"
          style="margin-bottom: 20px"
          @click="handleAddCategory"
        >
          {{ buttonLabel }}
        </el-button>
        <sync-category
          v-for="(category, index) in selectedCategories"
          :key="'category-' + index"
          :level="syncLevel"
          :category-value="category"
          :index="index"
          @categoryDelete="handleDeleteCategory"
          @categorySet="handleSetCategory"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import includes from 'lodash/includes'
import SyncCategory from './category'

export default {
  name: 'CategoriesSelection',
  components: { SyncCategory },
  props: {
    includesSub: {
      type: Boolean,
      default: false
    },
    categoryLevel: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      selectedCategories: []
    }
  },
  computed: {
    buttonLabel() {
      switch (this.syncLevel) {
        case 3:
          return '添加三级类别'
        case 2:
          return '添加二级类别'
        case 1:
          return '添加一级类别'
        default:
          return ''
      }
    },
    syncLevel: {
      get() {
        return this.categoryLevel
      },
      set(value) {
        this.$emit('level', value)
      }
    },
    includeAllSub: {
      get() {
        return this.includesSub
      },
      set(value) {
        this.$emit('sub', value)
      }
    }
  },
  methods: {
    onTypeChanged(value) {
      this.selectedCategories = []
      if (this.syncLevel === 3) this.includeAllSub = false
      this.$emit('changed', [])
    },
    handleAddCategory() {
      if (this.selectedCategories.length <= 20) {
        this.selectedCategories.push(-1)
      } else {
        this.$message.warning('一次最多同步20个商品类别！')
      }
    },
    handleSetCategory(index, value) {
      if (value) {
        if (includes(this.selectedCategories, value)) {
          this.$message.warning('此类别已添加，请选择其它类别')
        } else {
          this.selectedCategories[index] = value
        }
      } else {
        this.selectedCategories[index] = -1
      }
      this.$emit('changed', this.selectedCategories.filter(item => item !== -1))
    },
    handleDeleteCategory(index) {
      this.selectedCategories.splice(index, 1)
      this.$emit('changed', this.selectedCategories.filter(item => item !== -1))
    }
  }
}
</script>

<style scoped>

</style>
