<template>
  <el-dialog :visible="dialogVisible"
             :title="$t('aggregation_customization_goods_select_title')"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             width="60%"
             append-to-body
             center>
    <el-form :inline="true" :model="dialogFilterForm">
      <el-form-item :label="$t('product_table_skuid_title')">
        <el-input :autosize="{ minRows: 3, maxRows: 3}"
                  :placeholder="$t('aggregation_customization_goods_select_filter_placeholder')"
                  v-model="filterSkus" type="textarea" />
      </el-form-item>
      <el-form-item :label="$t('product_table_name_title')">
        <el-input v-model="dialogFilterForm.query" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleDialogFilterSearch">
          {{ $t('confirm_button_search_title') }}
        </el-button>
        <el-button @click="handleDialogFilterClear">
          {{ $t('confirm_button_clear_title') }}
        </el-button>
        <el-button v-if="hasPromotion" type="primary" @click="handleDialogPromotionQuery">
          获取促销活动商品
        </el-button>
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <span>{{ $t('aggregation_customization_goods_selected_text', {count: dialogSelectedItems.length}) }}</span>
    </div>
    <el-table
      v-loading="dataLoading"
      ref="dialogSkuTable"
      :data="dialogSkuData"
      style="width: 100%"
      height="250"
      border
      @selection-change="handleDialogSelectionChange">
      <el-table-column
        align="center"
        type="selection"
        width="55" />
      <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_name_title')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.brand + ' ' + scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_price_title')" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasPromotion" label="减价(元)" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.discount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_detail_edit_title')" align="center" width="80">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDialogViewDetail(scope.row.skuid)">
            {{ $t('aggregation_table_ops_view_title') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-if="total > limit"
                :auto-scroll="false"
                :total="total"
                :page.sync="offset" :limit.sync="limit"
                :page-sizes="[20, 50, 80, 100]"
                @pagination="getContentData" />
    <span slot="footer">
      <el-button @click="handleDialogCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
      <el-button type="primary" @click="handleDialogConfirm">{{ $t('confirm_button_ok_title') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import isEmpty from 'lodash/isEmpty'
  import Pagination from '@/components/Pagination'
  import { searchProductInfo } from '@/api/products'
  import { getPromotionByIdApi } from '@/api/promotions'

  export default {
    name: 'GoodsSelectionDialog',
    components: { Pagination },
    props: {
      dialogVisible: {
        type: Boolean,
        default: false
      },
      promotionId: {
        type: Number,
        default: -1
      }
    },
    data() {
      return {
        dialogFilterForm: {
          skus: [],
          query: ''
        },
        total: 0,
        offset: 1,
        limit: 50,
        dataLoading: false,
        dialogSkuData: [],
        dialogSelectedItems: []
      }
    },
    computed: {
      filterSkus: {
        get() {
          return this.dialogFilterForm.skus.join(',')
        },
        set(newValue) {
          if (newValue.trim()) {
            this.dialogFilterForm.skus = Array.from(newValue.split(','))
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
        const image = product.image || product.imageExtend
        return !(Number.isNaN(price) || isEmpty(image))
      },
      handleDialogPromotionQuery() {
        getPromotionByIdApi({ id: this.promotionId }).then(res => {
          const data = res.result
          this.dialogSkuData = data.promotionSkus
        }).catch(err => {
          console.log('handleDialogPromotionQuery:' + err)
        })
      },
      handleDialogFilterClear() {
        this.offset = 1
        this.dialogFilterForm.skus = []
        this.dialogFilterForm.query = ''
      },
      handleDialogFilterSearch() {
        if (this.dialogFilterForm.skus.length > 0) {
          this.dialogSkuData = []
          this.dialogFilterForm.skus.forEach(skuID => {
            if (skuID.trim()) {
              const params = {
                offset: 1,
                limit: 1,
                state: 1,
                skuid: skuID
              }
              this.dataLoading = true
              searchProductInfo(params).then(response => {
                const data = response.result
                if (data.total > 0) {
                  const product = data.list[0]
                  if (this.isProductValid(product)) {
                    this.dialogSkuData.push(product)
                  }
                }
                this.total = this.dialogSkuData.length
              }).catch(error => {
                console.log('getProductInfo:' + error)
              }).finally(() => {
                this.dataLoading = false
              })
            }
          })
        } else if (this.dialogFilterForm.query !== '') {
          const params = {
            offset: this.offset,
            limit: this.limit,
            state: 1,
            query: this.dialogFilterForm.query
          }
          this.dataLoading = true
          searchProductInfo(params).then(response => {
            const data = response.result
            if (data.total > 0) {
              this.dialogSkuData = data.list.filter(item => {
                return this.isProductValid(item)
              })
            }
            this.total = data.total
          }).catch(error => {
            console.log('getProductInfo:' + error)
          }).finally(() => {
            this.dataLoading = false
          })
        } else {
          this.dialogSkuData = []
          this.total = 0
        }
      },
      handleDialogSelectionChange(val) {
        if (val.length > 0) {
          this.dialogSelectedItems = val.map(item => {
            const selectItem = {
              skuid: item.skuid,
              price: item.price,
              imagePath: item.image,
              intro: item.name
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
      handleDialogViewDetail(skuID) {
        const path = this.$router.resolve({
          name: 'ProductDetail',
          params: { skuid: skuID }
        })
        window.open(path.href, '_blank')
      },
      handleDialogCancel() {
        this.clearDialogData()
        this.$emit('onSelectionCancelled')
      },
      handleDialogConfirm() {
        this.$emit('onSelectionConfirmed', Array.from(this.dialogSelectedItems))
        this.clearDialogData()
      },
      clearDialogData() {
        this.total = 0
        this.offset = 1
        this.dialogSelectedItems = []
        this.dialogSkuData = []
        this.handleDialogFilterClear()
      }
    }
  }
</script>

<style scoped>

</style>
