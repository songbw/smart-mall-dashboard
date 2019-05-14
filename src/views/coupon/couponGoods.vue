<template>
  <div>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button type="primary" size="mini" :disabled="viewOnly"
                   @click="dialogSelectionVisible = true">
          {{ $t('aggregation_customization_goods_select_title') }}
        </el-button>
        <el-button size="mini" type="info" :disabled="viewOnly"
                   @click="dialogImportVisible = true">
          {{ $t('aggregation_customization_goods_import_title') }}
        </el-button>
        <el-button size="mini" @click="handleExportGoods">
          导出商品
        </el-button>
      </div>
      <div v-if="skuIdList.length > 0" class="header-ops-container">
        <span>{{ $t('aggregation_customization_goods_selected_text', {count: selectedItems.length}) }}</span>
        <el-button type="text" style="margin-left: 10px" :disabled="viewOnly"
                   @click="handleDeleteSelection">
          {{ $t('confirm_button_del_title') }}
        </el-button>
      </div>
    </div>
    <el-table
      ref="skuTable"
      v-if="skuIdList.length > 0"
      v-loading="dataLoading"
      :data="skuPageList"
      style="width: 100%"
      height="450"
      border
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_name_title')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.intro }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_price_title')" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_ops_title')" align="center" width="100">
        <template slot-scope="scope">
          <el-tooltip :open-delay="1000" :content="$t('confirm_button_del_title')" placement="top">
            <el-button icon="el-icon-delete" type="danger" size="mini" circle :disabled="viewOnly"
                       @click="handleDeleteRow(scope.row.skuid)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-if="skuIdList.length > limit" :total="skuIdList.length" :autoScroll="false"
                :page.sync="offset" :limit.sync="limit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="updatePageList" />
    <goods-selection :dialog-visible="dialogSelectionVisible"
                     @onSelectionCancelled="onGoodsSelectionCancelled"
                     @onSelectionConfirmed="onGoodsSelectionConfirmed" />
    <goods-import :dialog-visible="dialogImportVisible"
                  @onSelectionCancelled="onGoodsImportCancelled"
                  @onSelectionConfirmed="onGoodsImportConfirmed" />
  </div>
</template>

<script>
  import concat from 'lodash/concat'
  import difference from 'lodash/difference'
  import filter from 'lodash/filter'
  import includes from 'lodash/includes'
  import findIndex from 'lodash/findIndex'
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'
  import GoodsImport from '@/components/Goods/goodsImportDialog'
  import Pagination from '@/components/Pagination'
  import { searchProductInfo } from '@/api/products'

  export default {
    name: 'CouponGoods',
    components: { GoodsSelection, GoodsImport, Pagination },
    props: {
      skuIdList: {
        type: Array,
        default: function () {
          return []
        }
      },
      viewOnly: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        dialogImportVisible: false,
        dialogSelectionVisible: false,
        dataLoading: false,
        skuInfoList: [],
        selectedItems: [],
        skuPageList: [],
        offset: 1,
        limit: 20
      }
    },
    watch: {
      skuIdList: function (newList, oldList) {
        this.handleFetchSkuInfo(newList)
      }
    },
    mounted() {
      this.handleFetchSkuInfo(this.skuIdList)
    },
    methods: {
      isProductValid(product) {
        const price = Number.parseFloat(product.price)
        const image = product.image || product.imageExtend
        return !(Number.isNaN(price) || image === null)
      },
      updatePageList() {
        const begin = (this.offset - 1) * this.limit
        const end = begin + this.limit
        this.skuPageList = this.skuInfoList.slice(begin, end)
      },
      async handleFetchSkuInfo(skuIdList) {
        this.skuInfoList = filter(this.skuInfoList, item => includes(skuIdList, item.skuid))
        const fetchList = filter(skuIdList, skuId => findIndex(this.skuInfoList, item => item.skuid === skuId) < 0)
        if (fetchList.length > 0) {
          this.dataLoading = true
          for (let skuID of fetchList) {
            try {
              const response = await searchProductInfo({ offset: 1, limit: 10, skuid: skuID })
              const data = response.result
              if (data.total > 0) {
                const product = data.list[0]
                if (this.isProductValid(product)) {
                  const item = {
                    skuid: product.skuid,
                    price: product.price,
                    imagePath: product.image,
                    intro: product.name
                  }
                  this.skuInfoList.push(item)
                }
              }
            } catch (err) {
              this.$log.warn('Coupon Goods: search error:' + skuID)
            }
          }
          this.dataLoading = false
        }
        this.updatePageList()
      },
      handleSelectionChange(val) {
        this.selectedItems = val
      },
      handleDeleteSelection() {
        if (this.selectedItems.length > 0) {
          this.$emit('contentDelete', this.selectedItems.map(item => item.skuid))
          this.$refs.skuTable.clearSelection()
        }
      },
      handleDeleteRow(skuid) {
        this.$emit('contentDelete', [skuid])
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        this.addContentSkus(skus)
      },
      onGoodsSelectionCancelled() {
        this.dialogSelectionVisible = false
      },
      onGoodsImportConfirmed(skus) {
        this.dialogImportVisible = false
        this.addContentSkus(skus)
      },
      onGoodsImportCancelled() {
        this.dialogImportVisible = false
      },
      addContentSkus(skus) {
        const skuids = skus.map(item => item.skuid)
        const filterSkuids = difference(skuids, this.skuIdList)
        if (filterSkuids.length > 0) {
          if (skuids.length === filterSkuids.length) {
            this.skuInfoList = concat(this.skuInfoList, skus)
          } else {
            const filterInfoList = filter(skus, item => includes(filterSkuids, item.skuid))
            this.skuInfoList = concat(this.skuInfoList, filterInfoList)
          }
          this.$emit('contentAdd', filterSkuids)
          this.offset = 1
        }
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      handleExportGoods() {
        import('@/utils/exportToExcel').then(excel => {
          const tHeader = ['skuID']
          const filterVal = ['skuid']
          const list = this.skuInfoList
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: `商品列表`
          })
        })
      }
    }
  }
</script>

<style scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    margin: 10px 20px;
  }

  .header-ops-container {
    display: flex;
    align-items: center;
  }
</style>
