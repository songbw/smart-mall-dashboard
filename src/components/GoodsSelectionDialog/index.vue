<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择商品"
    top="5vh"
    width="70%"
  >
    <el-form v-if="!hasPromotion">
      <el-form-item label="商品类别">
        <category-selection
          :first-selectable="presetFirstCategory === null"
          :first-value="presetFirstCategory || firstCategoryValue"
          :seond-selectable="presetSecondCategory === null"
          :second-value="presetSecondCategory || secondCategoryValue"
          :third-selectable="presetThirdCategory === null"
          :third-value="presetThirdCategory || thirdCategoryValue"
          @changed="handleCategorySelectionChanged"
        />
      </el-form-item>
    </el-form>
    <el-form v-if="!hasPromotion" inline>
      <el-form-item v-if="hasVendorPermission" label="供应商名">
        <vendor-selection
          :vendor-id="dialogFilterForm.merchantId"
          :filter-renter="platformRenterId"
          @changed="handleVendorChanged"
        />
      </el-form-item>
      <el-form-item label="商品MPU">
        <el-input
          v-model="filterMpus"
          placeholder="商品MPU之间以英文逗号分隔，最多输入50个"
          maxlength="500"
          style="width: 500px"
        />
      </el-form-item>
    </el-form>
    <el-form v-if="hasPromotion" inline>
      <el-button :loading="dataLoading" type="primary" @click="handleDialogPromotionQuery">
        获取促销活动商品
      </el-button>
    </el-form>
    <el-form v-else inline :model="dialogFilterForm" @submit.prevent.native="handleDialogFilterSearch">
      <el-form-item label="价格区间">
        <div>
          <el-input-number
            v-model="dialogFilterForm.minPrice"
            :min="0"
            :max="dialogFilterForm.maxPrice"
            step-strictly
          />
          <span> - </span>
          <el-input-number
            v-model="dialogFilterForm.maxPrice"
            :min="dialogFilterForm.minPrice"
            :max="1000000"
            step-strictly
          />
        </div>
      </el-form-item>
      <el-form-item label="商品名">
        <el-input v-model="dialogFilterForm.query" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleDialogFilterSearch">
          查询
        </el-button>
        <el-button @click="handleDialogFilterClear">
          清空
        </el-button>
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <span>{{ `已选择${dialogSelectedItems.length}件商品` }}</span>
    </div>
    <el-table
      v-if="singleSelection"
      ref="dialogSkuTable"
      v-loading="dataLoading"
      :data="dialogSkuData"
      style="width: 100%"
      height="250"
      border
      highlight-current-row
      @current-change="handleSingleSelectionChange"
    >
      <el-table-column label="已选" align="center" width="55">
        <template slot-scope="scope">
          <el-checkbox :value="dialogSelectedItems.length > 0 && dialogSelectedItems[0].mpu === scope.row.mpu" />
        </template>
      </el-table-column>
      <el-table-column label="商品MPU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.mpu }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasPromotion" label="促销价(元)" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.discount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品详情" align="center" width="80">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDialogViewDetail(scope.row.mpu)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-else
      ref="dialogSkuTable"
      v-loading="dataLoading"
      :data="dialogSkuData"
      style="width: 100%"
      height="250"
      border
      @selection-change="handleDialogSelectionChange"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
      />
      <el-table-column label="商品MPU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.mpu }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasPromotion" label="促销价(元)" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.discount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品详情" align="center" width="80">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDialogViewDetail(scope.row.mpu)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="!hasPromotion"
      :auto-scroll="false"
      :total="total"
      :page.sync="offset"
      :limit.sync="limit"
      @pagination="getContentData"
    />
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import CategorySelection from '@/components/CategorySelection'
import Pagination from '@/components/Pagination'
import VendorSelection from '@/components/VendorSelection'
import { getProductsByMpuListApi, searchProductsApi } from '@/api/products'
import { getPromotionByIdApi } from '@/api/promotions'
import { ProductPermissions } from '@/utils/role-permissions'

const productMinPrice = 0
const productMaxPrice = 1000000
const vendorAoyi = 2

