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
          添加商品
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
      <div v-if="mpuList.length > 0" class="header-ops-container">
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
      v-if="mpuList.length > 0"
      ref="skuTable"
      v-loading="dataLoading"
      :data="skuPageList"
      style="width: 100%"
      height="450"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="商品MPU" align="center" width="150">
        <template slot-scope="scope">
          <el-link :href="'/goods/viewProduct/' + scope.row.mpu" target="_blank" type="primary">
            {{ scope.row.mpu }}
          </el-link>
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
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-tooltip :open-delay="1000" content="删除" placement="top">
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              circle
              :disabled="viewOnly"
              @click="handleDeleteRow(scope.row.mpu)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="mpuList.length > limit"
      :total="mpuList.length"
      :auto-scroll="false"
      :page.sync="offset"
      :limit.sync="limit"
      @pagination="updatePageList"
    />
    <goods-selection-dialog
      :merchant-id="merchantId"
      :dialog-visible="dialogSelectionVisible"
      :preset-first-category="firstClassCategory"
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
import { getProductsByMpuListApi } from '@/api/products'

export default {
  name: 'CouponGoods',
  components: { GoodsSelectionDialog, GoodsImportDialog, Pagination },
  props: {
    mpuList: {
      type: Array,
      default: function() {
        return []
      }
    },
    viewOnly: {
      type: Boolean,
      default: true
    },
    merchantId: {
      type: Number,
      default: 0
    },
    firstClassCategory: {
      type: Number,
      default: null
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
    mpuList: function(newList, oldList) {
      this.handleFetchSkuInfo(newList)
    }
  },
  mounted() {
    this.pageMounted = true
    this.handleFetchSkuInfo(this.mpuList)
  },
  beforeDestroy() {
    this.pageMounted = false
  },
  methods: {
    isProductValid(product) {
      const price = Number.parseFloat(product.price)
      return !Number.isNaN(price)
    },
    updatePageList() {
      const begin = (this.offset - 1) * this.limit
      const end = begin + this.limit
      this.skuPageList = this.skuInfoList.slice(begin, end)
    },
    async handleFetchSkuInfo(mpuList) {
      this.skuInfoList = filter(this.skuInfoList, item => includes(mpuList, item.mpu))
      const fetchList = filter(mpuList, mpu => findIndex(this.skuInfoList, item => item.mpu === mpu) < 0)
      if (fetchList.length > 0) {
        this.dataLoading = true
        for (let begin = 0; begin < fetchList.length; begin += 50) {
          const params = {
            mpuIdList: fetchList.slice(begin, begin + 50).join(',')
          }
          try {
            if (!this.pageMounted) {
              return
            }
            const response = await getProductsByMpuListApi(params)
            const data = response.data.result
            if (data.length > 0) {
              data.forEach(product => {
                if (this.isProductValid(product)) {
                  const item = {
                    skuid: product.skuid,
                    mpu: product.mpu,
                    price: product.price,
                    imagePath: product.image,
                    name: product.name,
                    intro: ''
                  }
                  this.skuInfoList.push(item)
                }
              })
            }
          } catch (err) {
            console.warn('Coupon Goods: search error:' + err)
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
        this.$emit('contentDelete', this.selectedItems.map(item => item.mpu))
        this.$refs.skuTable.clearSelection()
      }
    },
    handleDeleteRow(mpu) {
      this.$emit('contentDelete', [mpu])
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
      const mpus = skus.map(item => item.mpu)
      const filterMpus = difference(mpus, this.mpuList)
      if (filterMpus.length > 0) {
        if (mpus.length === filterMpus.length) {
          this.skuInfoList = concat(this.skuInfoList, skus)
        } else {
          const filterInfoList = filter(skus, item => includes(filterMpus, item.mpu))
          this.skuInfoList = concat(this.skuInfoList, filterInfoList)
        }
        this.$emit('contentAdd', filterMpus)
        this.offset = 1
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    handleExportGoods() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['商品MPU']
        const filterVal = ['mpu']
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
