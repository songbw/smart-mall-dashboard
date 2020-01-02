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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
          <el-button
            :icon="showMoreOptions ? 'el-icon-arrow-up': 'el-icon-arrow-down'"
            type="info"
            @click="showMoreOptions = !showMoreOptions"
          >
            更多选项
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-if="showMoreOptions" :inline="true">
        <el-form-item label="商品品牌">
          <el-input v-model="listBrand" :clearable="true" placeholder="输入品牌关键字" maxlength="10" />
        </el-form-item>
        <el-form-item label="商品MPU">
          <el-input v-model="listMpu" :clearable="true" placeholder="输入商品MPU" maxlength="20" />
        </el-form-item>
        <el-form-item v-if="hasVendorPermission" label="供应商名">
          <vendor-selection
            :vendor-id="listVendor"
            @changed="handleVendorChanged"
          />
        </el-form-item>
      </el-form>
      <el-form v-if="showMoreOptions" :inline="true">
        <el-form-item label="商品类别">
          <category-selection
            :first-value="firstCategoryValue"
            :second-value="secondCategoryValue"
            :third-value="thirdCategoryValue"
            @changed="handleCategorySelectionChanged"
          />
        </el-form-item>
      </el-form>
      <div
        v-if="hasCreatePermission || hasUpdatePermission || hasExportPermission"
        style="margin-bottom: 10px;display: flex;justify-content: space-between;align-items: baseline"
      >
        <div>
          <el-button
            v-if="hasCreatePermission"
            :disabled="!vendorApproved"
            type="primary"
            icon="el-icon-goods"
            @click="handleCreateProduct"
          >
            新建商品
          </el-button>
          <el-button
            v-if="hasCreatePermission"
            :disabled="!vendorApproved"
            type="success"
            icon="el-icon-upload2"
            @click="dialogImportVisible = true"
          >
            批量创建
          </el-button>
          <el-button
            v-if="hasUpdatePermission"
            :disabled="!vendorApproved"
            type="warning"
            icon="el-icon-upload2"
            @click="dialogUpdateVisible = true"
          >
            批量更新
          </el-button>
          <el-button
            v-if="hasUpdatePermission"
            :disabled="productSelection.length === 0"
            type="info"
            icon="el-icon-edit"
            @click="handleEditSelection"
          >
            修改已选{{ productSelection.length }}个商品
          </el-button>
          <el-button
            v-if="hasUpdatePermission"
            :disabled="productSelection.length === 0"
            type="danger"
            icon="el-icon-edit-outline"
            @click="handleEditSelectionShipping"
          >
            修改已选运费模板
          </el-button>
        </div>
        <div>
          <el-button
            v-if="hasExportPermission"
            :disabled="!vendorApproved"
            :loading="productExporting"
            type="warning"
            icon="el-icon-download"
            @click="handleExportAllProducts"
          >
            导出全部
          </el-button>
        </div>
      </div>
    </div>
    <el-form v-if="hasSalePricePermission && hasCostPricePermission" inline @submit.prevent.native="() => {}">
      <el-form-item label="底价比率">
        <el-input-number
          v-model="floorPriceRate"
          :precision="2"
          :step="0.05"
          :min="1"
          :max="10"
        />
      </el-form-item>
      <el-form-item>
        <el-tooltip content="导出上架商品中销售价异常列表" placement="top">
          <el-button
            :loading="exportingPriceProducts"
            icon="el-icon-download"
            type="primary"
            @click="handleExportWithFloorPrice"
          >
            导出价格异常商品
          </el-button>
        </el-tooltip>
        <el-button type="success" icon="el-icon-upload2" @click="dialogUpdatePriceVisible = true">
          批量导入更新商品价格
        </el-button>
      </el-form-item>
    </el-form>
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
      <el-table-column label="商品SKU" align="center" width="140">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ShowProduct', params: { id: scope.row.id }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.skuid }}
          </router-link>
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
      <el-table-column label="销售价格(元)" align="center" width="160">
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
            <span v-if="hasSalePricePermission" style="padding-right: 10px">{{ scope.row.price }}</span>
            <el-button
              v-if="scope.row.price && couldEditProduct"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              circle
              @click="scope.row.editPrice=!scope.row.editPrice"
            />
            <div v-if="hasSalePricePermission && hasCostPricePermission && scope.row.sprice !== null">
              <span style="font-size: 12px">(底价:{{ getFloorPrice(scope.row) }})</span>
            </div>
            <div v-if="hasCostPricePermission && scope.row.sprice !== null">
              <span style="font-size: 12px">(进价:{{ scope.row.sprice }})</span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column v-if="hasVendorPermission" label="供应商" align="center" width="120">
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
                v-if="hasViewPermission"
                :command="`view:${scope.$index}`"
                icon="el-icon-view"
              >
                查看商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="hasUpdatePermission"
                :command="`edit:${scope.$index}`"
                :disabled="isProductOnSale(scope.row.state)"
                icon="el-icon-edit"
                divided
              >
                编辑商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="hasStatePermission && !isProductOnSale(scope.row.state)"
                :command="`start:${scope.$index}`"
                icon="el-icon-sell"
              >
                上架商品
              </el-dropdown-item>
              <el-dropdown-item
                v-else-if="hasStatePermission && isProductOnSale(scope.row.state)"
                :command="`stop:${scope.$index}`"
                icon="el-icon-sold-out"
              >
                下架商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="hasDeletePermission"
                :command="`delete:${scope.$index}`"
                :disabled="isProductCouldDelete(scope.row) === false || !hasCreatePermission"
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
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      :product-creation="true"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogUpdateVisible"
      :product-update="true"
      @onSelectionCancelled="dialogUpdateVisible = false"
      @onSelectionConfirmed="onGoodsUpdateConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogUpdatePriceVisible"
      :update-price="true"
      @onSelectionCancelled="dialogUpdatePriceVisible = false"
      @onSelectionConfirmed="onUpdatePriceConfirmed"
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
        <el-form-item v-if="hasStatePermission" label="商品状态">
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
    <shipping-price-selection
      :mpu-list="selectedMpuList"
      :dialog-visible="shippingPriceDialogVisible"
      @onCancelled="handleCloseSelectionShipping"
      @onConfirmed="handleCloseSelectionShipping"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import trim from 'lodash/trim'
