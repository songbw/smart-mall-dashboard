<template>
  <div v-loading="allCategoriesInLoading" class="app-container">
    <div class="filter-container" align="right">
      <span>
        <el-input :placeholder="$t('category_search_input_placeholder')" v-model="filterName"
                  style="width: 300px;" class="filter-item"
                  @keyup.enter.native="handleFilter" />
        <el-button class="filter-item" type="primary" icon="el-icon-search"
                   @click="handleFilter">
          {{ $t('brand_search_title') }}
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
            <el-button size="mini" @click="handleEdit(null)">{{ $t('category_button_edit_title') }}</el-button>
          </el-button-group>
        </el-header>
        <el-main>
          <el-table :data="currentTableCategoriesData" border @cell-mouse-enter="handleTableCellMouseEnter">
            <el-table-column :label="$t('category_table_name_title')">
              <template slot-scope="scope">
                <span>{{ scope.row.categoryName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('category_table_icon_title')">
              <template slot-scope="scope">
                <img v-if="scope.row.categoryIcon" :src="scope.row.categoryIcon" width="50px">
                <el-upload v-else
                           :action="uploadUrl"
                           :data="uploadData"
                           :auto-upload="true"
                           :limit="1"
                           :show-file-list="false"
                           :before-upload="handleBeforeUploadImage"
                           :on-success="handleUploadImageSuccess"
                           :on-error="handleUploadImageError"
                           list-type="picture"
                           name="file">
                  <el-popover :open-delay="1000" :content="$t('category_button_upload_tip')" trigger="hover"
                              placement="top">
                    <el-button slot="reference" size="mini" type="primary" icon="el-icon-upload" plain />
                  </el-popover>
                </el-upload>
              </template>
            </el-table-column>
            <el-table-column :label="$t('category_table_order_title')">
              <template slot-scope="scope">
                <span>{{ scope.row.sortOrder }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('category_table_ops_title')">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.row)">{{ $t('category_button_edit_title') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="dialogValue" label-position="left">
        <el-form-item v-if="dialogValue.categoryClass == 3" :label="$t('category_edit_parent_title')">
          <el-input v-model="topCategoryHeaderTitle" :disabled="true" />
        </el-form-item>
        <el-form-item v-if="dialogValue.categoryClass == 2" :label="$t('category_edit_parent_title')">
          <el-input v-model="firstClassCategoryName" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('category_table_name_title')">
          <el-input v-model="dialogValue.categoryName" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('category_table_class_title')">
          <el-input v-model="dialogValue.categoryClass" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('category_table_order_title')">
          <el-input-number v-model="dialogValue.sortOrder" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('category_table_icon_title')">
          <img v-if="dialogValue.categoryIcon" :src="dialogValue.categoryIcon" width="100px">
          <el-upload
            ref="upload"
            :action="uploadUrl"
            :data="uploadData"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUploadImage"
            :on-success="handleUploadImageSuccess"
            :on-error="handleUploadImageError"
            :on-progress="handleUploadImageProgress"
            list-type="picture"
            name="file">
            <el-button slot="trigger" size="small" type="primary">{{ $t('category_button_select_title') }}</el-button>
            <div slot="tip" class="el-upload__tip">{{ $t('category_button_select_tip') }}</div>
          </el-upload>
          <el-progress :text-inside="true" :stroke-width="18" :percentage="imageUploadPercent"
                       status="success" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('confirm_button_cancel_title') }}</el-button>
        <el-button type="primary" @click="updateCategory">
          {{ $t('confirm_button_ok_title') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Categories',
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: 'categories'
        },
        dialogFormTitle: '',
        dialogFormVisible: false,
        dialogValue: {
          categoryId: 0,
          parentId: 0,
          grandId: 0,
          categoryClass: '0',
          categoryName: undefined,
          categoryIcon: undefined,
          sortOrder: 0
        },
        updateValue: {
          categoryId: 0,
          parentId: 0,
          grandId: 0,
          categoryClass: '0',
          categoryIcon: undefined
        },
        filterName: null,
        columnProps: {
          label: 'categoryName',
          children: 'subs'
        },
        columns: [
          {
            text: this.$t('category_table_name_title'),
            value: 'categoryName'
          }
        ],
        currentSelectedTopCategory: null,
        firstClassCategoryID: 0,
        firstClassCategoryName: '',
        topCategoryHeaderTitle: '',
        currentTableCategoriesData: [],
        imageUploadPercent: 0,
        uploadingImage: false
      }
    },
    computed: {
      ...mapGetters({
        allCategoriesLoaded: 'allCategoriesLoaded',
        allCategoriesInLoading: 'allCategoriesInLoading',
        topCategoriesData: 'topTwoClassCategories'
      })
    },
    created() {
      if (this.allCategoriesLoaded === false && this.allCategoriesInLoading === false) {
        this.getAllCategories()
      }
    },
    methods: {
      getAllCategories() {
        this.$store.dispatch('getAllCategoryData', { offset: 1, limit: 100 }).then((total) => {
          console.log(('Get Main Category ') + total)
        }).catch((error) => {
          console.log(('Get Main Category failed: ' + error))
        }).finally(() => {
        })
      },
      setUpdateValue(category) {
        this.updateValue.categoryId = category.categoryId
        this.updateValue.parentId = category.parentId
        this.updateValue.categoryClass = category.categoryClass
      },
      updateCategory() {
        this.$refs.upload.submit()
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
          this.currentTableCategoriesData = this.$store.getters.thirdClassCategoriesByID(
            { parentId: category.parentId, categoryId: category.categoryId })
        }
      },
      handleFilter() {
        if (this.filterName !== null && this.filterName.length > 0) {
          this.$store.dispatch('searchCategoryDataInfo', { query: this.filterName }).then((res) => {
            this.currentTableCategoriesData = res
          }).catch(() => {
            this.filterName = null
          })
        } else {
          this.currentTableCategoriesData = []
        }
      },
      handleEdit(category) {
        if (category === null) {
          category = this.currentSelectedTopCategory
        }
        if (category) {
          this.imageUploadPercent = 0
          this.dialogFormTitle = this.$t('category_edit_title', { category: category.name })
          this.dialogFormVisible = true
          this.dialogValue = category
          this.setUpdateValue(category)
        }
      },
      handleBeforeUploadImage(file) {
        this.uploadingImage = true
        return true
      },
      handleUploadImageSuccess(res) {
        this.updateValue.categoryIcon = this.$store.getters.cosUrl + res.data.url
        this.updateValue.grandId = this.firstClassCategoryID
        this.$store.dispatch('updateCategoryInfoByID', this.updateValue).then(() => {
          if (this.dialogFormVisible) {
            setTimeout(() => {
              this.dialogFormVisible = false
            }, 500)
            this.$refs.upload.clearFiles()
          }
          this.uploadingImage = false
        }).catch((err) => {
          console.log('handleUploadImageSuccess:' + err)
        })
      },
      handleUploadImageError(res) {
        if (this.dialogFormVisible) {
          setTimeout(() => {
            this.dialogFormVisible = false
          }, 500)
          this.$refs.upload.clearFiles()
        }
        this.uploadingImage = false
      },
      handleUploadImageProgress(event) {
        this.imageUploadPercent = event.percent
      }
    }
  }
</script>

<style scoped>
  .el-container {
    border: 1px solid #eee;
  }

  .el-header {
    background-color: #d7e6fa;
    color: #333;
  }

  .el-aside {
    color: #333;
  }

  .custom-header {
    font-size: large;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
