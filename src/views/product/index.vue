<template>
  <div class="app-container">
    <div>
      <el-form :inline="true">
        <el-form-item label="商品名称">
          <el-input v-model="listQuery" placeholder="输入商品名" clearable />
        </el-form-item>
        <el-form-item label="商品SKU">
          <el-input v-model="listSkuId" placeholder="输入商品SKU" clearable />
        </el-form-item>
      </el-form>
      <el-form :inline="true">
        <el-form-item label="商品品牌">
          <el-input v-model="listBrand" placeholder="输入品牌关键字" clearable />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="listState">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="true">
        <el-form-item label="商品类别">
          <el-select
            v-model="firstCategoryValue"
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
            v-model="secondCategoryValue"
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
          <el-select v-model="thirdCategoryValue" clearable placeholder="选择三级类别">
            <el-option
              v-for="item in thirdCategoryOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true">
        <el-form-item>
          <el-button
            :disabled="productSelection.length === 0"
            :loading="productExporting"
            class="filter-item"
            type="primary"
            icon="el-icon-download"
            @click="handleExportSelection"
          >
            导出已选{{ productSelection.length }}个商品
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="productsTotal === 0"
            :loading="productExporting"
            class="filter-item"
            type="primary"
            icon="el-icon-download"
            @click="handleExportAllProducts"
          >
            导出全部商品
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      ref="productsTable"
      v-loading="listLoading"
      :data="listData"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="商品SKU" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品图" align="center" width="200">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.image"
            :src="getProductImage(scope.row)"
            fit="contain"
            lazy
            class="image-container"
          />
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.brand }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="200">
        <template slot-scope="scope">
          <template v-if="scope.row.editPrice">
            <el-input v-model="scope.row.price" size="small" style="width:100px; padding-right: 10px" />
            <el-button
              icon="el-icon-close"
              size="mini"
              type="primary"
              circle
              @click="handleCancelEditPrice(scope.row)"
            />
            <el-button
              icon="el-icon-check"
              size="mini"
              type="primary"
              circle
              @click="handleConfirmEditPrice(scope.row)"
            />
          </template>
          <template v-else>
            <span style="padding-right: 10px">{{ scope.row.price }}</span>
            <el-button
              v-if="couldEditProduct"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              circle
              @click="scope.row.editPrice=!scope.row.editPrice"
            />
          </template>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.state | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleView(scope.row.skuid)"
          >
            查看
          </el-button>
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row.skuid)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="productsTotal > 0"
      :total="productsTotal"
      :page.sync="listOffset"
      :limit.sync="listLimit"
      :page-sizes="[10, 20, 40, 80]"
      @pagination="getListData"
    />
    <el-dialog
      title="导出商品"
      :visible.sync="exportDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="200px"
      center
    >
      <div>
        <el-progress type="circle" :percentage="allExportProgress" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancelExportAll">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import { validateURL } from '@/utils/validate'
import { getProductListApi, updateProductInfoApi, searchProductsApi } from '@/api/products'
import Pagination from '@/components/Pagination'
import { ProductStateOptions } from '@/utils/constants'

