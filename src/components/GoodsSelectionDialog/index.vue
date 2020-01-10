<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择商品"
    width="60%"
  >
    <el-form>
      <el-form-item v-if="!hasPromotion" label="商品类别">
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
    <el-form v-if="hasPromotion" inline>
      <el-button type="primary" @click="handleDialogPromotionQuery">
        获取促销活动商品
      </el-button>
    </el-form>
    <el-form v-else inline :model="dialogFilterForm" @submit.prevent.native="handleDialogFilterSearch">
      <el-form-item label="商品SKU">
        <span class="el-icon-warning-outline" style="font-size: 12px">以英文逗号分隔</span>
        <el-input
          v-model="filterSkus"
          :rows="3"
          resize="none"
          placeholder="商品SKU之间以英文逗号分隔，最多输入50个"
          type="textarea"
          label="http"
        />
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
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
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
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
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
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'
import CategorySelection from '@/components/CategorySelection'
import Pagination from '@/components/Pagination'
import { searchProductsApi } from '@/api/products'
import { getPromotionByIdApi } from '@/api/promotions'

export default {
  name: 'GoodsSelectionDialog',
  components: { CategorySelection, Pagination },
  props: {
    dialogVisible: {
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
      dialogFilterForm: {
        skus: [],
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
    filterSkus: {
      get() {
        return this.filterSkuString
      },
      set(newValue) {
        this.filterSkuString = newValue
        if (newValue.trim()) {
          this.dialogFilterForm.skus = newValue.trim().split(',')
            .map(item => item.trim())
            .filter(item => !isEmpty(item))
        } else {
          this.dialogFilterForm.skus = []
        }
      }
    },
    hasPromotion: {
      get() {
        return this.promotionId >= 0
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
      getPromotionByIdApi({ id: this.promotionId }).then(res => {
        const data = res.data.result
        this.dialogSkuData = data.promotionSkus
      }).catch(err => {
        console.log('handleDialogPromotionQuery:' + err)
      })
    },
    handleDialogFilterClear() {
      this.offset = 1
      this.dialogFilterForm.skus = []
      this.dialogFilterForm.query = ''
      this.firstCategoryValue = null
      this.secondCategoryValue = null
      this.thirdCategoryValue = null
    },
    async handleFilterSkuList() {
      this.dataLoading = true
      const skus = uniq(this.dialogFilterForm.skus)
      for (const skuId of skus) {
        const params = {
          offset: 1,
          limit: this.limit,
          state: 1,
          skuid: skuId.trim()
        }
        try {
          const { code, data } = await searchProductsApi(params)
          if (code === 200) {
            const products = data.result.list
            for (const product of products) {
              const index = this.dialogSkuData.findIndex(item => item.mpu === product.mpu)
              if (index < 0 && this.isProductValid(product)) {
                this.dialogSkuData.push(product)
              }
            }
          }
        } catch (e) {
          console.warn('Good selection search error:' + e)
        }
      }
      this.total = this.dialogSkuData.length
      this.dataLoading = false
    },
    handleDialogFilterSearch() {
      const categoryId = this.presetThirdCategory || this.thirdCategoryValue ||
        this.presetSecondCategory || this.secondCategoryValue ||
        this.presetFirstCategory || this.firstCategoryValue
      if (this.dialogFilterForm.skus.length > 0) {
        this.handleFilterSkuList()
      } else if (this.dialogFilterForm.query !== '' || categoryId !== null) {
        const params = {
          offset: this.offset,
          limit: this.limit,
          state: 1
        }
        if (this.dialogFilterForm.query !== '') {
          params.query = this.dialogFilterForm.query
        }
        if (categoryId != null) {
          params.categoryID = categoryId
        }
        if (this.merchantId > 0) {
          params.merchantId = this.merchantId
        }
        this.dataLoading = true
        searchProductsApi(params).then(response => {
          const data = response.data.result
          if (data.total > 0) {
            this.dialogSkuData = data.list.filter(item => {
              return this.isProductValid(item)
            })
          } else {
            this.dialogSkuData = []
          }
          this.total = data.total
        }).catch(error => {
          console.log('getProductInfo:' + error)
          this.dialogSkuData = []
          this.total = 0
        }).finally(() => {
          this.dataLoading = false
        })
      } else {
        this.dialogSkuData = []
        this.total = 0
      }
    },
    handleSingleSelectionChange(row) {
      this.dialogSelectedItems = []
      if (row) {
        const selectItem = {
          skuid: row.skuid,
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
            skuid: item.skuid,
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
