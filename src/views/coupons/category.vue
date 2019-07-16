<template>
  <div style="display:flex;justify-content: start;margin-bottom: 10px">
    <category-selection
      :first-selectable="!viewOnly || presetFirstCategory === null"
      :first-value="presetFirstCategory || firstCategoryValue"
      :second-selectable="!viewOnly"
      :second-value="secondCategoryValue"
      :third-selectable="!viewOnly"
      :third-value="thirdCategoryValue"
      @changed="handleCategorySelectionChanged"
    />
    <el-button v-if="!viewOnly" type="danger" icon="el-icon-delete" @click="handleDeleteCategory">删除</el-button>
  </div>
</template>

<script>
import CategorySelection from '@/components/CategorySelection'

export default {
  name: 'CouponCategory',
  components: { CategorySelection },
  props: {
    viewOnly: {
      type: Boolean,
      default: true
    },
    categoryValue: {
      type: Number,
      default: -1
    },
    index: {
      type: Number,
      default: -1
    },
    presetFirstCategory: {
      type: Number,
      default: null
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
      const firstValue = Number.parseInt(this.categoryValue.toString().substring(0, 2))
      if (!Number.isNaN(firstValue)) {
        this.handleFirstCategoryChanged(firstValue)
        const secondValue = Number.parseInt(this.categoryValue.toString().substring(0, 4))
        this.handleSecondCategoryChanged(secondValue)
        this.thirdCategoryValue = this.categoryValue
      }
    }
  },
  methods: {
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
    },
    handleSecondCategoryChanged(value) {
      this.secondCategoryValue = value
      this.thirdCategoryValue = null
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

