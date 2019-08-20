<template>
  <el-row style="margin-bottom: 20px">
    <el-col :span="24">
      <el-card shadow="never">
        <div slot="header">
          <span class="card-header-text">子订单信息</span>
        </div>
        <el-table
          ref="SkuTable"
          :data="skuList"
          style="width: 100%"
          border
          default-expand-all
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <div style="display: flex;justify-content: space-between">
                <div><span class="item-label">子订单状态：</span> {{ getSubStatus(props.row) | statusFilter }}</div>
                <div><span class="item-label">子订单号：</span> {{ props.row.subOrderId }}</div>
              </div>
              <div v-if="logisticsTimeline.length" style="margin-top: 10px">
                <div class="item-label">物流信息：</div>
                <el-timeline style="margin-top: 10px">
                  <el-timeline-item
                    v-for="item in logisticsTimeline"
                    :key="item.time"
                    :timestamp="item.ftime"
                  >
                    {{ item.context }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品SKU" align="center" width="120">
            <template slot-scope="scope">
              <el-link :href="'/goods/viewProduct/' + scope.row.mpu" type="primary" target="_blank">
                {{ scope.row.skuId }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品图" align="center" width="100">
            <template slot-scope="scope">
              <el-image :src="scope.row.image" fit="contain" lazy />
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" width="50">
            <template slot-scope="scope">
              <span>{{ scope.row.num }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售价格(元)" align="center" width="110">
            <template slot-scope="scope">
              <span>{{ scope.row.unitPrice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="支付价格(元)" align="center" width="110">
            <template slot-scope="scope">
              <span>{{ scope.row.salePrice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="活动减价(元)" align="center" width="110">
            <template slot-scope="scope">
              <span>{{ scope.row.promotionDiscount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="优惠券减价(元)" align="center" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.skuCouponDiscount | centFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物流单号" align="center" width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.logisticsId }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { getLogisticsInfoApi } from '@/api/orders'
import { SubOrderStatusDefinitions } from '@/utils/constants'

export default {
  name: 'GoodsInfo',
  filters: {
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        return (yuan / 100).toFixed(2)
      }
    },
    statusFilter: status => {
      const find = SubOrderStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    }
  },
  props: {
    skuList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      logisticsTimeline: []
    }
  },
  watch: {
    skuList: function(val) {
      this.getLogisticsInfo()
    }
  },
  methods: {
    getLogisticsInfo() {
      this.skuList.forEach(sku => {
        if (!isEmpty(sku.logisticsId)) {
          getLogisticsInfoApi({ orderId: sku.subOrderId }).then(res => {
            const query = res.data.result
            if (query && query.length > 0) {
              this.logisticsTimeline = Array.isArray(query[0].data) ? query[0].data : []
            }
          }).catch(e => {
            console.warn('Order goods get logistics error:' + e)
          })
        }
      })
    },
    getSubStatus(row) {
      return row.subStatus ? row.subStatus : row.status
    }
  }
}
</script>

<style scoped>
  .card-header-text {
    font-size: 18px;
    font-weight: bold;
  }

  .item-label {
    font-size: 16px;
    color: #606266;
    font-weight: bolder;
  }
</style>
