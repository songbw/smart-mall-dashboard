<template>
  <div>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button
          type="primary"
          size="mini"
          :disabled="viewOnly"
          @click="dialogSelectionVisible = true"
        >
          选择商品
        </el-button>
        <el-button
          size="mini"
          type="info"
          :disabled="viewOnly"
          @click="dialogImportVisible = true"
        >
          导入商品
        </el-button>
        <el-button size="mini" @click="handleExportGoods">
          导出商品
        </el-button>
      </div>
      <div v-if="skuIdList.length > 0" class="header-ops-container">
        <span>{{ `已选择${selectedItems.length}件商品` }}</span>
        <el-button
          type="text"
          style="margin-left: 10px"
          :disabled="viewOnly"
          @click="handleDeleteSelection"
        >
          删除
        </el-button>
      </div>
    </div>
    <el-table
      v-if="skuIdList.length > 0"
      ref="skuTable"
      v-loading="dataLoading"
      :data="skuPageList"
      style="width: 100%"
      height="450"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.intro }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-tooltip :open-delay="1000" content="删除" placement="top">
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              circle
              :disabled="viewOnly"
              @click="handleDeleteRow(scope.row.skuid)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="skuIdList.length > limit"
      :total="skuIdList.length"
      :auto-scroll="false"
      :page.sync="offset"
      :limit.sync="limit"
      :page-sizes="[20, 40, 80, 100]"
      @pagination="updatePageList"
    />
    <goods-selection-dialog
      :dialog-visible="dialogSelectionVisible"
      @onSelectionCancelled="onGoodsSelectionCancelled"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
  </div>
</template>

<script>
import concat from 'lodash/concat'
import difference from 'lodash/difference'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import Pagination from '@/components/Pagination'
import { searchProductsApi } from '@/api/products'

export default {
  name: 'CouponGoods',
  components: { GoodsSelectionDialog, GoodsImportDialog, Pagination },
  props: {
    skuIdList: {
      type: Array,
      default: function() {
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
      limit: 20,
      pageMounted: true
    }
  },
  watch: {
    skuIdList: function(newList, oldList) {
      this.handleFetchSkuInfo(newList)
    }
  },
  mounted() {
    this.pageMounted = true
    this.handleFetchSkuInfo(this.skuIdList)
  },
  beforeDestroy() {
    this.pageMounted = false
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
        for (const skuID of fetchList) {
          try {
            if (!this.pageMounted) {
              return
            }
            const response = await searchProductsApi({ offset: 1, limit: 10, skuid: skuID })
            const data = response.data.result
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
            console.warn('Coupon Goods: search error:' + skuID)
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
      import('@/utils/Export2Excel').then(excel => {
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
