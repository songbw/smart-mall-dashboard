<template>
  <div>
    <el-row style="margin-bottom: 20px">
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header">
            <span class="card-header-text">子订单信息</span>
          </div>
          <el-table
            ref="SkuTable"
            :data="skuData"
            style="width: 100%"
            border
            default-expand-all
          >
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="12">
                    <div class="item-label">子订单状态：{{ getSubStatus(scope.row) | statusFilter }}</div>
                  </el-col>
                  <el-col :span="12">
                    <div class="item-label">子订单号：{{ scope.row.subOrderId }}</div>
                  </el-col>
                </el-row>
                <el-row style="margin-top: 10px">
                  <el-col :span="12" class="item-label">备注信息：{{ scope.row.remark }}</el-col>
                  <el-col v-if="scope.row.thirdOrderSn" :span="12" class="item-label">
                    外部订单：{{ scope.row.thirdOrderSn }}
                  </el-col>
                </el-row>
                <div v-if="scope.row.fetchedLogistics" style="margin-top: 10px">
                  <div class="item-label">物流信息：</div>
                  <el-timeline style="margin-top: 10px">
                    <el-timeline-item
                      v-for="item in scope.row.logisticsTimeline"
                      :key="item.time"
                      :timestamp="item.time"
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
                <img :src="scope.row.image" class="thumb-image" alt="">
              </template>
            </el-table-column>
            <el-table-column label="数量" align="center" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.num }}</span>
              </template>
            </el-table-column>
            <el-table-column label="价格(元)" align="center" width="140">
              <template slot-scope="scope">
                <span>{{ scope.row.unitPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="活动减价(元)" align="center" width="120">
              <template slot-scope="scope">
                <div>{{ scope.row.promotionDiscount }}</div>
                <router-link
                  v-if="scope.row.promotionId > 0"
                  :to="{ name: 'ViewPromotion', params: { id: scope.row.promotionId }}"
                  class="el-link el-link--primary is-underline"
                >
                  查看活动
                </router-link>
              </template>
            </el-table-column>
            <el-table-column label="支付总额(元)" align="center" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row | amountFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="优惠券减价(元)" align="center" width="140">
              <template slot-scope="scope">
                <span>{{ scope.row.skuCouponDiscount | centFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="物流单号" align="center" width="180">
              <template slot-scope="scope">
                <span>{{ scope.row.logisticsId }}</span>
                <div v-if="canChangeLogistics(scope.row)">
                  <el-button size="mini" type="primary" @click="handleDeliverSubOrder(scope.row)">
                    {{ getSubStatus(scope.row) === statusDelivered ? '修改物流' : '添加物流' }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <express-selection
      :dialog-visible="deliveryDialogVisible"
      :order-id="deliveryData.orderId"
      :sub-order-id="deliveryData.subOrderId"
      :sub-id="deliveryData.subId"
      :sub-order-status="deliveryData.subOrderStatus"
      @cancelled="deliveryDialogVisible = false"
      @confirmed="handleSetDeliver"
    />
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import {
  getLogisticsInfoApi,
  getExpressByThirdSnApi
} from '@/api/orders'
import {
  SubOrderStatusDefinitions,
  suborder_status_waiting_deliver,
  suborder_status_delivered
} from '@/utils/constants'
import ExpressSelection from '@/components/ExpressSelection'

export default {
  name: 'GoodsInfo',
  components: { ExpressSelection },
  filters: {
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        return (yuan / 100).toFixed(2)
      }
    },
    amountFilter: sku => {
      const price = Number.parseFloat(sku.unitPrice)
      const num = Number.parseInt(sku.num)
      if (isNaN(price) || isNaN(num)) {
        return ''
      } else {
        const amount = price * 100 * num // yun to cent
        const couponDiscount = Number.parseFloat(sku.skuCouponDiscount)
        if (isNaN(couponDiscount) || couponDiscount < 0) {
          return (amount / 100).toFixed(2)
        } else {
          return ((amount - couponDiscount) / 100).toFixed(2)
        }
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
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      statusDelivered: suborder_status_delivered,
      statusWaitingDeliver: suborder_status_waiting_deliver,
      deliveryDialogVisible: false,
      deliveryData: {
        orderId: null,
        subId: null,
        subOrderId: null,
        subOrderStatus: null
      }
    }
  },
  computed: {
    skuData() {
      return this.skuList.map(item => ({ ...item, logisticsTimeline: [], fetchedLogistics: false }))
    }
  },
  watch: {
    skuList: function (val, oldVal) {
      if (val.length > 0) {
        this.getLogisticsInfo()
      }
    }
  },
  methods: {
    async getLogisticsInfo() {
      for (const sku of this.skuData) {
        if (!sku.fetchedLogistics) {
          sku.fetchedLogistics = true
          if (!isEmpty(sku.logisticsId)) {
            sku.logisticsTimeline = await this.getExpressByOrderId(sku.subOrderId)
          } else if (!isEmpty(sku.thirdOrderSn)) {
            sku.logisticsTimeline = await this.getExpressByThirdSn(sku.thirdOrderSn)
          }
        }
      }
    },
    async getExpressByOrderId(subOrderId) {
      let dataList = []
      try {
        const { code, data } = await getLogisticsInfoApi({ subOrderId })
        if (code === 200) {
          const query = data.result.data
          dataList = Array.isArray(query) ? query : []
        }
      } catch (e) {
        console.warn('Get express info by order id error:' + e)
      }
      return dataList
    },
    async getExpressByThirdSn(orderSn) {
      let dataList = []
      try {
        const { code, data } = await getExpressByThirdSnApi({ orderSn })
        if (code === 200 && Array.isArray(data) && data.length > 0) {
          const deliveryList = data[0].deliveryList
          dataList = Array.isArray(deliveryList) ? deliveryList : []
        }
      } catch (e) {
        console.warn('Get express by third sn error:' + e)
      }
      return dataList
    },
    getSubStatus(row) {
      return 'subStatus' in row ? row.subStatus : row.status
    },
    handleDeliverSubOrder(row) {
      this.deliveryData.orderId = 'orderId' in row ? row.orderId : row.id
      this.deliveryData.subId = 'subId' in row ? row.subId : row.id
      this.deliveryData.subOrderStatus = 'subStatus' in row ? row.subStatus : row.status
      this.deliveryData.subOrderId = row.subOrderId
      this.deliveryDialogVisible = true
    },
    canChangeLogistics(row) {
      return this.getSubStatus(row) === suborder_status_delivered ||
        this.getSubStatus(row) === suborder_status_waiting_deliver
    },
    handleSetDeliver() {
      this.deliveryDialogVisible = false
      this.$emit('logisticsChanged')
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

  .thumb-image {
    object-fit: contain;
    width: 100%;
    height: 100%
  }
</style>
