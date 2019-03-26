<template>
  <div class="app-container">
    <div>
      <el-form :inline="true" :model="listQuery">
        <el-form-item :label="$t('product_table_name_title')">
          <el-input v-model="listQuery.query" :placeholder="$t('product_search_input_placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('product_table_skuid_title')">
          <el-input v-model="listQuery.skuid" :placeholder="$t('product_search_skuid_placeholder')" clearable />
        </el-form-item>
      </el-form>
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="商品品牌">
          <el-input v-model="listQuery.brand" placeholder="输入品牌关键字" clearable />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="listQuery.state">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="true" :model="listQuery">
        <el-form-item :label="$t('product_table_category_title')">
          <el-select v-model="firstCategoryValue" clearable placeholder="选择一级类别" @change="handleFirstCategoryChanged">
            <el-option
              v-for="item in firstCategoryOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="secondCategoryValue" clearable placeholder="选择二级类别" @change="handleSecondCategoryChanged">
            <el-option
              v-for="item in secondCategoryOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="thirdCategoryValue" clearable placeholder="选择三级类别">
            <el-option
              v-for="item in thirdCategoryOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="true" :model="listQuery">
        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            {{ $t('product_search_title') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="productSelection.length === 0" :loading="productExporting"
                     class="filter-item" type="primary" icon="el-icon-download"
                     @click="handleExportSelection">
            导出已选{{ productSelection.length }}个商品
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="listLoading"
      ref="productsTable"
      :data="listData"
      border fit stripe highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        :selectable="productSelectable"
        type="selection"
        width="55" />
      <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_image_title')" align="center" width="200">
        <template slot-scope="scope">
          <img v-if="scope.row.image"
               :src="scope.row.prodInfo && scope.row.prodInfo.image ? scope.row.prodInfo.image : scope.row.image"
               class="image-container">
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_name_title')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_brand_title')" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.brand }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_price_title')" align="center" width="200">
        <template slot-scope="scope">
          <template v-if="scope.row.editPrice">
            <el-input v-model="scope.row.price" size="small" style="width:100px; padding-right: 10px" />
            <el-button icon="el-icon-close" size="mini" type="primary" circle
                       @click="handleCancelEditPrice(scope.row)" />
            <el-button icon="el-icon-check" size="mini" type="primary" circle
                       @click="handleConfirmEditPrice(scope.row)" />
          </template>
          <template v-else>
            <span>{{ scope.row.price }}</span>
            <el-button :disabled="couldEditProduct === false" icon="el-icon-edit" size="mini" type="primary" circle
                       @click="scope.row.editPrice=!scope.row.editPrice" />
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_ops_title')" align="center" width="100"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="warning" size="mini"
                     @click="handleEdit(scope.row)">
            {{ $t('product_table_ops_edit_title') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total"
                :page.sync="listQuery.offset" :limit.sync="listQuery.limit"
                :page-sizes="[10, 20, 40, 80]"
                @pagination="getListData" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { updateProductInfo } from '@/api/products'
  import pagination from '@/components/Pagination'

  export default {
    name: 'Product',
    components: { pagination },
    data() {
      return {
        couldEditProduct: false,
        stateOptions: [{
          value: -1,
          label: '全部'
        }, {
          value: 1,
          label: '已上架'
        }, {
          value: 0,
          label: '已下架'
        }],
        listQuery: {
          offset: 1,
          limit: 20,
          query: '',
          skuid: '',
          brand: '',
          state: -1
        },
        searchParams: {
          query: '',
          skuid: '',
          brand: '',
          categoryID: null
        },
        listLoading: false,
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null,
        rootCategorySelected: null,
        secondCategorySelected: null,
        productExporting: false,
        productSelection: []
      }
    },
    computed: {
      categoryOptions() {
        if (this.allCategoriesLoaded) {
          return this.allCategoriesOption
        } else {
          return [{
            categoryName: '正在加载类别...',
            categoryId: -1
          }]
        }
      },
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
      },
      listData: {
        get() {
          return this.productsData.map(item => {
            const newItem = Object.assign({}, item)
            if (newItem.hasOwnProperty('prodInfo') && newItem.prodInfo !== null) {
              const prodInfo = newItem.prodInfo
              if (prodInfo.hasOwnProperty('price') && prodInfo.price !== null && prodInfo.price.trim()) {
                newItem.price = prodInfo.price
              }
            }
            this.$set(newItem, 'editPrice', false)
            this.$set(newItem, 'originalPrice', newItem.price)
            return newItem
          })
        }
      },
      ...mapGetters({
        total: 'productsNum',
        productsData: 'productsData',
        allCategoriesLoaded: 'allCategoriesLoaded',
        allCategoriesOption: 'allCategoriesData',
        allCategoriesInLoading: 'allCategoriesInLoading'
      })
    },
    created() {
      this.getAllProducts()
      this.getAllCategories()
    },
    methods: {
      getAllCategories() {
        if (this.allCategoriesLoaded === false && this.allCategoriesInLoading === false) {
          this.$store.dispatch('getAllCategoryData', { offset: 1, limit: 100 }).then((total) => {
            console.log(('Get Main Category ') + total)
          }).catch((error) => {
            console.log(('Get Main Category failed: ' + error))
          })
        }
      },
      isFilterChanged() {
        return this.listQuery.query !== this.searchParams.query ||
          this.listQuery.skuid !== this.searchParams.skuid ||
          this.listQuery.brand !== this.searchParams.brand ||
          this.thirdCategoryValue !== this.searchParams.categoryID
      },
      resetSearchParams() {
        this.searchParams.query = ''
        this.searchParams.skuid = ''
        this.searchParams.brand = ''
        this.searchParams.categoryID = null
      },
      getListData() {
        if (this.isFilterChanged()) {
          this.listQuery.offset = 1
        }
        this.resetSearchParams()
        if (this.listQuery.query.trim() ||
          this.listQuery.skuid.trim() ||
          this.listQuery.brand.trim() ||
          Number.isInteger(this.thirdCategoryValue)) {
          this.getFilterProducts()
        } else {
          this.getAllProducts()
        }
      },
      getAllProducts() {
        const params = {
          offset: this.listQuery.offset,
          limit: this.listQuery.limit
        }
        if (this.listQuery.state !== -1) {
          params.state = this.listQuery.state
        }
        this.listLoading = true
        this.$store.dispatch('GetProductsData', params).then(() => {
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 500)
        }).catch(() => {
          this.listLoading = false
        })
      },
      getFilterProducts() {
        const params = {}
        params.offset = this.listQuery.offset
        params.limit = this.listQuery.limit
        if (this.listQuery.skuid.trim()) {
          this.searchParams.skuid = this.listQuery.skuid
          params.skuid = this.listQuery.skuid
        } else {
          if (this.listQuery.query.trim()) {
            this.searchParams.query = this.listQuery.query
            params.query = this.listQuery.query
          }
          if (this.listQuery.brand.trim()) {
            this.searchParams.brand = this.listQuery.brand
            params.brand = this.listQuery.brand
          }
          if (Number.isInteger(this.thirdCategoryValue)) {
            this.searchParams.categoryID = this.thirdCategoryValue
            params.categoryID = this.thirdCategoryValue
          }
        }
        if (this.listQuery.state !== -1) {
          params.state = this.listQuery.state
        }
        this.listLoading = true
        this.$store.dispatch('SearchProductsData', params).then(() => {
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 500)
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleFilter() {
        this.getListData()
      },
      handleEdit(product) {
        this.$router.push({
          name: 'ProductDetail',
          params: { skuid: product.skuid }
        })
      },
      handleCancelEditPrice(row) {
        row.price = row.originalPrice
        row.editPrice = false
      },
      handleConfirmEditPrice(row) {
        if (row.price === row.originalPrice) {
          row.editPrice = false
          return
        }
        this.$confirm('是否确定修改此商品的价格？',
          this.$t('confirm_dialog_warning_title'),
          {
            confirmButtonText: this.$t('confirm_button_ok_title'),
            cancelButtonText: this.$t('confirm_button_cancel_title'),
            type: 'warning'
          }).then(() => {
          const params = {
            skuid: row.skuid,
            price: row.price
          }
          updateProductInfo(params).then(res => {
            this.$message({ message: '更新产品价格成功。', type: 'success' })
            row.originalPrice = row.price
          }).catch(() => {
            this.$message.error('更新产品信息失败！')
          })
          row.editPrice = false
        })
      },
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
      handleSelectionChange(selection) {
        this.productSelection = selection
      },
      handleExportSelection() {
        this.productExporting = true
        import('@/utils/exportToExcel').then(excel => {
          const tHeader = ['商品编码', '商品型号', '商品类别', '商品名称', '商品品牌', '商品状态', '销售价', '市场价']
          const filterVal = ['skuid', 'model', 'categoryName', 'name', 'brand', 'state', 'price', 'sprice']
          const list = this.productSelection
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '商品信息表'
          })
          this.$refs.productsTable.clearSelection()
          this.productExporting = false
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j !== 'state') {
            return v[j]
          } else {
            if (v[j] === '1') {
              return '销售中'
            } else {
              return '已下架'
            }
          }
        }))
      },
      productSelectable(row, index) {
        return this.couldEditProduct
      }
    }
  }
</script>

<style scoped>
  .image-container {
    width: 50%;
  }
</style>