import moment from 'moment'
import {
  getProductListApi,
  updateProductApi,
  searchProductsApi,
  deleteProductApi,
  createProductApi,
  exportProductsApi,
  exportFloorPriceApi,
  updatePriceOrStateApi
} from '@/api/products'
import { getVendorListApi } from '@/api/vendor'
import { searchBrandsApi } from '@/api/brands'
import Pagination from '@/components/Pagination'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import CategorySelection from '@/components/CategorySelection'
import VendorSelection from '@/components/VendorSelection'
import {
  product_state_off_shelves,
  product_state_on_sale,
  product_state_is_editing,
  product_state_all,
  ProductStateOptions,
  vendor_status_approved
} from '@/utils/constants'
import { ProductPermissions } from '@/utils/role-permissions'
import ShippingPriceSelection from './shippingPriceSelection'

export default {
  name: 'Product',
  components: { Pagination, CategorySelection, GoodsImportDialog, ShippingPriceSelection, VendorSelection },
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
        value: product_state_all,
        label: '全部'
      }].concat(ProductStateOptions),
      editStateOptions: [{
        value: product_state_on_sale,
        label: '上架'
      }, {
        value: product_state_off_shelves,
        label: '下架'
      }],
      showMoreOptions: true,
      floorPriceRate: 1.1,
      productsTotal: 0,
      productsData: [],
      listLoading: false,
      productExporting: false,
      productSelection: [],
      selectedMpuList: [],
      dialogImportVisible: false,
      dialogUpdateVisible: false,
      dialogUpdatePriceVisible: false,
      editDialogVisible: false,
      shippingPriceDialogVisible: false,
      exportingPriceProducts: false,
      brandLoading: false,
      brandOptions: [],
      selectionEditing: false,
      selectionForm: {
        state: null,
        brandId: null, // Number
        brand: null,
        category: null,
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null
      },
      queryParams: null
    }
  },
  computed: {
    ...mapGetters({
      vendorId: 'vendorId',
      productQuery: 'productQuery',
      productVendors: 'productVendors',
      vendorApproved: 'vendorApproved',
      userPermissions: 'userPermissions'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(ProductPermissions.view)
    },
    hasCreatePermission() {
      return this.userPermissions.includes(ProductPermissions.create)
    },
    hasUpdatePermission() {
      return this.userPermissions.includes(ProductPermissions.update)
    },
    hasDeletePermission() {
      return this.userPermissions.includes(ProductPermissions.delete)
    },
    hasSalePricePermission() {
      return this.userPermissions.includes(ProductPermissions.salePrice)
    },
    hasCostPricePermission() {
      return this.userPermissions.includes(ProductPermissions.costPrice)
    },
    hasStatePermission() {
      return this.userPermissions.includes(ProductPermissions.state)
    },
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    },
    hasExportPermission() {
      return this.userPermissions.includes(ProductPermissions.export)
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
        this.$store.commit('products/SET_SEARCH_DATA', { skuid: trim(value) })
      }
    },
    listBrand: {
      get() {
        return this.productQuery.brand
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { brand: trim(value) })
      }
    },
    listMpu: {
      get() {
        return this.productQuery.mpu
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { mpu: trim(value) })
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
  beforeRouteLeave(to, from, next) {
    const toGroup = to.meta.group || ''
    if (toGroup !== this.$route.meta.group) {
      this.$store.commit('products/RESET_SEARCH_DATA')
    }
    next()
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
          limit: 1000,
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
      if (this.productVendors.length > 0 && vendorId != null) {
        const vendor = this.productVendors.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    async getListData() {
      if (this.vendorApproved && this.hasViewPermission) {
        const params = this.getFilterParams()
        if (params) {
          params.offset = this.listOffset
          params.limit = this.listLimit
          params.order = 'desc'
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
      if (this.listState !== product_state_all) {
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
      if (!isEmpty(this.listSkuId)) {
        params.skuid = this.listSkuId
      }
      if (!isEmpty(this.listMpu)) {
        params.mpu = this.listMpu
      }
      if (!isEmpty(this.listQuery)) {
        params.query = this.listQuery
      }
      if (!isEmpty(this.listBrand)) {
        params.brand = this.listBrand
      }
      if (this.hasVendorPermission) {
        if (!isEmpty(this.listVendor)) {
          params.merchantId = Number.parseInt(this.listVendor)
        }
      } else {
        params.merchantId = this.vendorId
      }
      const categoryId = this.thirdCategoryValue || this.secondCategoryValue || this.firstCategoryValue
      if (categoryId !== null) {
        params.categoryID = categoryId
      }
      if (this.listState !== product_state_all) {
        params.state = this.listState
      }
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.listOffset = 1
      }
      return { ...params }
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
      // Only in editing state could delete
      const value = Number.parseInt(product.state)
      return Number.isNaN(value) ? false : value === product_state_is_editing
    },
    handleFilter() {
      if (this.hasViewPermission) {
        this.listOffset = 1
        this.getListData()
      } else {
        this.$message.warning('没有查看商品权限，请联系管理员！')
      }
    },
    getFloorPrice(row) {
      const sprice = Number.parseFloat(row.sprice)
      if (Number.isNaN(sprice)) {
        return null
      } else {
        return (sprice * this.floorPriceRate).toFixed(2)
      }
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
    isReadyForSale(product) {
      const price = Number.parseFloat(product.price)
      return !(Number.isNaN(price) || price < 0 ||
        isEmpty(product.image) ||
        isEmpty(product.imagesUrl) ||
        isEmpty(product.introductionUrl))
    },
    handleProductOnSale(index) {
      if (this.isReadyForSale(this.productsData[index])) {
        this.$confirm('是否继续上架此商品？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          try {
            const id = this.productsData[index].id
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
      } else {
        this.$confirm('此商品不满足上架条件，是否去修改此商品信息？', '提示', {
          confirmButtonText: '去编辑',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleEditProduct(index)
        }).catch(() => {
        })
      }
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
          await that.getListData()
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
    async handleExportWithFloorPrice() {
      const floorPriceRate = Math.round(this.floorPriceRate * 100)
      if (floorPriceRate < 100 || Number.isNaN(floorPriceRate)) {
        this.$message.warning('请设置商品底价比率大于1！')
        return
      }
      try {
        this.listLoading = true
        this.exportingPriceProducts = true
        const filename = '价格异常商品列表-' + moment().format('YYYY-MM-DD') + '.xls'
        const data = await exportFloorPriceApi({ floorPriceRate, pageNo: 1, pageSize: 5000 })
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Products export floor price error:' + e)
      } finally {
        this.listLoading = false
        this.exportingPriceProducts = false
      }
    },
    async onUpdatePriceConfirmed(skus) {
      this.dialogUpdatePriceVisible = false
      try {
        this.listLoading = true
        for (let i = 0; i < skus.length; i += 100) {
          const skuList = skus.slice(i, i + 100)
            .map(item => ({ mpu: item.mpu, price: item.price, state: item.state }))
          await updatePriceOrStateApi(skuList)
        }
      } catch (e) {
        console.warn('Products update product price error:' + e)
      } finally {
        this.listLoading = false
      }
      this.getListData()
    },
    async handleExportAllProducts() {
      const params = this.getFilterParams()
      try {
        const filename = '商品列表-' + moment().format('YYYY-MM-DD') + '.xls'
        this.getListData()
        const data = await exportProductsApi(params)
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Export all products:' + e)
        const res = e.response
        let msg = '导出商品列表失败，请联系管理员！'
        if (res && res.status) {
          if (res.status === 416) {
            msg = '导出商品列表失败，商品数量过多，请修改导出选项！'
          } else {
            msg = '导出商品列表失败，未找到对应商品，请修改导出选项！'
          }
        }
        this.$message.warning(msg)
      }
    },
    exportToFile(dataList) {
      this.productExporting = true
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['商品SKU']
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
        this.getListData()
      }
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    async onGoodsUpdateConfirmed(skus) {
      this.dialogUpdateVisible = false
      if (skus.length > 0) {
        const loading = this.$loading({
          lock: true,
          text: '正在更新商品...',
          spinner: 'el-icon-loading'
        })
        for (const sku of skus) {
          const { skuid, ...params } = sku
          try {
            await updateProductApi(params)
          } catch (e) {
            console.warn(`Good import update ${skuid} error: ${e}`)
          }
        }
        loading.close()
        this.getListData()
      }
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
      this.selectionForm.category = this.selectionForm.thirdCategoryValue
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
      const keys = ['state', 'brandId', 'brand', 'category']
      const params = {}
      keys.forEach(key => {
        if (this.selectionForm[key] !== null) {
          params[key] = this.selectionForm[key]
        }
      })
      this.editDialogVisible = false

      if (isEmpty(params) === false) {
        try {
          const msg = `${'state' in params ? '商品状态，' : ''}
          ${'category' in params ? '商品类别，' : ''}
          ${'brandId' in params ? '商品品牌，' : ''}`
          await this.$confirm(`批量修改商品：${msg}是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.selectionEditing = true
          let warning = null
          for (const product of this.productSelection) {
            if ('state' in params && params.state === product_state_on_sale) {
              if (this.isReadyForSale(product) === false) {
                warning = '部分商品上架失败，请修改商品信息！'
                continue
              }
            }
            const id = product.id
            await updateProductApi({ id, ...params })
          }
          this.selectionEditing = false
          this.getListData()
          if (warning !== null) {
            this.$message.warning(warning)
          }
        } catch (e) {
          console.warn('Product edit selection error:' + e)
        } finally {
          this.selectionEditing = false
        }
      }
    },
    handleEditSelectionShipping() {
      this.selectedMpuList = this.productSelection.map(item => item.mpu)
      this.shippingPriceDialogVisible = true
    },
    handleCloseSelectionShipping(ret) {
      this.shippingPriceDialogVisible = false
      this.selectedMpuList = []
      if (ret.suc) {
        this.$message.success('修改商品运费模板成功！')
      }
    }
  }
}
</script>

