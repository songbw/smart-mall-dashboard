<template>
  <div v-loading="categoriesLoading" class="app-container">
    <el-form inline>
      <el-form-item>
        <el-input
          v-model="filterName"
          placeholder="输入类别名"
          style="width: 300px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
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
    <el-container>
      <el-aside>
        <el-tree :data="topCategoriesData" :props="columnProps" accordion @node-click="handleTopCategoryClick" />
      </el-aside>
      <el-container>
        <el-header class="custom-header">
          <span>{{ topCategoryHeaderTitle }}
            <el-tag v-if="currentSelectedTopCategory">{{ topCategoryShowState }}</el-tag>
          </span>
          <el-button-group>
            <el-button size="mini" @click="handleEdit(null)">编辑</el-button>
          </el-button-group>
        </el-header>
        <el-main>
          <el-table :data="currentTableCategoriesData" border>
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
            <el-table-column label="操作" align="center" width="80">
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
          <el-input v-model="topCategoryHeaderTitle" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass === '2'" label="所属父类">
          <el-input v-model="firstClassCategoryName" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="类别名称">
          <el-input v-model="dialogValue.categoryName" readonly class="dialog-form-item" />
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
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ImageUpload from '@/components/ImageUpload'

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
        sortOrder: 0,
        isShow: null
      },
      originalValue: {
        sortOrder: null,
        categoryIcon: null,
        isShow: null
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
      isAdminUser: 'isAdminUser',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading',
      categoryData: 'categories'
    }),
    noEditPermission() {
      return !this.isAdminUser
    },
    topCategoriesData() {
      const copyCatetory = src => {
        return {
          categoryId: src.categoryId,
          categoryName: src.categoryName,
          categoryClass: src.categoryClass,
          categoryIcon: src.categoryIcon,
          sortOrder: src.sortOrder,
          isShow: src.isShow === false, // false means SHOWING
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
    },
    topCategoryShowState() {
      if (this.currentSelectedTopCategory !== null) {
        return this.currentSelectedTopCategory.isShow ? '显示' : '隐藏'
      } else {
        return ''
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
          await this.$store.dispatch('categories/getAllData', { clearCache: false })
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
    async updateCategory() {
      let changed = false
      const params = {}
      if (this.dialogFormVisible) {
        this.dialogFormVisible = false
      }
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
        params.grandId = this.firstClassCategoryID
        try {
          await this.$store.dispatch('categories/updateCategoryInfo', params)
          if (params.categoryId === this.currentSelectedTopCategory.categoryId) {
            Object.keys(this.originalValue).forEach(key => {
              if (key in params) {
                this.currentSelectedTopCategory[key] = params[key]
              }
            })
          } else {
            const category = this.currentTableCategoriesData.find(item => item.categoryId === params.categoryId)
            if (category) {
              Object.keys(this.originalValue).forEach(key => {
                if (key in params) {
                  category[key] = params[key]
                }
              })
            }
          }
        } catch (e) {
          console.warn('updateCategory:' + e)
        }
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
        return secondClass.subs.map(item => {
          return Object.assign({}, item, { isShow: !item.isShow })
        })
      } else {
        return []
      }
    },
    handleRefresh() {
      this.$confirm('此操作将重新获取全部类别信息, 并需要一段时间，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.currentTableCategoriesData = []
        this.currentSelectedTopCategory = null
        this.filterName = null
        try {
          await this.$store.dispatch('categories/getAllData', { clearCache: true })
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
          this.currentTableCategoriesData = res.list.map(item => {
            return Object.assign({}, item, { isShow: !item.isShow })
          })
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
        this.dialogFormTitle = '编辑 ' + toEdit.categoryName
        this.dialogFormVisible = true
        this.dialogValue = { ...toEdit }
        this.setUpdateValue(toEdit)
      }
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.categoryIcon = url
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
