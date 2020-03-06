<template>
  <div style="display:flex;justify-content: start;margin-bottom: 10px">
    <category-selection
      :first-selectable="level > 0 "
      :first-value="firstCategoryValue"
      :second-selectable="level > 1"
      :second-value="secondCategoryValue"
      :third-selectable="level > 2"
      :third-value="thirdCategoryValue"
      @changed="handleCategorySelectionChanged"
    />
    <el-button type="danger" icon="el-icon-delete" @click="handleDeleteCategory">删除</el-button>
  </div>
</template>

<script>
import CategorySelection from '@/components/CategorySelection'

export default {
  name: 'SyncCategory',
  components: { CategorySelection },
  props: {
    level: {
      type: Number,
      default: 3
    },
    categoryValue: {
      type: Number,
      default: -1
    },
    index: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null
    }
  },
  created() {
    if (this.categoryValue !== -1) {
      this.parseCategoryValue()
    }
  },
  methods: {
    parseCategoryValue() {
      switch (this.level) {
        case 3: {
          const firstValue = Number.parseInt(this.categoryValue.toString().substring(0, 2))
          this.firstCategoryValue = Number.isNaN(firstValue) ? null : firstValue
          const secondValue = Number.parseInt(this.categoryValue.toString().substring(0, 4))
          this.secondCategoryValue = Number.isNaN(secondValue) ? null : secondValue
          this.thirdCategoryValue = this.categoryValue
          break
        }
        case 2: {
          const firstValue = Number.parseInt(this.categoryValue.toString().substring(0, 2))
          this.firstCategoryValue = Number.isNaN(firstValue) ? null : firstValue
          this.secondCategoryValue = this.categoryValue
          this.thirdCategoryValue = null
          break
        }
        case 1: {
          this.firstCategoryValue = this.categoryValue
          this.secondCategoryValue = null
          this.thirdCategoryValue = null
          break
        }
      }
    },
    handleCategorySelectionChanged(category) {
      const value = Number.isSafeInteger(category.value) ? category.value : null
      switch (category.level) {
        case 1:
          this.handleFirstCategoryChanged(value)
          break
        case 2:
          this.handleSecondCategoryChanged(value)
          break
        case 3:
          this.handleThirdCategoryChanged(value)
          break
        default:
          break
      }
    },
    handleFirstCategoryChanged(value) {
      this.firstCategoryValue = value
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
      const category = this.level === 1 ? value : null
      this.$emit('categorySet', this.index, category)
    },
    handleSecondCategoryChanged(value) {
      this.secondCategoryValue = value
      this.thirdCategoryValue = null
      const category = this.level === 2 ? value : null
      this.$emit('categorySet', this.index, category)
    },
    handleThirdCategoryChanged(value) {
      this.thirdCategoryValue = value
      this.$emit('categorySet', this.index, value)
    },
    handleDeleteCategory() {
      this.$emit('categoryDelete', this.index)
    }
  }
}
</script>

