<template>
  <div v-loading="dataLoading" class="app-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" style="display: flex;justify-content: space-between;align-items: center">
            <span class="card-header-text">售后信息</span>
            <el-button
              v-if="!isWatcherUser"
              :disabled="workOrderData.status === 6"
              type="primary"
              @click="handleShowFlowDialog"
            >
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
            <el-form-item label="申请数量:">
              <span>{{ workOrderData.returnedNum }}</span>
            </el-form-item>
            <el-form-item label="申请金额:">
              <span>￥ {{ workOrderData.refundAmount }}</span>
            </el-form-item>
            <el-form-item label="申请时间:">
              <span>{{ workOrderData.createTime | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="更新时间:">
              <span>{{ workOrderData.updateTime | timeFilter }}</span>
            </el-form-item>
            <el-form-item v-if="workOrderData.realRefundAmount" label="累计退款:">
              <span>￥ {{ workOrderData.realRefundAmount }}</span>
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
              <span style="font-weight: bolder;margin-bottom: 10px">{{ flow.content }}</span>
              <div v-if="flow.returnAddress" style="font-size: 13px">
                <span>客户退货地址如下：</span>
                <address-info :return-address="flow.returnAddress" />
              </div>
              <div v-if="flow.logisticsInfo" style="font-size: 13px">
                <div>客户退货物流信息如下：</div>
                <div>物流公司：{{ flow.logisticsInfo.com }}</div>
                <div>物流单号：{{ flow.logisticsInfo.order }}</div>
              </div>
              <div v-if="flow.refund">
                <span>发起退款金额：￥{{ flow.refund }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    <goods-info
      :sku-list="[orderData]"
    />
    <order-info
      :status="orderData.status"
      :trade-no="orderData.tradeNo"
      :merchant-id="orderData.merchantId"
      :created-at="orderData.createdAt"
      :updated-at="orderData.updatedAt"
      :open-id="orderData.openId"
      :merchant-no="orderData.merchantNo"
      :aoyi-id="orderData.aoyiId"
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
      :out-trade-no="orderData.outTradeNo"
      :payment-amount="orderData.paymentAmount"
      :pay-type="orderData.payType"
      :refund-fee="orderData.refundFee"
      :coupon-id="orderData.couponId"
      :coupon-code="orderData.couponCode"
      :coupon-discount="orderData.couponDiscount"
      :serv-fee="orderData.servFee"
    />
    <el-button type="primary" @click="goBack">返回</el-button>

    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogFlowVisible"
      title="工单处理"
    >
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
        <el-form-item v-if="flowForm.status === 3" label="退货地址">
          <el-switch v-model="includeAddress" />
          <el-button type="primary" size="mini" style="margin-left: 10px" @click="handleShowAddressDialog">
            选择地址
          </el-button>
          <el-button type="warning" size="mini" style="margin-left: 10px" @click="gotoReturnAddress">
            修改地址
          </el-button>
          <div v-if="includeAddress && returnAddress.id >= 0">
            <address-info
              :return-address="returnAddress"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="flowForm.status === 6" label="退款金额" prop="refund">
          <div v-if="orderData.paymentAmount" style="font-size: 14px;margin-bottom: 10px">
            <i class="el-icon-warning-outline">
              主订单实际支付金额：{{ orderData.paymentAmount | centFilter }}，
              运费：￥{{ orderData.servFee }}，
              申请退款金额：￥{{ workOrderData.refundAmount }}
            </i>
          </div>
          <el-input-number v-model="flowForm.refund" :precision="2" :step="1" :min="0" :max="maxRefund" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="flowForm.remark" autocomplete="off" maxlength="50" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelFlow">取消</el-button>
        <el-button type="primary" @click="handleCreateFlow">确定</el-button>
      </div>
    </el-dialog>
    <address-selection
      :dialog-visible="dialogAddressVisible"
      :list-loading="returnAddressLoading"
      :address-list="returnAddressList"
      @onCancelled="dialogAddressVisible = false"
      @onConfirmed="onReturnAddressSelected"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import OrderInfo from '@/components/Order/orderInfo'
import ReceiverInfo from '@/components/Order/receiverInfo'
import PaymentInfo from '@/components/Order/paymentInfo'
import GoodsInfo from '@/components/Order/goodsInfo'
import AddressInfo from './addressInfo'
import AddressSelection from './addressSelection'
import {
  getOrderListApi
} from '@/api/orders'
import {
  getWorkOrderByIdApi,
  getWorkFlowListApi,
  createWorkOrderFlowApi,
  getDefaultReturnAddressApi,
  getReturnAddressListApi
} from '@/api/workOrders'
import {
  OrderStatusDefinitions,
  PaymentStatusDefinitions
} from '@/utils/constants'
import { WorkOrderStatus, WorkOrderTypes } from './constants'

const FlowStatusOptions = [
  {
    value: 2, label: '收到审核'
  }, {
    value: 3, label: '通过审核'
  }, {
    value: 4, label: '审核失败'
  }, {
    value: 5, label: '退货处理'
  }, {
    value: 6, label: '同意退款'
  }]
export default {
  name: 'WorkOrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo,
    AddressInfo,
    AddressSelection
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
    },
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        const value = (yuan / 100).toFixed(2)
        return `￥ ${value}`
      }
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
      includeAddress: false,
      returnAddress: {
        id: -1
      },
      dialogAddressVisible: false,
      returnAddressLoading: false,
      returnAddressList: [],
      flowForm: {
        status: null,
        refund: 0,
        remark: null
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
        refund: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.flowForm.status !== 6) {
              callback()
            } else {
              if (value <= 0) {
                callback(new Error('请输入合适的退款金额'))
              } else {
                callback()
              }
            }
          },
          trigger: 'blur'
        }],
        remark: [{
          required: true,
          validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入备注信息'))
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
    ...mapGetters({
      isWatcherUser: 'isWatcherUser'
    }),
    flowOptions() {
      let options = []
      if (this.workOrderData.status === 1) {
        options = [3]
      } else if (this.workOrderData.status === 2) {
        options = [3]
      } else if (this.workOrderData.status === 3) {
        options = [6]
      } else if (this.workOrderData.status === 5) {
        options = [6]
      }
      return FlowStatusOptions.filter(option => options.includes(option.value))
    },
    maxRefund() {
      const yuan = Number.parseFloat(this.orderData.paymentAmount)
      return Number.isNaN(yuan) ? 1000000 : (yuan / 100)
    }
  },
  created() {
    this.getDefaultReturnAddress()
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
      getWorkFlowListApi({ pageIndex: 1, pageSize: 100, workOrderId: id })
        .then(data => {
          this.flows = data.rows.map(row => {
            const format = 'YYYY-MM-DD HH:mm:ss'
            const momentDate = moment(row.createTime)
            const timeline = momentDate.isValid() ? momentDate.format(format) : row.createTime
            const find = FlowStatusOptions.find(option => option.value === row.status)
            let flowComment = {}
            try {
              flowComment = { ...JSON.parse(row.comments) }
            } catch (e) {
              flowComment = {}
            }
            const remark = flowComment.remark ? flowComment.remark : ''
            const content = find ? find.label + ' - ' + remark : remark
            return { ...row, timeline, content, ...flowComment }
          })
        })
        .catch(e => {
          console.warn('Get work flows error:' + e)
        })
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
    async getDefaultReturnAddress() {
      try {
        const data = await getDefaultReturnAddressApi()
        if (data.id >= 0) {
          this.returnAddress = { id: data.id, ...JSON.parse(data.content) }
        }
      } catch (e) {
        console.warn('Get default return address error:' + e)
      }
    },
    async getReturnAddressList() {
      try {
        this.returnAddressLoading = true
        const data = await getReturnAddressListApi()
        if (Array.isArray(data)) {
          this.returnAddressList = data.map(item => ({
            id: item.id,
            isDefault: item.isDefault,
            ...JSON.parse(item.content)
          }))
        }
      } catch (e) {
        console.warn('Get return address list error:' + e)
      } finally {
        this.returnAddressLoading = false
      }
    },
    onReturnAddressSelected(addr) {
      if (addr) {
        this.returnAddress = addr
      }
      this.dialogAddressVisible = false
    },
    handleShowAddressDialog() {
      this.dialogAddressVisible = true
      if (this.returnAddressList.length === 0) {
        this.getReturnAddressList()
      }
    },
    handleShowFlowDialog() {
      this.flowForm.status = null
      this.flowForm.refund = 0
      this.flowForm.remark = ''
      this.includeAddress = this.workOrderData.status === 1 && this.workOrderData.typeId !== 3 // 3 means 仅退款
      this.dialogFlowVisible = true
    },
    handleCancelFlow() {
      this.dialogFlowVisible = false
      this.$refs.flowForm.clearValidate()
    },
    handleFlowOptionChanged(value) {
      this.flowForm.status = value
    },
    handleCreateFlow() {
      this.$refs.flowForm.validate(async(valid) => {
        if (valid) {
          this.dialogFlowVisible = false
          try {
            const operator = this.$store.state.user.name
            const { status, refund, remark } = this.flowForm
            const comments = { remark }
            if (this.flowForm.status === 3 && this.includeAddress) { // 3 通过审核，是否包含退货地址
              comments.returnAddress = this.returnAddress
            }
            if (this.flowForm.status === 6) { // 6为发起退款，是否包含运费
              comments.refund = refund
            }
            const params = { workOrderId: this.workOrderData.id, operator, status, comments: JSON.stringify(comments) }
            if (this.flowForm.status === 6) { // 6为发起退款，是否包含运费
              params.refund = refund
            }
            await createWorkOrderFlowApi(params)
            this.$message.success('处理工单成功！')
            this.getWorkOrderData()
          } catch (e) {
            console.warn('Work order create flow error:' + e)
            this.$message.error('处理工单失败，请稍后重试！')
          }
        }
      })
    },
    gotoReturnAddress() {
      this.handleCancelFlow()
      this.$router.push({ name: 'ReturnAddress' })
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
