<template>
  <div v-loading="dataLoading" class="app-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" style="display: flex;justify-content: space-between;align-items: center">
            <span class="card-header-text">售后信息</span>
            <el-button type="primary" @click="handleShowFlowDialog">
              处理
            </el-button>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="售后状态:">
              <span>{{ workOrderData.status | workOrderStatus }}</span>
            </el-form-item>
            <el-form-item label="售后类型">
              <span>{{ workOrderData.typeName }}</span>
            </el-form-item>
            <el-form-item label="售后原因:">
              <span>{{ workOrderData.title }}</span>
            </el-form-item>
            <el-form-item label="售后描述:">
              <span>{{ workOrderData.description }}</span>
            </el-form-item>
            <el-form-item label="申请时间:">
              <span>{{ workOrderData.createTime | timeFilter }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" style="display: flex;justify-content: space-between;align-items: center">
            <span class="card-header-text">操作记录</span>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="flow in flows"
              :key="flow.id"
              :timestamp="flow.timeline"
            >
              {{ flow.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    <order-info
      :status="orderData.status"
      :trade-no="orderData.tradeNo"
      :sub-order-id="orderData.subOrderId"
      :created-at="orderData.createdAt"
      :updated-at="orderData.updatedAt"
      :remark="orderData.remark"
    />
    <receiver-info
      :receiver-name="orderData.receiverName"
      :mobile="orderData.mobile"
      :province-id="orderData.provinceId"
      :province-name="orderData.provinceName"
      :city-id="orderData.cityId"
      :city-name="orderData.cityName"
      :county-id="orderData.countyId"
      :county-name="orderData.countyName"
      :address="orderData.address"
      :zip="orderData.zip"
    />
    <payment-info
      :pay-status="orderData.payStatus"
      :payment-no="orderData.paymentNo"
      :payment-at="orderData.paymentAt"
      :payment-total-fee="orderData.paymentTotalFee"
      :payment-amount="orderData.paymentAmount"
      :pay-type="orderData.payType"
      :refund-fee="orderData.refundFee"
      :coupon-id="orderData.couponId"
      :coupon-code="orderData.couponCode"
      :coupon-discount="orderData.couponDiscount"
    />
    <goods-info
      :sku-list="[orderData]"
    />
    <el-button type="primary" @click="goBack">返回</el-button>

    <el-dialog title="工单处理" :visible.sync="dialogFlowVisible">
      <el-form ref="flowForm" :model="flowForm" :rules="flowRules" label-width="120px">
        <el-form-item label="处理选项" prop="status">
          <el-select
            :value="flowForm.status"
            placeholder="请选择处理"
            @change="handleFlowOptionChanged"
          >
            <el-option
              v-for="item in flowOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理意见" prop="comments">
          <el-input v-model="flowForm.comments" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelFlow">取消</el-button>
        <el-button type="primary" @click="handleCreateFlow">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import OrderInfo from '@/components/Order/orderInfo'
import ReceiverInfo from '@/components/Order/receiverInfo'
import PaymentInfo from '@/components/Order/paymentInfo'
import GoodsInfo from '@/components/Order/goodsInfo'

import {
  getOrderListApi
} from '@/api/orders'
import {
  getWorkOrderByIdApi,
  getWorkFlowListApi,
  createWorkOrderFlowApi
} from '@/api/workOrders'
import {
  OrderStatusDefinitions,
  PaymentStatusDefinitions
} from '@/utils/constants'
import { WorkOrderStatus, WorkOrderTypes } from './constants'

const FlowStatusOptions = [
  {
    value: 2, label: '同意退货'
  }, {
    value: 3, label: '收到退货'
  }, {
    value: 4, label: '同意退款'
  }, {
    value: 5, label: '退款成功'
  }, {
    value: 6, label: '退款失败'
  }, {
    value: 7, label: '拒绝申请'
  }]
export default {
  name: 'WorkOrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo
  },
  filters: {
    workOrderStatus: status => {
      const find = WorkOrderStatus.find(option => option.value === status)
      return find ? find.label : status
    },
    orderStatus: status => {
      const find = OrderStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter(date) {
      if (isEmpty(date)) {
        return ''
      }
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    },
    invoiceFilter(state) {
      return state === '1' ? '需要' : '不需要'
    },
    payFilter: status => {
      const find = PaymentStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    }
  },
  data() {
    return {
      dataLoading: false,
      province: '',
      city: '',
      country: '',
      typeOptions: WorkOrderTypes,
      orderData: {},
      workOrderData: {},
      flows: [],
      dialogFlowVisible: false,
      flowForm: {
        status: null,
        comments: null
      },
      flowRules: {
        status: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择处理结果'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }],
        comments: [{
          required: true,
          validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入处理说明'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    flowOptions() {
      let options = []
      if (this.workOrderData.status === 1) {
        options = [2, 4, 7]
      } else if (this.workOrderData.status === 2) {
        options = [3]
      } else if (this.workOrderData.status === 3) {
        options = [4]
      } else if (this.workOrderData.status === 4) {
        options = [5, 6]
      }
      return FlowStatusOptions.filter(option => options.includes(option.value))
    }
  },
  created() {
    this.getWorkOrderData()
  },
  methods: {
    async getWorkOrderData() {
      try {
        this.dataLoading = true
        const id = this.$route.params.id
        this.workOrderData = await getWorkOrderByIdApi({ id })
        const find = this.typeOptions.find(option => option.value === this.workOrderData.typeId)
        this.$set(this.workOrderData, 'typeName', find ? find.label : '')
        await this.getWorkFlows(id)
        await this.getOrderData(this.workOrderData.orderId)
      } catch (e) {
        console.warn('Work order get error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getWorkFlows(id) {
      try {
        const data = await getWorkFlowListApi({ pageIndex: 1, pageSize: 100, workOrderId: id })
        this.flows = data.rows.map(row => {
          const format = 'YYYY-MM-DD HH:mm:ss'
          const momentDate = moment(row.createTime)
          const timeline = momentDate.isValid() ? momentDate.format(format) : row.createTime
          const find = FlowStatusOptions.find(option => option.value === row.status)
          const content = find ? find.label + ' - ' + row.comments : row.comments
          return { ...row, timeline, content }
        })
      } catch (e) {
        console.warn('Get work flows error:' + e)
      }
    },
    async getOrderData(subOrderId) {
      try {
        const { data } = await getOrderListApi({ pageIndex: 1, pageSize: 1, subOrderId })
        if (data.result.list.length > 0) {
          this.orderData = data.result.list[0]
        }
      } catch (e) {
        console.warn('Work order get order detail error:' + e)
      }
    },
    handleShowFlowDialog() {
      this.flowForm.status = null
      this.flowForm.comments = ''
      this.dialogFlowVisible = true
    },
    handleCancelFlow() {
      this.dialogFlowVisible = false
      this.$refs.flowForm.resetFields()
    },
    handleFlowOptionChanged(value) {
      this.flowForm.status = value
    },
    handleCreateFlow() {
      this.$refs.flowForm.validate(async(valid) => {
        if (valid) {
          this.dialogFlowVisible = false
          try {
            await createWorkOrderFlowApi({ workOrderId: this.workOrderData.id, ...this.flowForm })
            this.$message.success('处理工单成功！')
            this.getWorkOrderData()
          } catch (e) {
            console.warn('Work order create flow error:' + e)
            this.$message.error('处理工单失败，请稍后重试！')
          }
        }
      })
    },
    goBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/workOrders')
    }
  }
}
</script>

<style scoped>
  .card-header-text {
    font-size: 16px;
    font-weight: bold;
  }
</style>
