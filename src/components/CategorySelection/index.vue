<template>
  <el-form :inline="true">
    <el-form-item>
      <el-select
        :value="firstCategoryValue"
        clearable
        placeholder="选择一级类别"
        @change="handleFirstCategoryChanged"
      >
        <el-option
          v-for="item in firstCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select
        :value="secondCategoryValue"
        clearable
        placeholder="选择二级类别"
        @change="handleSecondCategoryChanged"
      >
        <el-option
          v-for="item in secondCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select
        :value="thirdCategoryValue"
        clearable
        placeholder="选择三级类别"
        @change="handleThirdCategoryChanged"
      >
        <el-option
          v-for="item in thirdCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CategorySelection',
  props: {
    firstValue: {
      type: Number,
      default: null
    },
    secondValue: {
      type: Number,
      default: null
    },
    thirdValue: {
      type: Number,
      default: null
    }
  },
  computed: {
    ...mapGetters({
      productQuery: 'productQuery',
      categoriesLoaded: 'categoriesLoaded',
      categoryData: 'categories',
      categoriesLoading: 'categoriesLoading'
    }),
    categoryOptions() {
      if (this.categoriesLoaded) {
        return this.categoryData
      } else {
        return [{
          categoryName: '正在加载类别 ...',
          categoryId: -1
        }]
      }
    },
    firstCategoryValue() {
      return Number.isSafeInteger(this.firstValue) ? this.firstValue : null
    },
    firstCategoryOptions: {
      get() {
        if (this.categoriesLoaded) {
          return this.categoryOptions.map(item => {
            return { categoryId: item.categoryId, categoryName: item.categoryName }
          })
        } else {
          return [{
            categoryId: -1,
            categoryName: '正在加载类别 ...'
          }]
        }
      }
    },
    rootCategorySelected() {
      const value = this.firstValue
      if (this.categoriesLoaded && Number.isSafeInteger(value)) {
        return this.categoryOptions.find(category => category.categoryId === value)
      } else {
        return null
      }
    },
    secondCategoryValue() {
      return Number.isSafeInteger(this.secondValue) ? this.secondValue : null
    },
    secondCategoryOptions: {
      get() {
        if (this.categoriesLoaded &&
          this.rootCategorySelected !== null) {
          return this.rootCategorySelected.subs.map(item => {
            return { categoryId: item.categoryId, categoryName: item.categoryName }
          })
        } else {
          return []
        }
      }
    },
    secondCategorySelected() {
      const value = this.secondValue
      if (this.categoriesLoaded && Number.isSafeInteger(value) && this.rootCategorySelected !== null) {
        return this.rootCategorySelected.subs.find(category => category.categoryId === value)
      } else {
        return null
      }
    },
    thirdCategoryValue() {
      return Number.isSafeInteger(this.thirdValue) ? this.thirdValue : null
    },
    thirdCategoryOptions: {
      get() {
        if (this.categoriesLoaded &&
          this.secondCategorySelected !== null) {
          return this.secondCategorySelected.subs.map(item => {
            return { categoryId: item.categoryId, categoryName: item.categoryName }
          })
        } else {
          return []
        }
      }
    }
  },
  created() {
    this.getAllCategories()
  },
  methods: {
    async getAllCategories() {
      if (this.categoriesLoaded === false && this.categoriesLoading === false) {
        try {
          await this.$store.dispatch('categories/getAllData')
        } catch (e) {
          console.log(('Get Main Category failed: ' + e))
        }
      }
    },
    handleFirstCategoryChanged(value) {
      this.$emit('changed', { level: 1, value })
    },
    handleSecondCategoryChanged(value) {
      this.$emit('changed', { level: 2, value })
    },
    handleThirdCategoryChanged(value) {
      this.$emit('changed', { level: 3, value })
    }
  }
}
</script>
