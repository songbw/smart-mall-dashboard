<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择热销商品"
    top="5vh"
    width="70%"
  >
    <el-form @submit.prevent.native="handleDialogFilterSearch">
      <el-form-item label="商品类别">
        <category-selection
          :first-selectable="presetFirstCategory === null"
          :first-value="presetFirstCategory || firstCategoryValue"
          :second-value="secondCategoryValue"
          :third-value="thirdCategoryValue"
          @changed="handleCategorySelectionChanged"
        />
      </el-form-item>
    </el-form>
    <el-form inline @submit.prevent.native="handleDialogFilterSearch">
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="saleDates"
          type="daterange"
          start-placeholder="选择查询开始日期"
          end-placeholder="选择查询结束日期"
          value-format="yyyy-MM-dd"
        />
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
      ref="dialogSkuTable"
      v-loading="dataLoading"
      :data="dialogSkuData"
      style="width: 100%"
      height="350"
      border
      @selection-change="handleDialogSelectionChange"
    >
      <el-table-column
        :selectable="onRowSelectable"
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
      <el-table-column label="商品状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.state | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售数量" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.saleCount }}</span>
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
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import CategorySelection from '@/components/CategorySelection'
import { getProductsByMpuListApi } from '@/api/products'
import { getBestSellingListApi } from '@/api/orders'
import {
  product_state_off_shelves,
  product_state_on_sale,
  ProductStateOptions,
  role_renter_name,
  role_renter_op_name
} from '@/utils/constants'
import { floatToFixed } from '@/utils'

export default {
  name: 'BestSellingSelectionDialog',
  components: { CategorySelection },
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
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    useDefaultSku: {
      type: Boolean,
      default: false
    },
    presetFirstCategory: {
      type: Number,
      default: null
    },
    skuCount: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      total: 0,
      dataLoading: false,
      saleDates: null,
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null,
      dialogSkuData: [],
      dialogSelectedItems: []
    }
  },
  computed: {
    ...mapGetters({
      platformAppId: 'platformAppId',
      userRole: 'userRole'
    }),
    isRenterAdminOrOp() {
      return this.userRole === role_renter_op_name || this.userRole === role_renter_name
    }
  },
  methods: {
    isProductValid(product) {
      const price = Number.parseFloat(product.price)
      return Number.isNaN(price) === false
    },
    handleDialogFilterClear() {
      this.saleDates = null
      this.firstCategoryValue = null
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
      this.dialogSkuData = []
    },
    getRenterSpuState(spu) {
      if (this.isRenterAdminOrOp) {
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
      if (this.isRenterAdminOrOp) {
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
      if (this.isRenterAdminOrOp) {
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
      if (this.isRenterAdminOrOp) {
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
        const renterState = this.getRenterSpuState(spu)
        const prod = {
          id: spu.id,
          mpu: spu.mpu,
          image: spu.image,
          name: spu.name,
          merchantId: spu.merchantId,
          floorPrice: spu.floorPrice,
          brand: spu.brand,
          saleCount: spu.saleCount
        }
        if (this.hasPromotion) {
          prod.discount = spu.discount
        }
        if (Array.isArray(spu.skuList) && spu.skuList.length > 0) {
          if (this.useDefaultSku) {
            const sku = spu.skuList[0]
            const skuState = this.getRenterSkuState(parseInt(renterState), sku)
            const skuPrice = centToYuan(this.getRenterSkuPrice(sku))
            skuList.push({
              skuId: sku.code,
              skuIndex: 0,
              skuNum: spu.skuList.length,
              skuList: spu.skuList.map(
                item => ({ skuId: item.code, state: skuState, price: skuPrice })),
              state: skuState,
              price: skuPrice,
              ...prod
            })
          } else {
            for (const [index, sku] of spu.skuList.entries()) {
              skuList.push({
                skuId: sku.code,
                skuIndex: index,
                skuNum: spu.skuList.length,
                state: this.getRenterSkuState(renterState, sku),
                price: centToYuan(this.getRenterSkuPrice(sku)),
                ...prod
              })
            }
          }
        } else {
          skuList.push({
            skuId: spu.skuid,
            skuIndex: 0,
            skuNum: 1,
            state: renterState,
            price: this.getRenterSpuPrice(spu),
            ...prod
          })
        }
      }
      return skuList
    },
    getFilterParams() {
      const params = {
        appId: this.platformAppId,
        pageSize: this.skuCount
      }
      const categoryId = this.thirdCategoryValue || this.secondCategoryValue ||
        this.presetFirstCategory || this.firstCategoryValue || null

      if (categoryId !== null) {
        params.category = categoryId
      }

      if (this.saleDates && Array.isArray(this.saleDates)) {
        params.startTime = this.saleDates[0]
        params.endTime = this.saleDates[1]
      }

      return params
    },
    async handleDialogFilterSearch() {
      const filterParams = this.getFilterParams()
      let list = []
      let total = 0
      this.dataLoading = true
      try {
        const { code, data } = await getBestSellingListApi(filterParams)
        if (code === 200 && Array.isArray(data)) {
          total = data.length
          list = data
        }
      } catch (e) {
        console.warn('Select product error:' + e)
      } finally {
        this.total = total
        this.dialogSkuData = this.parseSkuList(list)
        this.dataLoading = false
      }
    },
    onRowSelectable(row) {
      const state = row.state
      const value = typeof state === 'string' ? Number.parseInt(state) : state
      return value === product_state_on_sale
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
            saleCount: item.saleCount,
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
      this.dialogSelectedItems = []
      this.dialogSkuData = []
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
