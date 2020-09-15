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
      <el-form-item>
        <el-button
          type="info"
          icon="el-icon-download"
          @click="handleExport"
        >
          导出所有类别
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" style="margin-bottom: 10px">
      <el-form inline>
        <el-form-item>
          <el-select v-model="currentAppId" placeholder="请选择运营平台" clearable @change="onAppIdChanged">
            <el-option
              v-for="item in appOptions"
              :key="item.appId"
              :label="item.name"
              :value="item.appId"
            />
          </el-select>
          <span style="margin-left: 12px"><i class="el-icon-warning-outline" />选择运营平台可修改对应类别属性</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleCreateFirstClass">
            新建一级类别
          </el-button>
        </el-form-item>
      </el-form>
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
            <el-tag v-if="topCategoryShowState">{{ topCategoryShowState }}</el-tag>
          </span>
          <el-button-group v-if="currentSelectedTopCategory">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(null)">
              {{ hasEditPermission ? '编辑' : '查看' }}
            </el-button>
            <el-button
              v-if="hasEditPermission"
              type="info"
              size="mini"
              @click="handleCreateSubClass"
            >
              创建子类别
            </el-button>
            <el-button
              v-if="hasEditPermission && currentSelectedTopCategory.idate"
              :disabled="currentSelectedTopCategory.subTotal > 0"
              type="danger"
              size="mini"
              @click="handleDelete(currentSelectedTopCategory)"
            >
              删除
            </el-button>
            <el-button
              v-if="appIdSelected && topCategoryInAppId === null"
              type="warning"
              size="mini"
              @click="handleAddCategoryToAppId(currentSelectedTopCategory)"
            >
              添加到运营端
            </el-button>
            <el-button
              v-if="appIdSelected && topCategoryInAppId !== null"
              type="warning"
              size="mini"
              @click="handleDeleteCategoryFromAppId(currentSelectedTopCategory)"
            >
              从运营端移除
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
                <img
                  v-if="scope.row.categoryIcon"
                  :src="scope.row.categoryIcon"
                  class="category-image"
                  alt=""
                >
              </template>
            </el-table-column>
            <el-table-column label="显示状态" align="center" width="120">
              <template slot-scope="scope">
                <el-tag>
                  {{ appIdSelected ? scope.row.appIdData ? scope.row.showStatus : '未添加' : scope.row.showStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="类别排序" align="center" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.sortOrder }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="260">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleEdit(scope.row)">
                  {{ hasEditPermission ? '编辑' : '查看' }}
                </el-button>
                <el-button
                  v-if="hasEditPermission && scope.row.idate"
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-button
                  v-if="appIdSelected && scope.row.appIdData === null"
                  type="warning"
                  size="mini"
                  @click="handleAddCategoryToAppId(scope.row)"
                >
                  添加到运营端
                </el-button>
                <el-button
                  v-if="appIdSelected && scope.row.appIdData !== null"
                  type="warning"
                  size="mini"
                  @click="handleDeleteCategoryFromAppId(scope.row)"
                >
                  从运营端移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog
      :title="dialogFormTitle"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form
        ref="categoryForm"
        v-loading="dialogLoading"
        :model="dialogValue"
        :rules="dialogRules"
        label-position="right"
        label-width="120px"
      >
        <el-form-item v-if="dialogValue.categoryClass !== '1'" label="所属父类">
          <el-input :value="dialogParentName" readonly class="dialog-form-item" />
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
        <el-form-item v-if="dialogValue.appIdData" label="是否显示">
          <el-switch v-model="dialogValue.isShow" :disabled="!hasEditPermission" />
        </el-form-item>
        <el-form-item v-if="dialogValue.appIdData" label="类别排序">
          <el-input v-if="!hasEditPermission" v-model="dialogValue.sortOrder" readonly class="dialog-form-item" />
          <el-input-number v-else v-model="dialogValue.sortOrder" />
          <span style="font-size: 12px;margin-left: 12px">数值越小优先级越高</span>
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass === '3'" label="类别图标">
          <image-upload
            :image-url="dialogValue.categoryIcon"
            :view-only="!hasEditPermission"
            path-name="categories"
            image-width="200px"
            tip="请选择对应的类别图标文件，文件格式为JPEG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-if="hasEditPermission" @click="handleCancel">取消</el-button>
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
import { CategoryPermissions } from '@/utils/role-permissions'
import * as excel from '@/utils/Export2Excel'
import { role_vendor_name } from '@/utils/constants'

const ExportHeaders = [
  { field: 'categoryId', label: '三级类别编号' },
  { field: 'thirdFullName', label: '三级类别全称' },
  { field: 'secondFullName', label: '二级类别名称' },
  { field: 'firstFullName', label: '一级类别名称' }
]

const copyCategory = (src, appIdList) => {
  const data = {
    categoryId: src.categoryId,
    categoryName: src.categoryName,
    categoryClass: src.categoryClass,
    categoryIcon: src.categoryIcon,
    sortOrder: src.sortOrder,
    isShow: src.isShow === false, // false means SHOWING
    idate: src.idate, // null means preset
    parentId: src.parentId,
    subTotal: src.subTotal,
    appIdData: null
  }
  const appIdData = appIdList.find(item => item.categoryId === src.categoryId)
  if (appIdData) {
    data.appIdData = appIdData
    data.isShow = appIdData.isShow === false
    data.sortOrder = appIdData.sortOrder
  }
  data.showStatus = data.isShow ? '显示' : '隐藏'
  return data
}

const formatJson = (filterVal, jsonData) => {
  return jsonData.map(v => filterVal.map(j => v[j]))
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
      dialogParentName: '',
      dialogRules: {
        categoryName: [{ required: true, trigger: 'blur', validator: validateName }]
      },
      dialogValue: {
        categoryId: 0,
        parentId: 0,
        categoryClass: '0',
        categoryName: '',
        categoryIcon: null,
        sortOrder: 50,
        isShow: false,
        idate: null,
        appIdData: null
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
      dialogLoading: false,
      currentAppId: ''
    }
  },
  computed: {
    ...mapGetters({
      userRole: 'userRole',
      userPermissions: 'userPermissions',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading',
      categoryData: 'categories',
      secondCategoryData: 'secondClassCategories',
      thirdCategoryData: 'thirdClassCategories',
      appIdCategories: 'appIdCategories',
      platformAppList: 'platformAppList',
      validAppList: 'validAppList'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(CategoryPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(CategoryPermissions.update)
    },
    appOptions() {
      return this.userRole === role_vendor_name ? this.validAppList : this.platformAppList
    },
    appIdSelected() {
      return !isEmpty(this.currentAppId)
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
      if (this.categoriesLoaded && this.hasViewPermission) {
        const topList = this.categoryData.map(item => {
          const subs = item.subs.map(sub => {
            return copyCategory(sub, this.appIdCategories)
          })
          const copyItem = copyCategory(item, this.appIdCategories)
          return { ...copyItem, subs: sortBy(subs, ['sortOrder']) }
        })
        return sortBy(topList, ['sortOrder'])
      } else {
        return []
      }
    },
    topCategoryInAppId() {
      return this.currentSelectedTopCategory ? this.currentSelectedTopCategory.appIdData : null
    },
    topCategoryShowState() {
      if (this.currentSelectedTopCategory !== null && !isEmpty(this.currentAppId)) {
        return this.currentSelectedTopCategory.appIdData ? this.currentSelectedTopCategory.showStatus : '未添加'
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
              return copyCategory(sub, this.appIdCategories)
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
    this.initData()
  },
  methods: {
    async initData() {
      await this.getAppPlatformList()
      await this.getAllCategories()
    },
    async getAppPlatformList() {
      try {
        if (this.platformAppList.length === 0) {
          await this.$store.dispatch('app/getPlatformList')
        }
      } catch (e) {
        console.warn('Category get app list error:' + e)
      }
    },
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
      this.$refs.categoryForm.clearValidate()
      this.dialogFormVisible = false
    },
    handleSubmit() {
      if (!this.hasEditPermission) {
        this.handleCancel()
        return
      }
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
          const { isShow, sortOrder, ...rest } = params
          await this.$store.dispatch('categories/updateCategoryInfo', rest)
          if ((isShow !== undefined || sortOrder !== undefined) && this.dialogValue.appIdData) {
            const appIdParams = {
              id: this.dialogValue.appIdData.id,
              renterId: this.dialogValue.appIdData.renterId,
              appId: this.dialogValue.appIdData.appId,
              categoryId: params.categoryId,
              isShow: isShow !== undefined ? isShow : this.dialogValue.isShow,
              sortOrder: sortOrder !== undefined ? sortOrder : this.dialogValue.sortOrder
            }
            await this.$store.dispatch('categories/updateCategoriesInAppId', appIdParams)
            await this.handleRefreshAppIdList()
          }
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
      }).then(async () => {
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
          this.firstClassCategoryName = ''
        }).catch(() => {
          this.filterName = ''
        })
      } else {
        this.searchCategoriesData = []
      }
    },
    getParentName(category) {
      if (category.categoryClass === '3') {
        const second = this.secondCategoryData.find(item => item.categoryId === category.parentId)
        if (second) {
          const first = this.categoryData.find(item => item.categoryId === second.parentId)
          if (first) {
            return first.categoryName + ' / ' + second.categoryName
          }
        }
      } else if (category.categoryClass === '2') {
        const first = this.categoryData.find(item => item.categoryId === category.parentId)
        if (first) {
          return first.categoryName
        }
      }
      return ''
    },
    handleEdit(category) {
      let toEdit = category
      if (toEdit === null) {
        toEdit = this.currentSelectedTopCategory
      }
      this.resetDialogValue()
      if (toEdit) {
        this.editCategory = true
        this.dialogFormTitle = '编辑 ' + toEdit.categoryName
        this.dialogValue = { ...toEdit }
        this.dialogParentName = this.getParentName(toEdit)
        this.setUpdateValue(toEdit)
        this.dialogFormVisible = true
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
    async handleRefreshAppIdList() {
      if (isEmpty(this.currentAppId)) {
        return
      }
      const appPlatform = this.platformAppList.find(item => item.appId === this.currentAppId)
      await this.$store.dispatch('categories/getCategoryDataByAppId', {
        appId: appPlatform.appId, renterId: appPlatform.renterId
      })
    },
    handleAddCategoryToAppId(category) {
      if (isEmpty(this.currentAppId)) {
        this.$message.warning('请先选择运营平台')
        return
      }
      const appPlatform = this.platformAppList.find(item => item.appId === this.currentAppId)
      this.$confirm(`是否继续将类别(${category.categoryName})加入到运营平台(${appPlatform.name})？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
        const params = [{
          renterId: appPlatform.renterId,
          appId: appPlatform.appId,
          categoryId: category.categoryId,
          sortOrder: category.sortOrder,
          isShow: 1
        }]
        await this.$store.dispatch('categories/addCategoriesToAppId', params)
        await this.handleRefreshAppIdList()
      }).catch(() => {
        console.debug('Cancel add category to app id')
      })
    },
    handleDeleteCategoryFromAppId(category) {
      if (category.appIdData) {
        const { id } = category.appIdData
        const appPlatform = this.platformAppList.find(item => item.appId === this.currentAppId)
        this.$confirm(`是否继续将类别(${category.categoryName})从运营平台(${appPlatform.name})删除？`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
          await this.$store.dispatch('categories/deleteCategoryFromAppId', { id })
          await this.handleRefreshAppIdList()
        }).catch(() => {
          console.debug('Cancel delete category from app id')
        })
      }
    },
    onAppIdCategoryClicked(category) {
      if (category.appIdData) {
        this.handleDeleteCategoryFromAppId(category)
      } else {
        this.handleAddCategoryToAppId(category)
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
      this.dialogValue.appIdData = null
    },
    handleCreateFirstClass() {
      this.resetDialogValue()
      this.editCategory = false
      this.dialogFormTitle = '新建一级类别'
      this.dialogValue.categoryClass = '1'
      this.dialogValue.idate = moment().format('YYYY-MM-DD HH:mm:ss')
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
        this.dialogParentName = this.topCategoryHeaderTitle
        this.dialogValue.parentId = this.currentSelectedTopCategory.categoryId
        this.dialogValue.idate = moment().format('YYYY-MM-DD HH:mm:ss')
        this.dialogFormVisible = true
      }
    },
    onDialogNameInput(value) {
      this.dialogValue.categoryName = trim(value)
    },
    handleExport() {
      const filename = '类别列表'
      const jsonData = this.thirdCategoryData.map(third => {
        const second = this.secondCategoryData.find(item => item.categoryId === third.parentId)
        const first = second ? this.categoryData.find(item => item.categoryId === second.parentId) : null
        let firstFullName = ''
        let secondFullName = ''
        let thirdFullName = third.categoryName
        if (second && first) {
          firstFullName = first.categoryName
          secondFullName = `${first.categoryName}/${second.categoryName}`
          thirdFullName = `${first.categoryName}/${second.categoryName}/${third.categoryName}`
        }
        return { ...third, firstFullName, secondFullName, thirdFullName }
      })
      const tHeaders = ExportHeaders.map(header => header.label)
      const tFields = ExportHeaders.map(header => header.field)
      const data = formatJson(tFields, jsonData)
      excel.export_json_to_excel({
        header: tHeaders,
        data,
        filename
      })
    },
    onAppIdChanged(val) {
      this.topCategoryHeaderTitle = ''
      this.currentSelectedTopCategory = null
      this.firstClassCategoryName = ''
      if (val) {
        this.handleRefreshAppIdList()
      } else {
        this.$store.commit('categories/SET_APP_ID_LIST', [])
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
  width: 80%;
}

.category-image {
  object-fit: contain;
  width: 100px;
  height: 100px;
}
</style>