export default {
  name: 'Product',
  components: { Pagination },
  filters: {
    productState: state => {
      const value = Number.parseInt(state)
      if (Number.isNaN(value)) {
        return state
      } else {
        const find = ProductStateOptions.find(option => option.value === value)
        return find ? find.label : state
      }
    }
  },
  data() {
    return {
      couldEditProduct: true,
      stateOptions: [{
        value: -1,
        label: '全部'
      }].concat(ProductStateOptions),
      searchParams: {
        query: '',
        skuid: '',
        brand: '',
        categoryID: null
      },
      productsTotal: 0,
      productsData: [],
      listLoading: false,
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null,
      rootCategorySelected: null,
      secondCategorySelected: null,
      productExporting: false,
      productSelection: [],
      exportDialogVisible: false,
      allExportCancelled: false,
      allExportProgress: 0
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
          categoryName: '正在加载类别...',
          categoryId: -1
        }]
      }
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
            categoryName: '正在加载类别...'
          }]
        }
      }
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
    },
    listData: {
      get() {
        return this.productsData.map(item => {
          const newItem = Object.assign({}, item)
          this.$set(newItem, 'editPrice', false)
          this.$set(newItem, 'originalPrice', newItem.price)
          return newItem
        })
      }
    },
    listOffset: {
      get() {
        return this.productQuery.offset
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { offset: value })
      }
    },
    listLimit: {
      get() {
        return this.productQuery.limit
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { limit: value })
      }
    },
    listQuery: {
      get() {
        return this.productQuery.query
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { query: value })
      }
    },
    listSkuId: {
      get() {
        return this.productQuery.skuid
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { skuid: value })
      }
    },
    listBrand: {
      get() {
        return this.productQuery.brand
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { brand: value })
      }
    },
    listState: {
      get() {
        return this.productQuery.state
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { state: value })
      }
    }
  },
  created() {
    this.getListData()
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
    isFilterChanged() {
      return this.listQuery !== this.searchParams.query ||
        this.listSkuId !== this.searchParams.skuid ||
        this.listBrand !== this.searchParams.brand ||
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
        this.listOffset = 1
      }
      this.resetSearchParams()
      const params = this.getFilterParams()
      if (params) {
        this.getFilterProducts(params)
      } else {
        this.getAllProducts()
      }
    },
    async getAllProducts() {
      const params = {
        offset: this.listOffset,
        limit: this.listLimit
      }
      if (this.listState !== -1) {
        params.state = this.listState
      }

      try {
        this.listLoading = true
        const { data } = await getProductListApi(params)
        this.productsTotal = data.result.total
        this.productsData = data.result.list
      } catch (e) {
        console.warn(`Get products list error:${e}`)
      } finally {
        this.listLoading = false
      }
    },
    getFilterParams() {
      let filter = false
      const params = {}
      params.offset = this.listOffset
      params.limit = this.listLimit
      if (!isEmpty(this.listSkuId)) {
        this.searchParams.skuid = this.listSkuId
        params.skuid = this.listSkuId
        filter = true
      } else {
        if (!isEmpty(this.listQuery)) {
          this.searchParams.query = this.listQuery
          params.query = this.listQuery
          filter = true
        }
        if (!isEmpty(this.listBrand)) {
          this.searchParams.brand = this.listBrand
          params.brand = this.listBrand
          filter = true
        }
        if (Number.isInteger(this.thirdCategoryValue)) {
          this.searchParams.categoryID = this.thirdCategoryValue
          params.categoryID = this.thirdCategoryValue
          filter = true
        }
      }
      if (this.listState !== -1) {
        params.state = this.listState
      }
      return filter ? params : null
    },
    async getFilterProducts(params) {
      try {
        this.listLoading = true
        const { data } = await searchProductsApi(params)
        this.productsTotal = data.result.total
        this.productsData = data.result.list
      } catch (e) {
        console.warn(`Get filter products list error:${e}`)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.getListData()
    },
    handleEdit(skuid) {
      this.$router.push({
        name: 'ProductDetail',
        params: { skuid }
      })
    },
    handleView(skuid) {
      this.$router.push({
        name: 'ProductDetail',
        params: { skuid }
      })
    },
    handleCancelEditPrice(row) {
      row.price = row.originalPrice
      row.editPrice = false
    },
    async handleConfirmEditPrice(row) {
      if (row.price === row.originalPrice) {
        row.editPrice = false
        return
      }
      this.$confirm('是否确定修改此商品的价格？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const params = {
            skuid: row.skuid,
            price: row.price
          }
          await updateProductInfoApi(params)
          this.$message({ message: '更新产品价格成功。', type: 'success' })
          row.originalPrice = row.price
        } catch (e) {
          console.warn(`Update product price error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleFirstCategoryChanged(value) {
      if (this.categoriesLoaded && Number.isSafeInteger(value)) {
        this.rootCategorySelected = this.categoryOptions.find(category => category.categoryId === value)
      } else {
        this.rootCategorySelected = null
      }
      this.secondCategorySelected = null
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
    },
    handleSecondCategoryChanged(value) {
      if (this.categoriesLoaded && Number.isSafeInteger(value) && this.rootCategorySelected !== null) {
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
      this.exportToFile(this.productSelection)
    },
    handleCancelExportAll() {
      this.allExportCancelled = true
      this.exportDialogVisible = false
    },
    async handleExportAllProducts() {
      this.allExportProgress = 0
      this.allExportCancelled = false
      this.exportDialogVisible = true
      const allProducts = []
      const filterParams = this.getFilterParams()
      const params = Object.assign({}, filterParams || {}, { offset: 1, limit: 100 })

      let pageTotal = 0
      let suc = true
      let res = null
      let data = null
      do {
        try {
          res = await searchProductsApi(params)
          data = res.data.result
          data.list.forEach(item => allProducts.push({ skuid: item.skuid }))
          pageTotal = data.pages
          this.allExportProgress = parseInt(params.offset * 100 / pageTotal, 10)
          params.offset = params.offset + 1
        } catch (e) {
          suc = false
          console.warn('handleExportAllProducts:' + e)
          break
        }
      } while (params.offset <= pageTotal && !this.allExportCancelled)
      if (suc && allProducts.length > 0 && !this.allExportCancelled) {
        this.exportToFile(allProducts)
      }
      this.allExportProgress = 0
      this.allExportCancelled = false
      this.exportDialogVisible = false
    },
    exportToFile(dataList) {
      this.productExporting = true
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['skuID']
        const filterVal = ['skuid']
        const data = this.formatJson(filterVal, dataList)
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
    getProductImage(row) {
      if (validateURL(row.imageExtend)) {
        return row.imageExtend
      } else {
        return row.image
      }
    }
  }
}
</script>

<style scoped>
  .image-container {
    width: 70%;
  }
</style>
