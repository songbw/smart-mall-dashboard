<template>
  <div class="app-container">
    <div>
      <el-form :inline="true">
        <el-form-item label="商品名称">
          <el-input v-model="listQuery" placeholder="输入商品名" clearable maxlength="30" />
        </el-form-item>
        <el-form-item label="商品SKU">
          <el-input v-model="listSkuId" placeholder="输入商品SKU" clearable maxlength="20" />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select :value="listState" @change="handleStateChanged">
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
          <el-input v-model="listBrand" :clearable="true" placeholder="输入品牌关键字" maxlength="10" />
        </el-form-item>
        <el-form-item label="商品MPU">
          <el-input v-model="listMpu" :clearable="true" placeholder="输入商品MPU" maxlength="20" />
        </el-form-item>
        <el-form-item v-if="isAdminUser" label="供应商名">
          <el-select :value="listVendor" @change="handleVendorChanged">
            <el-option
              v-for="item in vendorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="true">
        <el-form-item label="商品类别">
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
        <div>
          <el-button
            :disabled="!vendorApproved"
            type="primary"
            icon="el-icon-goods"
            @click="handleCreateProduct"
          >
            新建商品
          </el-button>
          <el-button
            :disabled="!vendorApproved"
            type="success"
            icon="el-icon-upload2"
            @click="dialogImportVisible = true"
          >
            批量创建商品
          </el-button>
          <el-button
            :disabled="productSelection.length === 0"
            type="danger"
            icon="el-icon-edit"
            @click="handleEditSelection"
          >
            批量修改{{ productSelection.length }}个商品
          </el-button>
        </div>
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
      :data="productsData"
      border
      fit
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="商品SKU" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="handleViewProduct(scope.$index)">
            {{ scope.row.skuid }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="商品图" align="center" width="140">
        <template slot-scope="scope">
          <el-image :src="scope.row.image" fit="contain">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.brand }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <template v-if="scope.row.editPrice">
            <el-input-number
              v-model="scope.row.price"
              :controls="false"
              size="mini"
              :min="1"
              :max="1000000"
              step-strictly
            />
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
              v-if="scope.row.price && couldEditProduct"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              circle
              @click="scope.row.editPrice=!scope.row.editPrice"
            />
          </template>
        </template>
      </el-table-column>
      <el-table-column v-if="isAdminUser" label="供应商" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ getVendorName(scope.row.merchantId) }}</span>
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
        width="150"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-dropdown placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              选择操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="`view:${scope.$index}`"
                icon="el-icon-view"
              >
                查看商品
              </el-dropdown-item>
              <el-dropdown-item
                :command="`edit:${scope.$index}`"
                :disabled="isProductOnSale(scope.row.state)"
                icon="el-icon-edit"
                divided
              >
                编辑商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="isAdminUser && !isProductOnSale(scope.row.state)"
                :command="`start:${scope.$index}`"
                icon="el-icon-sell"
              >
                上架商品
              </el-dropdown-item>
              <el-dropdown-item
                v-else-if="isAdminUser"
                :command="`stop:${scope.$index}`"
                icon="el-icon-sold-out"
              >
                下架商品
              </el-dropdown-item>
              <el-dropdown-item
                :command="`delete:${scope.$index}`"
                :disabled="isProductCouldDelete(scope.row) === false"
                icon="el-icon-delete"
                divided
              >
                删除商品
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="productsTotal > 0"
      :total="productsTotal"
      :page.sync="listOffset"
      :limit.sync="listLimit"
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
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      :product-creation="true"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
    <el-dialog v-loading="selectionEditing" :visible.sync="editDialogVisible" title="批量修改商品" width="400px">
      <div style="font-size: 14px;margin-bottom: 10px">
        <i class="el-icon-warning-outline">如果无需修改对应属性，可以不选择！</i>
      </div>
      <el-form
        :model="selectionForm"
        label-position="right"
        label-width="100px"
      >
        <el-form-item v-if="isAdminUser" label="商品供应商">
          <el-select v-model="selectionForm.merchantId" clearable>
            <el-option
              v-for="item in productVendors"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品品牌">
          <el-select
            filterable
            remote
            placeholder="请输入商品品牌关键词"
            clearable
            :value="selectionForm.brandId"
            :remote-method="remoteBrandOptions"
            :loading="brandLoading"
            @change="handleBrandChanged"
          >
            <el-option
              v-for="item in brandOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品类别">
          <category-selection
            :inline="false"
            :first-value="selectionForm.firstCategoryValue"
            :second-value="selectionForm.secondCategoryValue"
            :third-value="selectionForm.thirdCategoryValue"
            @changed="onEditCategorySelectionChanged"
          />
        </el-form-item>
        <el-form-item v-if="isAdminUser" label="商品状态">
          <el-select v-model="selectionForm.state" clearable>
            <el-option
              v-for="item in editStateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditSelection">确定</el-button>
      </div>
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
  deleteProductApi,
  createProductApi
} from '@/api/products'
import { getVendorListApi } from '@/api/vendor'
import { searchBrandsApi } from '@/api/brands'
import Pagination from '@/components/Pagination'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import CategorySelection from '@/components/CategorySelection'
import {
  product_state_off_shelves,
  product_state_on_sale,
  ProductStateOptions,
  vendor_status_approved
} from '@/utils/constants'

