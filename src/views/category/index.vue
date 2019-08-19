<template>
  <div v-loading="categoriesLoading" class="app-container">
    <el-form inline @submit.prevent.native="handleFilter">
      <el-form-item>
        <el-input
          v-model="filterName"
          placeholder="输入类别名"
          style="width: 300px;"
          class="filter-item"
          clearable
          maxlength="10"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索类别
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="danger"
          icon="el-icon-refresh"
          @click="handleRefresh"
        >
          刷新所有类别
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="isAdminUser" style="margin-bottom: 10px">
      <el-button type="primary" @click="handleCreateFirstClass">
        新建一级类别
      </el-button>
    </div>
    <el-container>
      <el-aside>
        <el-tree
          :data="topCategoriesData"
          :props="columnProps"
          accordion
          @node-click="handleTopCategoryClick"
        />
      </el-aside>
      <el-container>
        <el-header class="custom-header">
          <span v-if="topCategoryHeaderTitle">
            {{ topCategoryHeaderTitle }}
            <el-tag v-if="currentSelectedTopCategory">{{ topCategoryShowState }}</el-tag>
          </span>
          <el-button-group v-if="currentSelectedTopCategory">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(null)">
              编辑
            </el-button>
            <el-button
              v-if="currentSelectedTopCategory.idate"
              type="info"
              size="mini"
              icon="el-icon-plus"
              @click="handleCreateSubClass"
            >
              创建子类别
            </el-button>
            <el-button
              v-if="currentSelectedTopCategory.idate"
              :disabled="currentSelectedTopCategory.subTotal > 0"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(currentSelectedTopCategory)"
            >
              删除
            </el-button>
          </el-button-group>
        </el-header>
        <el-main>
          <el-table :data="tableCategoriesData" border>
            <el-table-column label="类别编号" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.categoryId }}</span>
              </template>
            </el-table-column>
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
            <el-table-column label="显示状态" align="center" width="80">
              <template slot-scope="scope">
                <el-tag>{{ scope.row.isShow ? '显示' : '隐藏' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="类别排序" align="center" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.sortOrder }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="160">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button v-if="scope.row.idate" size="mini" type="danger" @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" center width="40%">
      <el-form
        ref="categoryForm"
        v-loading="dialogLoading"
        :model="dialogValue"
        :rules="dialogRules"
        label-position="right"
        label-width="160"
      >
        <el-form-item v-if="dialogValue.categoryClass === '3'" label="所属父类">
          <el-input v-model="topCategoryHeaderTitle" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass === '2'" label="所属父类">
          <el-input v-model="firstClassCategoryName" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别名称" prop="categoryName">
          <el-input
            :value="dialogValue.categoryName"
            :readonly="editCategory && dialogValue.idate === null"
            maxlength="10"
            class="dialog-form-item"
            @input="onDialogNameInput"
          />
        </el-form-item>
        <el-form-item label="类别级别">
          <el-input v-model="dialogValue.categoryClass" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="是否显示">
          <el-switch v-model="dialogValue.isShow" :disabled="noEditPermission" />
        </el-form-item>
        <el-form-item label="类别排序">
          <el-input v-if="noEditPermission" v-model="dialogValue.sortOrder" readonly class="dialog-form-item" />
          <el-input-number v-else v-model="dialogValue.sortOrder" />
          <span style="font-size: 13px;margin-left: 10px">数值越小优先级越高</span>
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass === '3'" label="类别图标">
          <image-upload
            :image-url="dialogValue.categoryIcon"
            :view-only="noEditPermission"
            path-name="categories"
            image-width="200px"
            tip="请选择对应的类别图标文件，类型位JPEG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import trim from 'lodash/trim'
import { mapGetters } from 'vuex'
import ImageUpload from '@/components/ImageUpload'

const copyCategory = src => {
  return {
    categoryId: src.categoryId,
    categoryName: src.categoryName,
    categoryClass: src.categoryClass,
    categoryIcon: src.categoryIcon,
    sortOrder: src.sortOrder,
    isShow: src.isShow === false, // false means SHOWING
    idate: src.idate, // null means preset
    parentId: src.parentId,
    subTotal: src.subTotal
  }
}

export default {
  name: 'Categories',
  components: { ImageUpload },
  data() {
    const validateName = (rule, value, callback) => {
      if (this.dialogValue.idate !== null && isEmpty(this.dialogValue.categoryName)) {
        callback(new Error('请输入有效的类别名称'))
      } else {
        callback()
      }
    }
    return {
      dialogFormTitle: '',
      dialogFormVisible: false,
      dialogRules: {
        categoryName: [{ required: true, trigger: 'change', validator: validateName }]
      },
      dialogValue: {
        categoryId: 0,
        parentId: 0,
        categoryClass: '0',
        categoryName: '',
        categoryIcon: null,
        sortOrder: 0,
        isShow: null,
        idate: null
      },
      originalValue: {
        categoryName: null,
        sortOrder: null,
        categoryIcon: null,
        isShow: null
      },
      searchName: '',
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
      searchCategoriesData: [],
      editCategory: true,
      dialogLoading: false
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading',
      categoryData: 'categories',
      secondCategoryData: 'secondClassCategories'
    }),
    noEditPermission() {
      return !this.isAdminUser
    },
    filterName: {
      get() {
        return this.searchName
      },
      set(value) {
        this.searchName = trim(value)
      }
    },
    topCategoriesData() {
      if (this.categoriesLoaded) {
        const topList = this.categoryData.map(item => {
          const subs = item.subs.map(sub => {
            return copyCategory(sub)
          })
          const copyItem = copyCategory(item)
          return { ...copyItem, subs: sortBy(subs, ['sortOrder']) }
        })
        return sortBy(topList, ['sortOrder'])
      } else {
        return []
      }
    },
    topCategoryShowState() {
      if (this.currentSelectedTopCategory !== null) {
        return this.currentSelectedTopCategory.isShow ? '显示' : '隐藏'
      } else {
        return ''
      }
    },
    tableCategoriesData() {
      if (this.searchCategoriesData.length > 0) {
        return this.searchCategoriesData
      } else {
        const category = this.currentSelectedTopCategory
        if (category === null || category.categoryClass === '1') {
          return []
        } else {
          const second = this.secondCategoryData.find(item => item.categoryId === category.categoryId)
          if (second) {
            const subs = second.subs.map(sub => {
              return copyCategory(sub)
            })
            return sortBy(subs, ['sortOrder'])
          } else {
            return []
          }
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
          console.warn('Get Main Category failed: ' + e)
        }
      }
    },
    setUpdateValue(category) {
      Object.keys(this.originalValue).forEach(key => {
        this.originalValue[key] = category[key]
      })
    },
    handleCancel() {
      this.resetDialogValue()
      this.$refs.categoryForm.resetFields()
      this.dialogFormVisible = false
    },
    handleSubmit() {
      this.$refs.categoryForm.validate(valid => {
        if (valid) {
          if (this.editCategory) {
            this.updateCategory()
          } else {
            this.createCategory()
          }
        }
      })
    },
    async createCategory() {
      try {
        this.dialogLoading = true
        const params = {
          parentId: this.dialogValue.parentId,
          categoryName: this.dialogValue.categoryName,
          categoryClass: this.dialogValue.categoryClass,
          categoryIcon: this.dialogValue.categoryIcon,
          sortOrder: this.dialogValue.sortOrder,
          isShow: this.dialogValue.isShow
        }
        await this.$store.dispatch('categories/createCategory', params)
        this.$message.success(`创建类别${params.categoryName}成功！`)
      } catch (e) {
        console.warn('Create category error:' + e)
        this.$message.error(`创建类别失败，请稍后重试！`)
      } finally {
        this.dialogFormVisible = false
        this.dialogLoading = false
        this.resetDialogValue()
      }
    },
    async updateCategory() {
      let changed = false
      const params = {}

      Object.keys(this.originalValue).forEach(key => {
        if (this.originalValue[key] !== this.dialogValue[key]) {
          params[key] = this.dialogValue[key]
          changed = true
        }
      })
      if (changed) {
        params.categoryId = this.dialogValue.categoryId
        params.parentId = this.dialogValue.parentId
        params.categoryClass = this.dialogValue.categoryClass
        try {
          this.dialogLoading = true
          await this.$store.dispatch('categories/updateCategoryInfo', params)
          if (params.categoryId === this.currentSelectedTopCategory.categoryId) {
            Object.keys(this.originalValue).forEach(key => {
              if (key in params) {
                this.currentSelectedTopCategory[key] = params[key]
              }
            })
            this.updateTopCategoryTitle(this.currentSelectedTopCategory)
          }
        } catch (e) {
          console.warn('updateCategory:' + e)
        } finally {
          this.dialogLoading = false
        }
      }
      this.dialogFormVisible = false
      this.resetDialogValue()
    },
    handleTopCategoryClick(category) {
      this.searchCategoriesData = []
      this.currentSelectedTopCategory = category
      this.filterName = ''
      if (category.categoryClass === '1') {
        this.firstClassCategoryID = category.categoryId
      }
      this.updateTopCategoryTitle(category)
    },
    updateTopCategoryTitle(category) {
      if (category.categoryClass === '1') {
        this.topCategoryHeaderTitle = category.categoryName
        this.firstClassCategoryName = category.categoryName
      } else {
        this.topCategoryHeaderTitle = this.firstClassCategoryName + ' / ' + category.categoryName
      }
    },
    handleRefresh() {
      this.$confirm('此操作将重新获取全部类别信息, 并需要一段时间，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.currentSelectedTopCategory = null
        this.filterName = ''
        try {
          await this.$store.dispatch('categories/getAllData')
        } catch (e) {
          console.warn('Refresh Categories failed: ' + e)
        }
      }).catch(() => {
      })
    },
    handleFilter() {
      if (this.filterName !== null && this.filterName.length > 0) {
        this.$store.dispatch('categories/searchCategoryInfo', {
          offset: 1, limit: 100, query: this.filterName
        }).then((res) => {
          this.searchCategoriesData = res.list.map(item => {
            return Object.assign({}, item, { isShow: !item.isShow })
          })
          this.topCategoryHeaderTitle = ''
          this.currentSelectedTopCategory = null
        }).catch(() => {
          this.filterName = ''
        })
      } else {
        this.searchCategoriesData = []
      }
    },
    handleEdit(category) {
      let toEdit = category
      if (toEdit === null) {
        toEdit = this.currentSelectedTopCategory
      }
      if (toEdit) {
        this.editCategory = true
        this.dialogFormTitle = '编辑 ' + toEdit.categoryName
        this.dialogFormVisible = true
        this.dialogValue = { ...toEdit }
        this.setUpdateValue(toEdit)
      }
    },
    async handleDelete(category) {
      try {
        await this.$confirm('是否继续删除此类别？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        if (this.currentSelectedTopCategory &&
          this.currentSelectedTopCategory.categoryId === category.categoryId) {
          this.topCategoryHeaderTitle = ''
          this.currentSelectedTopCategory = null
        }
        await this.$store.dispatch('categories/deleteCategory', category)
        if (!isEmpty(this.filterName)) {
          this.handleFilter()
        }
      } catch (e) {
        console.warn('Delete category error:' + e)
      }
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.categoryIcon = url
    },
    resetDialogValue() {
      this.dialogValue.categoryId = null
      this.dialogValue.parentId = 0
      this.dialogValue.categoryClass = '0'
      this.dialogValue.categoryName = ''
      this.dialogValue.categoryIcon = null
      this.dialogValue.sortOrder = 50
      this.dialogValue.isShow = false
      this.dialogValue.idate = null
    },
    handleCreateFirstClass() {
      this.resetDialogValue()
      this.editCategory = false
      this.dialogFormTitle = '新建一级类别'
      this.dialogValue.categoryClass = '1'
      this.dialogValue.idate = moment()
      this.dialogFormVisible = true
    },
    handleCreateSubClass() {
      this.resetDialogValue()
      if (this.currentSelectedTopCategory) {
        this.editCategory = false
        if (this.currentSelectedTopCategory.categoryClass === '1') {
          this.dialogFormTitle = '新建二级类别'
          this.dialogValue.categoryClass = '2'
        } else {
          this.dialogFormTitle = '新建三级类别'
          this.dialogValue.categoryClass = '3'
        }
        this.dialogValue.parentId = this.currentSelectedTopCategory.categoryId
        this.dialogValue.idate = moment()
        this.dialogFormVisible = true
      }
    },
    onDialogNameInput(value) {
      this.dialogValue.categoryName = trim(value)
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
    width: 80%;
  }
</style>
