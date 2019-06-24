<template>
  <div v-loading="categoriesLoading" class="app-container">
    <div class="filter-container">
      <span>
        <el-input
          v-model="filterName"
          placeholder="输入类别名"
          style="width: 300px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索
        </el-button>
      </span>
    </div>
    <el-container>
      <el-aside>
        <el-tree :data="topCategoriesData" :props="columnProps" accordion @node-click="handleTopCategoryClick" />
      </el-aside>
      <el-container>
        <el-header class="custom-header">
          <span>{{ topCategoryHeaderTitle }}</span>
          <el-button-group>
            <el-button size="mini" @click="handleEdit(null)">编辑</el-button>
          </el-button-group>
        </el-header>
        <el-main>
          <el-table :data="currentTableCategoriesData" border @cell-mouse-enter="handleTableCellMouseEnter">
            <el-table-column label="类别名称" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.categoryName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类别图标" align="center">
              <template slot-scope="scope">
                <el-image
                  v-if="scope.row.categoryIcon"
                  :src="scope.row.categoryIcon"
                  fit="contain"
                  style="width: 100px; height: 100px"
                  lazy
                />
              </template>
            </el-table-column>
            <el-table-column label="类别排序" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.sortOrder }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" center width="40%">
      <el-form ref="dataForm" :model="dialogValue" label-position="right" label-width="160">
        <el-form-item v-if="dialogValue.categoryClass === '3'" label="所属父类">
          <el-input v-model="topCategoryHeaderTitle" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass === '2'" label="所属父类">
          <el-input v-model="firstClassCategoryName" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别名称">
          <el-input v-model="dialogValue.categoryName" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别级别">
          <el-input v-model="dialogValue.categoryClass" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别排序">
          <el-input v-if="noEditPermission" v-model="dialogValue.sortOrder" readonly class="dialog-form-item" />
          <el-input-number v-else v-model="dialogValue.sortOrder" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别图标">
          <image-upload
            :image-url="dialogValue.categoryIcon"
            :view-only="noEditPermission"
            path-name="categories"
            image-width="200px"
            tip="请选择对应的类别文件，类型位JPG或PNG"
            @success="handleUploadImageSuccess"
            @failed="handleUploadImageFailed"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ImageUpload from '@/components/ImageUpload'
import {
  role_admin_name
} from '@/utils/constants'

export default {
  name: 'Categories',
  components: { ImageUpload },
  data() {
    return {
      dialogFormTitle: '',
      dialogFormVisible: false,
      dialogValue: {
        categoryId: 0,
        parentId: 0,
        grandId: 0,
        categoryClass: '0',
        categoryName: null,
        categoryIcon: null,
        sortOrder: 0
      },
      updateValue: {
        categoryId: 0,
        parentId: 0,
        grandId: 0,
        categoryClass: '0',
        categoryIcon: null
      },
      filterName: null,
      columnProps: {
        label: 'categoryName',
        children: 'subs'
      },
      columns: [{
        text: '类别名称',
        value: 'categoryName'
      }],
      currentSelectedTopCategory: null,
      firstClassCategoryID: 0,
      firstClassCategoryName: '',
      topCategoryHeaderTitle: '',
      currentTableCategoriesData: []
    }
  },
  computed: {
    ...mapGetters({
      userRole: 'userRole',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading',
      categoryData: 'categories'
    }),
    noEditPermission() {
      return role_admin_name !== this.userRole
    },
    topCategoriesData() {
      const copyCatetory = src => {
        return {
          categoryId: src.categoryId,
          categoryName: src.categoryName,
          categoryClass: src.categoryClass,
          categoryIcon: src.categoryIcon,
          sortOrder: src.sortOrder,
          parentId: src.parentId
        }
      }
      if (this.categoriesLoaded) {
        return this.categoryData.map(item => {
          const subs = item.subs.map(sub => {
            return copyCatetory(sub)
          })
          const copyItem = copyCatetory(item)
          return { ...copyItem, subs: subs }
        })
      } else {
        return []
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
    setUpdateValue(category) {
      this.updateValue.categoryId = category.categoryId
      this.updateValue.parentId = category.parentId
      this.updateValue.categoryClass = category.categoryClass
    },
    async updateCategory() {
      if (this.dialogFormVisible) {
        this.dialogFormVisible = false
      }
      if (this.updateValue.categoryIcon) {
        this.updateValue.grandId = this.firstClassCategoryID
        try {
          await this.$store.dispatch('categories/updateCategoryInfo', this.updateValue)
        } catch (e) {
          console.log('handleUploadImageSuccess:' + e)
        }
      }
    },
    handleTableCellMouseEnter(row, column, cell, event) {
      if (row.categoryId !== this.updateValue.categoryId && this.uploadingImage === false) {
        this.setUpdateValue(row)
      }
    },
    handleTopCategoryClick(category) {
      this.currentSelectedTopCategory = category
      this.filterName = null
      if (category.categoryClass === '1') {
        this.topCategoryHeaderTitle = category.categoryName
        this.firstClassCategoryName = category.categoryName
        this.firstClassCategoryID = category.categoryId
        this.currentTableCategoriesData = []
      } else {
        this.topCategoryHeaderTitle = this.firstClassCategoryName + ' / ' + category.categoryName
        this.currentTableCategoriesData = this.getThirdClassCategoryData({
          parentId: category.parentId,
          categoryId: category.categoryId
        })
      }
    },
    getThirdClassCategoryData(secondCategory) {
      const firstClass = this.categoryData.find(item => item.categoryId === secondCategory.parentId)
      if (firstClass) {
        const secondClass = firstClass.subs.find(item => item.categoryId === secondCategory.categoryId)
        return secondClass.subs
      } else {
        return []
      }
    },
    handleFilter() {
      if (this.filterName !== null && this.filterName.length > 0) {
        this.$store.dispatch('categories/searchCategoryInfo', {
          offset: 1, limit: 100, query: this.filterName
        }).then((res) => {
          this.currentTableCategoriesData = res.list
        }).catch(() => {
          this.filterName = null
        })
      } else {
        this.currentTableCategoriesData = []
      }
    },
    handleEdit(category) {
      let toEdit = category
      if (toEdit === null) {
        toEdit = this.currentSelectedTopCategory
      }
      if (toEdit) {
        this.imageUploadPercent = 0
        this.dialogFormTitle = '编辑 ' + toEdit.categoryName
        this.dialogFormVisible = true
        this.dialogValue = toEdit
        this.setUpdateValue(toEdit)
      }
    },
    handleUploadImageSuccess(url) {
      if (url) {
        this.updateValue.categoryIcon = url
      }
    },
    handleUploadImageFailed() {
      if (this.dialogFormVisible) {
        this.dialogFormVisible = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .custom-header {
    font-size: large;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-form-item {
    width: 50%;
  }
</style>
