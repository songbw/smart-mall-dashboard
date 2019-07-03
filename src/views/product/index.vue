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
        <el-form-item label="商品品牌">
          <category-selection
            :first-value="firstCategoryValue"
            :second-value="secondCategoryValue"
            :third-value="thirdCategoryValue"
            @changed="handleCategorySelectionChanged"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 10px;display: flex;justify-content: space-between">
        <el-button
          :disabled="!vendorApproved"
          type="primary"
          icon="el-icon-goods"
          @click="handleCreateProduct"
        >
          新建商品
        </el-button>
        <div>
          <el-button
            :disabled="productSelection.length === 0"
            :loading="productExporting"
            type="info"
            icon="el-icon-download"
            @click="handleExportSelection"
          >
            导出已选{{ productSelection.length }}个商品
          </el-button>
          <el-button
            :disabled="productsTotal === 0"
            :loading="productExporting"
            type="warning"
            icon="el-icon-download"
            @click="handleExportAllProducts"
          >
            导出全部商品
          </el-button>
        </div>
      </div>
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
      <el-table-column label="商品ID" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品SKU" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center">
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
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.state | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="280"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleViewProduct(scope.row.skuid)"
          >
            查看
          </el-button>
          <el-button
            v-if="!isProductOnSale(scope.row.state)"
            type="info"
            size="mini"
            @click="handleEditProduct(scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!isProductOnSale(scope.row.state)"
            type="warning"
            size="mini"
            @click="handleProductOnSale(scope.row.id)"
          >
            上架
          </el-button>
          <el-button
            v-else
            type="warning"
            size="mini"
            @click="handleProductOffShelves(scope.row.id)"
          >
            下架
          </el-button>
          <el-button
            v-if="!isProductOnSale(scope.row.state)"
            type="danger"
            size="mini"
            @click="handleDeleteProduct(scope.row.id)"
          >
            删除
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
import {
  getProductListApi,
  updateProductApi,
  searchProductsApi,
  deleteProductApi
} from '@/api/products'
import Pagination from '@/components/Pagination'
import CategorySelection from './categorySelection'
import {
  product_state_off_shelves,
  product_state_on_sale,
  ProductStateOptions
} from '@/utils/constants'

export default {
  name: 'Product',
  components: { Pagination, CategorySelection },
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
      vendorApproved: 'vendorApproved'
    }),
    firstCategoryValue: {
      get() {
        return this.productQuery.firstCategoryId
      },
      set(value) {
        this.$store.commit('products/SET_FIRST_CATEGORY_ID', {
          firstCategoryId: Number.isSafeInteger(value) ? value : null
        })
      }
    },
    secondCategoryValue: {
      get() {
        return this.productQuery.secondCategoryId
      },
      set(value) {
        this.$store.commit('products/SET_SECOND_CATEGORY_ID', {
          secondCategoryId: Number.isSafeInteger(value) ? value : null
        })
      }
    },
    thirdCategoryValue: {
      get() {
        return this.productQuery.thirdCategoryId
      },
      set(value) {
        this.$store.commit('products/SET_THIRD_CATEGORY_ID', {
          thirdCategoryId: Number.isSafeInteger(value) ? value : null
        })
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
  },
  methods: {
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
      if (this.vendorApproved) {
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
    isProductOnSale(state) {
      const value = Number.parseInt(state)
      if (Number.isNaN(value)) {
        return false
      } else {
        return value === product_state_on_sale
      }
    },
    handleFilter() {
      this.getListData()
    },
    handleCreateProduct() {
      this.$router.push({
        name: 'CreateProduct'
      })
    },
    handleEditProduct(id) {
      this.$router.push({
        name: 'EditProduct',
        params: { id }
      })
    },
    handleViewProduct(skuId) {
      this.$router.push({
        name: 'ViewProduct',
        params: { skuId }
      })
    },
    handleProductOnSale(id) {
      this.$confirm('是否继续上架此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const params = {
            id,
            state: product_state_on_sale
          }
          await updateProductApi(params)
          this.$message({ message: '产品上架成功！', type: 'success' })
          this.getListData()
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleProductOffShelves(id) {
      this.$confirm('是否继续下架此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const params = {
            id,
            state: product_state_off_shelves
          }
          await updateProductApi(params)
          this.$message({ message: '产品下架成功！', type: 'success' })
          this.getListData()
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleDeleteProduct(id) {
      this.$confirm('是否继续删除此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const params = {
            id
          }
          await deleteProductApi(params)
          this.$message({ message: '产品删除成功！', type: 'success' })
          this.getListData()
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        }
      }).catch(() => {
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
          await updateProductApi(params)
          this.$message({ message: '更新产品价格成功。', type: 'success' })
          row.originalPrice = row.price
        } catch (e) {
          console.warn(`Update product price error: ${e}`)
        }
      }).catch(() => {
      })
    },
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
    }
  }
}
</script>

<style scoped>
  .image-container {
    width: 70%;
  }
</style>
