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
      <el-form v-if="showMoreOptions" :inline="true">
        <el-form-item label="商品MPU">
          <el-input v-model="listMpu" :clearable="true" placeholder="输入商品MPU" maxlength="20" />
        </el-form-item>
        <el-form-item v-if="hasRenterPermission" label="租户名">
          <vendor-selection
            :vendor-id="renterCompanyId"
            company-type="renter"
            @changed="handleRenterChanged"
          />
        </el-form-item>
        <el-form-item v-if="hasVendorPermission" label="供应商名">
          <vendor-selection
            :vendor-id="listVendor"
            :filter-renter="listRenter"
            @changed="handleVendorChanged"
          />
        </el-form-item>
        <el-form-item v-if="false" label="供应商子品牌">
          <el-select :value="listMpuPrefix" clearable @change="handleMpuPrefixChanged">
            <el-option
              v-for="item in mpuPrefixOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
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
            type="success"
            icon="el-icon-upload2"
            @click="dialogUpdateStateVisible = true"
          >
            批量上下架商品
          </el-button>
        </div>
        <div>
          <el-button
            :disabled="!vendorApproved"
            type="info"
            icon="el-icon-download"
            @click="dialogInventoryVisible = true"
          >
            商品库存
          </el-button>
          <el-button
            v-if="hasExportPermission"
            :disabled="!vendorApproved"
            :loading="productExporting"
            type="warning"
            icon="el-icon-download"
            @click="dialogExportVisible = true"
          >
            导出商品
          </el-button>
        </div>
      </div>
    </div>
    <el-form inline>
      <el-form-item>
        <el-button
          v-if="hasUpdatePermission"
          :disabled="productSelection.length === 0"
          type="info"
          icon="el-icon-edit"
          @click="handleEditSelection"
        >
          修改已选{{ productSelection.length }}个商品
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="hasUpdatePermission"
          :disabled="productSelection.length === 0"
          type="danger"
          icon="el-icon-edit-outline"
          @click="handleEditSelectionShipping"
        >
          修改已选运费模板
        </el-button>
      </el-form-item>
      <el-form-item v-if="isRenterAdmin">
        <span><i class="el-icon-warning-outline" />商品默认状态为供应商设置，租户可以修改供应商已上架商品的状态</span>
      </el-form-item>
    </el-form>
    <el-table
      ref="productsTable"
      v-loading="listLoading"
      :data="productsData"
      :span-method="productSpanMethod"
      border
      fit
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        column-key="selection"
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column column-key="mpu" label="商品MPU" align="center" width="120">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ViewProduct', params: { mpu: scope.row.mpu }}"
            class="el-link el-link--primary is-underline"
          >
            <span>{{ scope.row.mpu }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column v-if="isRenterAdmin" column-key="mpuState" label="默认状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.mpuState | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column column-key="image" label="商品图" align="center" width="140">
        <template slot-scope="scope">
          <img :src="scope.row.image" class="thumb-image" alt="">
        </template>
      </el-table-column>
      <el-table-column column-key="name" label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasVendorPermission"
        column-key="merchant"
        label="供应商"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ getVendorName(scope.row.merchantId) }}</span>
        </template>
      </el-table-column>
      <el-table-column column-key="sku" label="商品SKU" align="center" width="140">
        <template slot-scope="scope">
          {{ scope.row.skuId }}
        </template>
      </el-table-column>
      <el-table-column column-key="price" label="销售价格(元)" align="center" width="160">
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
            <div v-if="hasSalePricePermission && hasCostPricePermission && scope.row.floorPrice">
              <span style="font-size: 12px">(底价:{{ scope.row.floorPrice }})</span>
            </div>
            <div v-if="hasCostPricePermission && scope.row.sprice">
              <span style="font-size: 12px">(进价:{{ scope.row.sprice }})</span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column column-key="state" label="SKU状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.state | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column
        column-key="ops"
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
                :disabled="isProductOnSale(scope.row.renterState)"
                icon="el-icon-edit"
                divided
              >
                编辑商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="hasStatePermission && !isProductOnSale(scope.row.renterState)"
                :disabled="isRenterAdmin && !isOwnVendor(scope.row.merchantId) && scope.row.mpuState !== '1'"
                :command="`start:${scope.$index}`"
                icon="el-icon-sell"
              >
                上架商品
              </el-dropdown-item>
              <el-dropdown-item
                v-else-if="hasStatePermission && isProductOnSale(scope.row.renterState)"
                :command="`stop:${scope.$index}`"
                :disabled="isRenterAdmin && !isOwnVendor(scope.row.merchantId) && scope.row.mpuState !== '1'"
                icon="el-icon-sold-out"
              >
                下架商品
              </el-dropdown-item>
              <el-dropdown-item
                v-if="hasDeletePermission"
                :command="`delete:${scope.$index}`"
                :disabled="!isOwnVendor(scope.row.merchantId) || isProductCouldDelete(scope.row) === false"
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
      :dialog-visible="dialogUpdateStateVisible"
      :update-state="true"
      @onSelectionCancelled="dialogUpdateStateVisible = false"
      @onSelectionConfirmed="onUpdateStateConfirmed"
    />
    <el-dialog :visible.sync="editDialogVisible" title="批量修改商品" width="400px">
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
    <inventory-dialog
      :dialog-visible="dialogInventoryVisible"
      @cancelled="dialogInventoryVisible = false"
    />
    <export-dialog
      :dialog-visible="dialogExportVisible"
      :has-vendor-permission="hasVendorPermission"
      :has-sale-price-permission="hasSalePricePermission"
      @cancelled="dialogExportVisible = false"
      @confirmed="handleConfirmExportProducts"
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
  batchUpdateProductsApi,
  batchUpdateStateApi,
  updateRenterSkuStateApi
} from '@/api/products'
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
  role_renter_name, platform_renter_id
} from '@/utils/constants'
import { ProductPermissions } from '@/utils/role-permissions'
import ShippingPriceSelection from './shippingPriceSelection'
import InventoryDialog from './inventoryDialog'
import ExportDialog from './exportDialog'
import { floatToFixed } from '@/utils'