export default {
  name: 'GoodsSelectionDialog',
  components: { CategorySelection, Pagination, VendorSelection },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    useDefaultSku: {
      type: Boolean,
      default: false
    },
    singleSelection: {
      type: Boolean,
      default: false
    },
    promotionId: {
      type: Number,
      default: -1
    },
    merchantId: {
      type: Number,
      default: 0
    },
    presetFirstCategory: {
      type: Number,
      default: null
    },
    presetSecondCategory: {
      type: Number,
      default: null
    },
    presetThirdCategory: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      filterSkuString: '',
      renterCompanyId: '',
      dialogFilterForm: {
        merchantId: '',
        mpuPrefix: null,
        minPrice: productMinPrice,
        maxPrice: productMaxPrice,
        mpus: [],
        query: ''
      },
      total: 0,
      offset: 1,
      limit: 40,
      dataLoading: false,
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null,
      dialogSkuData: [],
      dialogSelectedItems: []
    }
  },
  computed: {
    ...mapGetters({
      renterId: 'renterId',
      vendorId: 'vendorId',
      validAppList: 'validAppList',
      platformAppId: 'platformAppId',
      userPermissions: 'userPermissions'
    }),
    hasRenterPermission() {
      return this.userPermissions.includes(ProductPermissions.renter)
    },
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    },
    platformRenterId() {
      const platform = this.validAppList.find(item => item.appId === this.platformAppId)
      return platform ? platform.renterId : this.renterId
    },
    filterMpus: {
      get() {
        return this.filterSkuString
      },
      set(newValue) {
        this.filterSkuString = newValue
        if (newValue.trim()) {
          this.dialogFilterForm.mpus = newValue.trim()
            .split(',')
            .map(item => item.trim())
            .filter(item => !isEmpty(item))
        } else {
          this.dialogFilterForm.mpus = []
        }
      }
    },
    hasPromotion: {
      get() {
        return this.promotionId >= 0
      }
    },
    mpuPrefixOptions() {
      let vendorId = -1
      if (this.hasVendorPermission) {
        if (!isEmpty(this.dialogFilterForm.merchantId)) {
          vendorId = parseInt(this.dialogFilterForm.merchantId)
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
    }
  },
  methods: {
    getContentData() {
      this.handleDialogFilterSearch()
    },
    isProductValid(product) {
      const price = Number.parseFloat(product.price)
      return Number.isNaN(price) === false
    },
    handleDialogPromotionQuery() {
      this.dataLoading = true
      getPromotionByIdApi({ id: this.promotionId }).then(res => {
        if (res.code === 200) {
          const data = res.data.result
          this.dialogSkuData = this.parseSkuList(data.promotionSkus)
        }
      }).catch(err => {
        console.log('handleDialogPromotionQuery:' + err)
      }).finally(() => {
        this.dataLoading = false
      })
    },
    handleVendorChanged(id) {
      this.dialogFilterForm.merchantId = id
      this.dialogFilterForm.mpuPrefix = null
    },
    handleDialogFilterClear() {
      this.offset = 1
      this.filterSkuString = ''
      this.dialogFilterForm.merchantId = ''
      this.dialogFilterForm.mpuPrefix = null
      this.dialogFilterForm.mpus = []
      this.dialogFilterForm.query = ''
      this.firstCategoryValue = null
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
      this.dialogSkuData = []
    },
    async getProductsByMpuList(fetchList) {
      let mpuList = []
      for (let begin = 0; begin < fetchList.length; begin += 50) {
        const params = {
          mpuIdList: fetchList.slice(begin, begin + 50).join(',')
        }
        try {
          const { code, data } = await getProductsByMpuListApi(params)
          if (code === 200 && data.result.length > 0) {
            mpuList = mpuList.concat(data.result)
          }
        } catch (err) {
          console.warn('Select Goods: search error:' + err)
        }
      }
      return mpuList
    },
    parseSkuList(list) {
      const centToYuan = cent => cent > 0 ? (cent / 100).toFixed(2) : null
      const skuList = []
      for (const spu of list) {
        const prod = {
          id: spu.id,
          mpu: spu.mpu,
          image: spu.image,
          name: spu.name,
          merchantId: spu.merchantId,
          floorPrice: spu.floorPrice,
          brand: spu.brand
        }
        if (this.hasPromotion) {
          prod.discount = spu.discount
        }
        if (Array.isArray(spu.skuList) && spu.skuList.length > 0) {
          if (this.useDefaultSku) {
            const sku = spu.skuList[0]
            skuList.push({
              skuId: sku.code,
              skuIndex: 0,
              skuNum: spu.skuList.length,
              skuList: spu.skuList.map(
                item => ({ skuId: item.code, state: sku.status.toString(), price: centToYuan(item.price) })),
              state: sku.status.toString(),
              price: centToYuan(sku.price),
              ...prod
            })
          } else {
            for (const [index, sku] of spu.skuList.entries()) {
              skuList.push({
                skuId: sku.code,
                skuIndex: index,
                skuNum: spu.skuList.length,
                state: sku.status.toString(),
                price: centToYuan(sku.price),
                ...prod
              })
            }
          }
        } else {
          skuList.push({
            skuId: spu.skuid,
            skuIndex: 0,
            skuNum: 1,
            state: spu.state,
            price: spu.price,
            ...prod
          })
        }
      }
      return skuList
    },
    async handleFilterSkuList() {
      this.dataLoading = true
      const mpus = uniq(this.dialogFilterForm.mpus)
      const spuList = await this.getProductsByMpuList(mpus)
      const skuList = this.parseSkuList(spuList)
      for (const product of skuList) {
        const index = this.dialogSkuData.findIndex(
          item => item.mpu === product.mpu && item.skuId === product.skuId)
        if (index < 0 && this.isProductValid(product)) {
          this.dialogSkuData.push(product)
        }
      }
      this.total = this.dialogSkuData.length
      this.dataLoading = false
    },
    getFilterParams() {
      const params = {
        appId: this.platformAppId
      }
      const categoryId = this.presetThirdCategory || this.thirdCategoryValue ||
        this.presetSecondCategory || this.secondCategoryValue ||
        this.presetFirstCategory || this.firstCategoryValue

      if (this.dialogFilterForm.query !== '') {
        params.query = this.dialogFilterForm.query
      }
      if (categoryId != null) {
        params.categoryId = categoryId
      }
      if (this.hasRenterPermission) {
        params.renterId = this.platformRenterId
      } else {
        params.renterId = this.renterId
      }
      if (this.merchantId > 0) {
        params.merchantId = this.merchantId
      } else {
        if (this.hasVendorPermission) {
          if (!isEmpty(this.dialogFilterForm.merchantId)) {
            params.merchantId = Number.parseInt(this.dialogFilterForm.merchantId)
          }
        } else {
          params.merchantId = this.vendorId
        }
      }
      if (this.dialogFilterForm.mpuPrefix) {
        params.mpuPrefix = this.dialogFilterForm.mpuPrefix
      }
      if (this.dialogFilterForm.minPrice > productMinPrice) {
        params.minPrice = this.dialogFilterForm.minPrice
      }
      if (this.dialogFilterForm.maxPrice !== productMaxPrice &&
        this.dialogFilterForm.maxPrice > this.dialogFilterForm.minPrice) {
        params.maxPrice = this.dialogFilterForm.maxPrice
      }
      return params
    },
    async handleDialogFilterSearch() {
      const filterParams = this.getFilterParams()
      if (this.dialogFilterForm.mpus.length > 0) {
        this.handleFilterSkuList()
      } else if (!isEmpty(filterParams)) {
        let list = []
        let total = 0
        const params = {
          offset: this.offset,
          limit: this.limit,
          state: 1,
          ...filterParams
        }
        this.dataLoading = true
        try {
          const { code, data } = await searchProductsApi(params)
          if (code === 200) {
            total = data.result.total
            list = Array.isArray(data.result.list) ? data.result.list : []
          }
        } catch (e) {
          console.warn('Select product error:' + e)
        } finally {
          this.total = total
          this.dialogSkuData = this.parseSkuList(list)
          this.dataLoading = false
        }
      } else {
        this.dialogSkuData = []
        this.total = 0
      }
    },
    handleSingleSelectionChange(row) {
      this.dialogSelectedItems = []
      if (row) {
        const selectItem = {
          skuId: row.skuId,
          mpu: row.mpu,
          price: row.price,
          floorPrice: row.floorPrice,
          imagePath: row.image,
          brand: row.brand,
          name: row.name,
          intro: ''
        }
        if (this.hasPromotion) {
          selectItem.discount = row.discount
        }
        this.dialogSelectedItems.push(selectItem)
      }
    },
    handleDialogSelectionChange(val) {
      if (val.length > 0) {
        this.dialogSelectedItems = val.map(item => {
          const selectItem = {
            skuId: item.skuId,
            mpu: item.mpu,
            price: item.price,
            floorPrice: item.floorPrice,
            imagePath: item.image,
            brand: item.brand,
            name: item.name,
            intro: ''
          }
          if (this.hasPromotion) {
            selectItem.discount = item.discount
          }
          return selectItem
        })
      } else {
        this.dialogSelectedItems = []
      }
    },
    handleDialogViewDetail(mpu) {
      const path = this.$router.resolve({
        name: 'ViewProduct',
        params: { mpu: mpu }
      })
      window.open(path.href, '_blank')
    },
    handleDialogCancel() {
      this.clearDialogData()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      if (this.dialogSelectedItems.length > 0) {
        this.$emit('onSelectionConfirmed', Array.from(this.dialogSelectedItems))
        this.clearDialogData()
      } else {
        this.$message.warning('请选择所需的商品！')
      }
    },
    clearDialogData() {
      this.total = 0
      this.offset = 1
      this.dialogSelectedItems = []
      this.dialogSkuData = []
      this.firstCategoryValue = null
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
      this.handleDialogFilterClear()
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
    }
  }
}
</script>

<style scoped>

</style>
