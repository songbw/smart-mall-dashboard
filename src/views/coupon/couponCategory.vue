<template>
  <el-form v-loading="allCategoriesInLoading" :inline="true" style="margin-bottom: 10px">
    <el-form-item>
      <el-select v-model="firstCategoryValue" clearable placeholder="选择一级类别" :disabled="viewOnly"
                 @change="handleFirstCategoryChanged">
        <el-option
          v-for="item in firstCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select v-model="secondCategoryValue" clearable placeholder="选择二级类别" :disabled="viewOnly"
                 @change="handleSecondCategoryChanged">
        <el-option
          v-for="item in secondCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select v-model="thirdCategoryValue" clearable placeholder="选择三级类别" :disabled="viewOnly"
                 @change="handleThirdCategoryChanged">
        <el-option
          v-for="item in thirdCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button :disabled="viewOnly" type="danger" icon="el-icon-delete" @click="handleDeleteCategory">删除</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'CouponCategory',
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
      }
    },
    data() {
      return {
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null,
        rootCategorySelected: null,
        secondCategorySelected: null,
      }
    },
    computed: {
      ...mapGetters({
        allCategoriesLoaded: 'allCategoriesLoaded',
        allCategoriesOption: 'allCategoriesData',
        allCategoriesInLoading: 'allCategoriesInLoading'
      }),
      firstCategoryOptions: {
        get() {
          if (this.allCategoriesLoaded) {
            return this.allCategoriesOption.map(item => {
              return { categoryId: item.categoryId, categoryName: item.categoryName }
            })
          } else {
            return [{
              categoryId: -1,
              categoryName: '正在加载类别...'
            }]
          }
        }
      },
      secondCategoryOptions: {
        get() {
          if (this.allCategoriesLoaded &&
            this.rootCategorySelected !== null) {
            return this.rootCategorySelected.subs.map(item => {
              return { categoryId: item.categoryId, categoryName: item.categoryName }
            })
          } else {
            return []
          }
        }
      },
      thirdCategoryOptions: {
        get() {
          if (this.allCategoriesLoaded &&
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
      if (this.categoryValue !== -1) {
        const firstValue = Number.parseInt(this.categoryValue.toString().substring(0, 2))
        if (!Number.isNaN(firstValue)) {
          this.firstCategoryValue = firstValue
          this.handleFirstCategoryChanged(firstValue)
          const secondValue = Number.parseInt(this.categoryValue.toString().substring(0, 4))
          this.secondCategoryValue = secondValue
          this.handleSecondCategoryChanged(secondValue)
          this.thirdCategoryValue = this.categoryValue
        }
      }
    },
    methods: {
      handleFirstCategoryChanged(value) {
        if (this.allCategoriesLoaded && Number.isSafeInteger(value)) {
          this.rootCategorySelected = this.allCategoriesOption.find(category => category.categoryId === value)
        } else {
          this.rootCategorySelected = null
        }
        this.secondCategorySelected = null
        this.secondCategoryValue = null
        this.thirdCategoryValue = null
      },
      handleSecondCategoryChanged(value) {
        if (this.allCategoriesLoaded && Number.isSafeInteger(value) && this.rootCategorySelected !== null) {
          this.secondCategorySelected = this.rootCategorySelected.subs.find(category => category.categoryId === value)
        } else {
          this.secondCategorySelected = null
        }
        this.thirdCategoryValue = null
      },
      handleThirdCategoryChanged(value) {
        this.$emit('categorySet', this.index, value)
      },
      handleDeleteCategory() {
        this.$emit('categoryDelete', this.index)
      }
    }
  }
</script>

<style scoped>

</style>