export default {
  name: 'Product',
  components: { Pagination, CategorySelection, GoodsImportDialog },
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
      couldEditProduct: false,
      stateOptions: [{
        value: -2,
        label: '全部'
      }].concat(ProductStateOptions),
      editStateOptions: [{
        value: product_state_on_sale,
        label: '上架'
      }, {
        value: product_state_off_shelves,
        label: '下架'
      }],
      productsTotal: 0,
      productsData: [],
      listLoading: false,
      productExporting: false,
      productSelection: [],
      exportDialogVisible: false,
      allExportCancelled: false,
      allExportProgress: 0,
      dialogImportVisible: false,
      editDialogVisible: false,
      brandLoading: false,
      brandOptions: [],
      selectionEditing: false,
      selectionForm: {
        merchantId: null,
        state: null,
        brandId: null, // Number
        brand: null,
        category: null,
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null
      }
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      vendorId: 'vendorId',
      productQuery: 'productQuery',
      productVendors: 'productVendors',
      vendorApproved: 'vendorApproved'
    }),
    vendorOptions() {
      return [{ value: -1, label: '全部' }].concat(this.productVendors)
    },
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
    listMpu: {
      get() {
        return this.productQuery.mpu
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { mpu: value })
      }
    },
    listState: {
      get() {
        return this.productQuery.state
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { state: value })
      }
    },
    listVendor: {
      get() {
        return this.productQuery.vendorId
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { vendorId: value })
      }
    }
  },
  created() {
    this.prepareList()
  },
  methods: {
    async prepareList() {
      await this.getVendorList()
      this.getListData()
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.listLoading = true
        const data = await getVendorListApi(params)
        const vendors = data.rows.map(row => {
          return {
            value: row.company.id,
            label: row.company.name
          }
        })
        this.$store.commit('products/SET_VENDOR_OPTIONS', vendors)
      } catch (e) {
        console.warn('Product get vendor list error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    getVendorName(vendorId) {
      if (this.vendorOptions.length > 0 && vendorId != null) {
        const vendor = this.vendorOptions.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    async getListData() {
      if (this.vendorApproved) {
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
      if (this.listState !== -2) {
        params.state = this.listState
      }

      try {
        this.listLoading = true
        const { data } = await getProductListApi(params)
        this.productsTotal = data.result.total
        this.productsData = data.result.list
        this.productsData.forEach(product => {
          this.$set(product, 'editPrice', false)
          this.$set(product, 'originalPrice', product.price)
        })
      } catch (e) {
        console.warn(`Get products list error:${e}`)
      } finally {
        this.listLoading = false
      }
    },
    getFilterParams() {
      const params = {}
      params.offset = this.listOffset
      params.limit = this.listLimit
      params.order = 'desc'
      if (!isEmpty(this.listSkuId)) {
        params.skuid = this.listSkuId
      } else if (!isEmpty(this.listMpu)) {
        params.mpu = this.listMpu
      } else {
        if (!isEmpty(this.listQuery)) {
          params.query = this.listQuery
        }
        if (!isEmpty(this.listBrand)) {
          params.brand = this.listBrand
        }
        if (this.isAdminUser) {
          if (this.listVendor > 0) {
            params.merchantId = this.listVendor
          }
        } else {
          params.merchantId = this.vendorId
        }
        if (Number.isInteger(this.thirdCategoryValue)) {
          params.categoryID = this.thirdCategoryValue
        }
      }
      if (this.listState !== -2) {
        params.state = this.listState
      }
      return params
    },
    async getFilterProducts(params) {
      try {
        this.listLoading = true
        const { data } = await searchProductsApi(params)
        this.productsTotal = data.result.total
        this.productsData = data.result.list
        this.productsData.forEach(product => {
          this.$set(product, 'editPrice', false)
          this.$set(product, 'originalPrice', product.price)
        })
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
    isProductCouldDelete(product) {
      // MerchantId equals 2 means product is Aoyi, not allow delete
      return product.merchantId !== 2 && !this.isProductOnSale(product.state)
    },
    handleFilter() {
      if (this.firstCategoryValue != null) {
        if (this.secondCategoryValue === null) {
          this.$message.warning('请选择商品二级类别！')
          return
        } else if (this.thirdCategoryValue === null) {
          this.$message.warning('请选择商品三级类别！')
          return
        }
      }
      this.listOffset = 1
      this.getListData()
    },
    handleCreateProduct() {
      this.$router.push({
        name: 'CreateProduct'
      })
    },
    handleEditProduct(index) {
      const id = this.productsData[index].id
      this.$router.push({
        name: 'EditProduct',
        params: { id }
      })
    },
    handleViewProduct(index) {
      const id = this.productsData[index].id
      this.$router.push({
        name: 'ShowProduct',
        params: { id }
      })
    },
    handleProductOnSale(index) {
      const that = this
      this.$confirm('是否继续上架此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const id = that.productsData[index].id
          const params = {
            id,
            state: product_state_on_sale
          }
          await updateProductApi(params)
          that.$message({ message: '产品上架成功！', type: 'success' })
          that.getListData()
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleProductOffShelves(index) {
      const that = this
      this.$confirm('是否继续下架此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const id = that.productsData[index].id
          const params = {
            id,
            state: product_state_off_shelves
          }
          await updateProductApi(params)
          that.$message({ message: '产品下架成功！', type: 'success' })
          await that.getListData()
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleDeleteProduct(index) {
      const that = this
      this.$confirm('是否继续删除此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const id = that.productsData[index].id
          const params = {
            id
          }
          await deleteProductApi(params)
          this.$message({ message: '产品删除成功！', type: 'success' })
          if (this.productsData.length === 1 && this.listOffset > 1) {
            this.listOffset = this.listOffset - 1
          }
          that.getListData()
        } catch (e) {
          console.warn(`Delete product error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleOpsAction(action) {
      const cmd = action.split(':')[0]
      const index = Number.parseInt(action.split(':')[1])
      switch (cmd) {
        case 'start':
          this.handleProductOnSale(index)
          break
        case 'view':
          this.handleViewProduct(index)
          break
        case 'edit':
          this.handleEditProduct(index)
          break
        case 'stop':
          this.handleProductOffShelves(index)
          break
        case 'delete':
          this.handleDeleteProduct(index)
          break
      }
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
          const price = row.price
          const params = {
            id: row.id,
            price
          }
          await updateProductApi(params)
          // eslint-disable-next-line require-atomic-updates
          row.editPrice = false
          // eslint-disable-next-line require-atomic-updates
          row.originalPrice = price
          this.$message({ message: '更新产品价格成功。', type: 'success' })
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
    },
    handleStateChanged(state) {
      this.listState = state
    },
    handleVendorChanged(vendorId) {
      this.listVendor = vendorId
    },
    async onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      if (skus.length > 0) {
        const loading = this.$loading({
          lock: true,
          text: '正在创建商品...',
          spinner: 'el-icon-loading'
        })
        for (const sku of skus) {
          try {
            await createProductApi(sku)
          } catch (e) {
            console.warn('Good import creation error:' + e)
          }
        }
        loading.close()
      }
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    handleEditSelection() {
      Object.keys(this.selectionForm).forEach(key => {
        this.selectionForm[key] = null
      })
      this.editDialogVisible = true
    },
    handleBrandChanged(value) {
      this.selectionForm.brandId = value
      this.selectionForm.brand = this.brandOptions.find(brand => brand.value === value).label
      this.brandOptions = []
    },
    onEditCategorySelectionChanged(category) {
      const value = Number.isSafeInteger(category.value) ? category.value : null
      switch (category.level) {
        case 1:
          this.selectionForm.firstCategoryValue = value
          this.selectionForm.secondCategoryValue = null
          this.selectionForm.thirdCategoryValue = null
          break
        case 2:
          this.selectionForm.secondCategoryValue = value
          this.selectionForm.thirdCategoryValue = null
          break
        case 3:
          this.selectionForm.thirdCategoryValue = value
          break
        default:
          break
      }
    },
    async remoteBrandOptions(query) {
      if (isEmpty(query)) {
        this.brandOptions = []
      } else {
        try {
          this.brandLoading = true
          const { data } = await searchBrandsApi({ offset: 1, limit: 20, query })
          this.brandOptions = data.result.list.map(brand => {
            // If no english name, jus return chinese name
            const name = isEmpty(brand.brandEname) ? brand.brandCname : brand.brandName
            return { value: brand.brandId, label: name }
          })
        } catch (e) {
          console.log('Remote brand options: ' + e)
          this.brandOptions = []
        } finally {
          this.brandLoading = false
        }
      }
    },
    async confirmEditSelection() {
      const keys = ['merchantId', 'state', 'brandId', 'brand', 'category']
      const params = {}
      keys.forEach(key => {
        if (this.selectionForm[key] !== null) {
          params[key] = this.selectionForm[key]
        }
      })
      if (isEmpty(params)) {
        this.editDialogVisible = false
      } else {
        try {
          const msg = `${params.merchantId ? '供应商，' : ''}
          ${params.state ? '商品状态，' : ''}
          ${params.category ? '商品类别，' : ''}
          ${params.brandId ? '商品品牌，' : ''}`
          await this.$confirm(`批量修改商品：${msg}是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.selectionEditing = true
          for (const product of this.productSelection) {
            const id = product.id
            await updateProductApi({ id, ...params })
          }
          this.selectionEditing = false
          this.getListData()
        } catch (e) {
          console.warn('Product edit selection error:' + e)
        } finally {
          this.editDialogVisible = false
          this.selectionEditing = false
        }
      }
    }
  }
}
</script>