const vendorAoyi = 2

export default {
  name: 'Product',
  components: {
    Pagination,
    CategorySelection,
    GoodsImportDialog,
    ShippingPriceSelection,
    VendorSelection,
    InventoryDialog,
    ExportDialog
  },
  filters: {
    productState: state => {
      const value = typeof state === 'string' ? Number.parseInt(state) : state
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
      productsTotal: 0,
      productsData: [],
      listLoading: false,
      productExporting: false,
      productSelection: [],
      selectedMpuList: [],
      dialogImportVisible: false,
      dialogUpdateVisible: false,
      dialogUpdateStateVisible: false,
      editDialogVisible: false,
      shippingPriceDialogVisible: false,
      brandLoading: false,
      brandOptions: [],
      selectionForm: {
        state: null,
        brandId: null, // Number
        brand: null,
        category: null,
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null
      },
      queryParams: null,
      dialogInventoryVisible: false,
      dialogExportVisible: false,
      renterCompanyId: ''
    }
  },
  computed: {
    ...mapGetters({
      vendorId: 'vendorId',
      renterId: 'renterId',
      productQuery: 'productQuery',
      productVendors: 'vendorList',
      vendorApproved: 'vendorApproved',
      userPermissions: 'userPermissions',
      userRole: 'userRole'
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
    hasRenterPermission() {
      return this.userPermissions.includes(ProductPermissions.renter)
    },
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    },
    hasExportPermission() {
      return this.userPermissions.includes(ProductPermissions.export)
    },
    isRenterAdmin() {
      return this.userRole === role_renter_name
    },
    mpuPrefixOptions() {
      let vendorId = -1
      if (this.hasVendorPermission) {
        if (!isEmpty(this.listVendor)) {
          vendorId = parseInt(this.listVendor)
        }
      } else {
        vendorId = this.vendorId
      }
      if (vendorId === vendorAoyi) {
        return [{
          value: '10',
          label: '品牌自营'
        }, {
          value: '20',
          label: '苏宁易购'
        }, {
          value: '30',
          label: '唯品会'
        }]
      } else {
        return []
      }
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
    listRenter: {
      get() {
        return this.productQuery.renterId
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { renterId: value })
      }
    },
    listVendor: {
      get() {
        return this.productQuery.vendorId
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { vendorId: value })
      }
    },
    listMpuPrefix: {
      get() {
        return this.productQuery.mpuPrefix
      },
      set(value) {
        this.$store.commit('products/SET_SEARCH_DATA', { mpuPrefix: value })
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
      await this.getListData()
    },
    async getVendorList() {
      if (this.productVendors.length === 0) {
        try {
          this.listLoading = true
          await this.$store.dispatch('app/getVendorList')
        } catch (e) {
          console.warn('Product get vendor list error:' + e)
        } finally {
          this.listLoading = false
        }
      }
    },
    getVendorName(vendorId) {
      if (this.productVendors.length > 0 && vendorId != null) {
        const vendor = this.productVendors.find(option => option.companyId.toString() === vendorId.toString())
        if (vendor) {
          return vendor.companyName
        } else {
          return ''
        }
      }
    },
    getRenterSpuState(spu) {
      if (this.isRenterAdmin) {
        const stateList = spu.appSkuStateList
        if (Array.isArray(stateList) && stateList.length > 0) {
          const find = stateList.find(item => item.renterId === this.renterId)
          return find ? find.state.toString() : spu.state
        } else {
          return spu.state
        }
      } else {
        return spu.state
      }
    },
    getRenterSpuPrice(spu) {
      if (this.isRenterAdmin) {
        const priceList = spu.appSkuPriceList
        if (Array.isArray(priceList) && priceList.length > 0) {
          const find = priceList.find(item => item.renterId === this.renterId)
          return find ? floatToFixed(find.price / 100) : spu.price
        } else {
          return spu.price
        }
      } else {
        return spu.price
      }
    },
    getRenterSkuState(spuState, sku) {
      const skuState = spuState === product_state_on_sale
        ? sku.status.toString()
        : product_state_off_shelves.toString()
      if (this.isRenterAdmin) {
        const stateList = sku.appSkuStateList
        if (Array.isArray(stateList) && stateList.length > 0) {
          const find = stateList.find(item => item.renterId === this.renterId)
          return find ? find.state.toString() : skuState
        } else {
          return skuState
        }
      } else {
        return skuState
      }
    },
    getRenterSkuPrice(sku) {
      if (this.isRenterAdmin) {
        const priceList = sku.appSkuPriceList
        if (Array.isArray(priceList) && priceList.length > 0) {
          const find = priceList.find(item => item.renterId === this.renterId)
          return find ? find.price : sku.price
        } else {
          return sku.price
        }
      } else {
        return sku.price
      }
    },
    async getListData() {
      if (this.vendorApproved && this.hasViewPermission) {
        const params = this.getFilterParams()
        if (params) {
          params.offset = this.listOffset
          params.limit = this.listLimit
          params.order = 'desc'
          await this.getFilterProducts(params)
        } else {
          await this.getAllProducts()
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
      let total = 0
      let list = []
      try {
        this.listLoading = true
        const { code, data } = await getProductListApi(params)
        if (code === 200) {
          total = data.result.total
          list = Array.isArray(data.result.list) ? data.result.list : []
        }
      } catch (e) {
        console.warn(`Get products list error:${e}`)
      } finally {
        this.productsTotal = total
        this.setProductList(list)
        this.listLoading = false
      }
    },
    setProductList(list) {
      const centToYuan = cent => cent > 0 ? (cent / 100).toFixed(2) : null
      this.productsData = []
      for (const spu of list) {
        const renterState = this.getRenterSpuState(spu)
        const prod = {
          id: spu.id,
          spu: spu.skuid,
          mpu: spu.mpu,
          mpuState: spu.state,
          image: spu.image,
          name: spu.name,
          merchantId: spu.merchantId,
          renterState
        }
        if (Array.isArray(spu.skuList) && spu.skuList.length > 0) {
          for (const [index, sku] of spu.skuList.entries()) {
            this.productsData.push({
              skuId: sku.code,
              skuIndex: index,
              skuNum: spu.skuList.length,
              state: this.getRenterSkuState(parseInt(renterState), sku),
              price: centToYuan(this.getRenterSkuPrice(sku)),
              sprice: centToYuan(sku.sprice),
              editPrice: false,
              originalPrice: centToYuan(sku.price),
              ...prod
            })
          }
        } else {
          this.productsData.push({
            skuId: spu.skuid,
            skuIndex: 0,
            skuNum: 1,
            state: this.getRenterSpuState(spu),
            price: this.getRenterSpuPrice(spu),
            sprice: spu.sprice,
            editPrice: false,
            originalPrice: spu.price,
            ...prod
          })
        }
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
      if (this.hasRenterPermission) {
        if (!isEmpty(this.listRenter)) {
          params.renterId = this.listRenter
        }
      } else {
        params.renterId = this.renterId
      }
      if (this.hasVendorPermission) {
        if (!isEmpty(this.listVendor)) {
          params.merchantId = Number.parseInt(this.listVendor)
        }
      } else {
        params.merchantId = this.vendorId
      }
      if (!isEmpty(this.listMpuPrefix)) {
        params.mpuPrefix = this.listMpuPrefix
      }
      const categoryId = this.thirdCategoryValue || this.secondCategoryValue || this.firstCategoryValue
      if (categoryId !== null) {
        params.categoryID = categoryId
      }
      if (this.listState !== product_state_all) {
        params.state = this.listState
      }
      if (!isEqual(this.queryParams, params)) {
        if (this.queryParams !== null) {
          this.listOffset = 1
        }
        this.queryParams = { ...params }
      }
      return { ...params }
    },
    async getFilterProducts(params) {
      let total = 0
      let list = []
      try {
        this.listLoading = true
        const { code, data } = await searchProductsApi(params)
        if (code === 200) {
          total = data.result.total
          list = Array.isArray(data.result.list) ? data.result.list : []
        }
      } catch (e) {
        console.warn(`Get filter products list error:${e}`)
      } finally {
        this.productsTotal = total
        this.setProductList(list)
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
      const value = Number.parseInt(product.mpuState)
      return Number.isNaN(value) || !this.hasCreatePermission ? false : value === product_state_is_editing
    },
    handleFilter() {
      if (this.hasViewPermission) {
        this.listOffset = 1
        this.getListData()
      } else {
        this.$message.warning('没有查看商品权限，请联系管理员！')
      }
    },
    handleCreateProduct() {
      this.$router.push({
        name: 'CreateProduct'
      })
    },
    handleEditProduct(index) {
      const mpu = this.productsData[index].mpu
      this.$router.push({
        name: 'EditProduct',
        params: { mpu }
      })
    },
    handleViewProduct(index) {
      const mpu = this.productsData[index].mpu
      this.$router.push({
        name: 'ViewProduct',
        params: { mpu }
      })
    },
    isReadyForSale(product) {
      const price = Number.parseFloat(product.price)
      return !Number.isNaN(price) && price > 0
      /*
      return !(Number.isNaN(price) || price < 0 ||
        isEmpty(product.image) ||
        isEmpty(product.imagesUrl) ||
        isEmpty(product.introductionUrl) ||
        isEmpty(product.category)
      )
       */
    },
    isOwnVendor(vendorId) {
      if (this.isRenterAdmin) {
        const productVendor = this.productVendors.find(option => option.companyId.toString() === vendorId.toString())
        const hasPlatformRenter = productVendor
          ? productVendor.renterIdList.includes(platform_renter_id)
          : false
        return !hasPlatformRenter
      } else {
        return true
      }
    },
    handleProductOnSale(index) {
      this.$confirm('是否继续上架此商品？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          let code = 0
          const id = this.productsData[index].id
          const vendorId = this.productsData[index].merchantId
          if (this.isOwnVendor(vendorId)) {
            const params = [{
              id,
              state: product_state_on_sale
            }]
            const res = await batchUpdateStateApi(params)
            code = res.code
          } else {
            const params = [{
              renterId: this.renterId,
              mpu: this.productsData[index].mpu,
              skuId: this.productsData[index].mpu,
              state: product_state_on_sale
            }]
            const res = await updateRenterSkuStateApi(params)
            code = res.code
          }
          if (code === 200) {
            this.$message({ message: '产品上架成功！', type: 'success' })
            await this.getListData()
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
      }).then(async () => {
        try {
          let code = 0
          const id = that.productsData[index].id
          const vendorId = this.productsData[index].merchantId
          if (this.isOwnVendor(vendorId)) {
            const params = [{
              id,
              state: product_state_off_shelves
            }]
            const res = await batchUpdateStateApi(params)
            code = res.code
          } else {
            const params = [{
              renterId: this.renterId,
              mpu: this.productsData[index].mpu,
              skuId: this.productsData[index].mpu,
              state: product_state_off_shelves
            }]
            const res = await updateRenterSkuStateApi(params)
            code = res.code
          }
          if (code === 200) {
            that.$message({ message: '产品下架成功！', type: 'success' })
            await that.getListData()
          } else {
            that.$message({ message: '产品下架失败，请联系管理员！', type: 'warning' })
          }
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
      }).then(async () => {
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
      }).then(async () => {
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
    productSpanMethod({ row, column, rowIndex, columnIndex }) {
      const notSpanColumnKeys = ['price', 'sku', 'state']
      if (!notSpanColumnKeys.includes(column.columnKey) && row.skuNum > 1) {
        return {
          rowspan: row.skuIndex === 0 ? row.skuNum : 0,
          colspan: row.skuIndex === 0 ? 1 : 0
        }
      }
    },
    async onUpdateStateConfirmed(spuList) {
      this.dialogUpdateStateVisible = false
      try {
        this.listLoading = true
        for (let i = 0; i < spuList.length; i += 100) {
          const spuSlice = spuList.slice(i, i + 100)
          await batchUpdateStateApi(spuSlice)
        }
      } catch (e) {
        console.warn('Products update product price error:' + e)
      } finally {
        this.listLoading = false
      }
      this.getListData()
    },
    downloadBlobFile(data, filename) {
      try {
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
        console.warn('Download product export file error:' + e)
      }
    },
    handleConfirmExportProducts(params) {
      this.dialogExportVisible = false
      if ('floorPriceRate' in params) {
        this.handleExportWithFloorPrice(params.floorPriceRate)
      } else {
        this.handleExportAllProducts(params)
      }
    },
    async handleExportAllProducts(params) {
      this.productExporting = true
      try {
        const exportParams = {}
        for (const key of Object.keys(params)) {
          if (params[key] !== null) {
            exportParams[key] = params[key]
          }
        }
        const filename = '商品列表-' + moment().format('YYYY-MM-DD') + '.xls'
        const data = await exportProductsApi(exportParams)
        this.downloadBlobFile(data, filename)
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
      } finally {
        this.productExporting = false
      }
    },
    async handleExportWithFloorPrice(rate) {
      const floorPriceRate = Math.round(rate * 100)
      if (floorPriceRate < 100 || Number.isNaN(floorPriceRate)) {
        this.$message.warning('请设置商品底价比率大于1！')
        return
      }
      try {
        this.productExporting = true
        const filename = '价格异常商品列表-' + moment().format('YYYY-MM-DD') + '.xls'
        const data = await exportFloorPriceApi({ floorPriceRate, pageNo: 1, pageSize: 5000 })
        this.downloadBlobFile(data, filename)
      } catch (e) {
        console.warn('Products export floor price error:' + e)
      } finally {
        this.productExporting = false
      }
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
    handleRenterChanged(vendorId, label, renterId) {
      this.renterCompanyId = vendorId
      this.listRenter = renterId
      this.listVendor = ''
      this.listMpuPrefix = null
    },
    handleVendorChanged(vendorId) {
      this.listVendor = vendorId
      this.listMpuPrefix = null
    },
    handleMpuPrefixChanged(value) {
      this.listMpuPrefix = value
    },
    async onGoodsImportConfirmed(spuList) {
      this.dialogImportVisible = false
      if (spuList.length > 0) {
        const loading = this.$loading({
          lock: true,
          text: '正在创建商品...',
          spinner: 'el-icon-loading'
        })
        for (const spu of spuList) {
          try {
            await createProductApi(spu)
          } catch (e) {
            console.warn('Good import creation error:' + e)
          }
        }
        loading.close()
        await this.getListData()
      }
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    async onGoodsUpdateConfirmed(spuList) {
      this.dialogUpdateVisible = false
      if (spuList.length > 0) {
        const loading = this.$loading({
          lock: true,
          text: '正在更新商品...',
          spinner: 'el-icon-loading'
        })
        const maxNum = 100
        for (let begin = 0; begin < spuList.length; begin += maxNum) {
          const spuSlice = spuList.slice(begin, begin + maxNum)
          try {
            await batchUpdateProductsApi(spuSlice)
          } catch (e) {
            console.warn('Batch update products error:' + e)
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
          this.listLoading = true
          let warning = null
          if ('state' in params) {
            const stateList = this.productSelection.map(
              product => ({ id: product.id, state: params.state })
            )
            const ret = await batchUpdateStateApi(stateList)
            if (ret.code !== 200) {
              warning = '部分商品上架失败，请修改商品信息！'
            }
            delete params.state
          }
          if (!isEmpty(params)) {
            const updateList = this.productSelection.map(product => ({ id: product.id, ...params }))
            await batchUpdateProductsApi(updateList)
          }
          await this.getListData()
          if (warning !== null) {
            this.$message.warning(warning)
          }
        } catch (e) {
          console.warn('Product edit selection error:' + e)
        } finally {
          this.listLoading = false
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

<style scoped>
.thumb-image {
  object-fit: contain;
  width: 100%;
  height: 100%
}
</style>

