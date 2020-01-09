<template>
  <div v-loading="dataLoading" class="app-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" style="display: flex;justify-content: space-between;align-items: center">
            <span class="card-header-text">售后信息</span>
            <div>
              <el-button
                v-if="couldReopenWorkOrder"
                type="danger"
                @click="handleReopenWorkOrder"
              >
                重置工单
              </el-button>
              <el-button
                v-if="hasEditPermission"
                :disabled="flowOptions.length === 0"
                type="primary"
                @click="handleShowFlowDialog"
              >
                处理
              </el-button>
            </div>
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
            <el-form-item label="退款时间:">
              <span>{{ workOrderData.refundTime | timeFilter }}</span>
            </el-form-item>
            <el-form-item v-if="workOrderData.realRefundAmount" label="实际退款:">
              <span>￥ {{ workOrderData.realRefundAmount }}</span>
            </el-form-item>
            <el-form-item v-if="refundList.length > 0" label="退款明细">
              <el-table
                :data="refundList"
                style="width: 100%"
                border
              >
                <el-table-column label="支付类型" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.payType | payTypeFilter }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="支付金额(元)" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.refundFee | centFilter }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="退款状态" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.status | refundStatus }}</span>
                  </template>
                </el-table-column>
              </el-table>
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
                <div>物流信息如下：</div>
                <div>物流公司：{{ flow.logisticsInfo.com }}</div>
                <div>物流单号：{{ flow.logisticsInfo.order }}</div>
              </div>
              <div v-if="flow.refund">
                <span>发起退款金额：￥{{ flow.refund }}</span>
              </div>
              <div v-if="flow.operator">
                <span>操作员：{{ flow.operator }}</span>
                <span v-if="flow.operation" style="margin-left: 10px">
                  处理方式：{{ flow.operation | operationFilter }}
                </span>
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
      :sale-amount="orderData.saleAmount"
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
            :value="flowForm.operation"
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
        <el-form-item v-if="flowForm.operation === approveRequest" label="退货地址">
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
        <el-form-item
          v-if="flowForm.operation === changeGood"
          label="换货物流"
          prop="logisticsInfo"
        >
          <el-button type="primary" size="mini" style="margin-left: 10px" @click="handleShowExpressDialog">
            填写物流
          </el-button>
          <div v-if="flowForm.logisticsInfo.code">
            <el-form inline>
              <el-form-item label="物流公司"><span>{{ flowForm.logisticsInfo.com }}</span></el-form-item>
              <el-form-item label="物流单号"><span>{{ flowForm.logisticsInfo.order }}</span></el-form-item>
            </el-form>
          </div>
        </el-form-item>
        <el-form-item v-if="flowForm.operation === agreeRefund" label="退款金额" prop="refund">
          <div v-if="orderData.paymentAmount" style="font-size: 14px;margin-bottom: 10px">
            <i class="el-icon-warning-outline">
              主订单实际支付金额：￥{{ orderData.paymentAmount | centFilter }}，
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
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogReopenVisible"
      title="重置工单"
    >
      <el-form
        ref="reopenForm"
        v-loading="reopenLoading"
        :model="reopenForm"
        :rules="reopenRules"
        label-width="120px"
      >
        <el-form-item label="重置类型" prop="typeId">
          <el-select
            v-model="reopenForm.typeId"
            placeholder="请选择重置类型"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="reopenForm.typeId !== null && reopenForm.typeId !== changeGoodType"
          label="退款金额"
          prop="refund"
        >
          <div v-if="orderData.paymentAmount" style="font-size: 14px;margin-bottom: 10px">
            <i class="el-icon-warning-outline">
              主订单实际支付金额：￥{{ orderData.paymentAmount | centFilter }}，
              运费：￥{{ orderData.servFee }}，
              申请退款金额：￥{{ workOrderData.refundAmount }}
            </i>
          </div>
          <el-input-number v-model="reopenForm.refund" :precision="2" :step="1" :min="0" :max="maxRefund" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="reopenForm.remark" autocomplete="off" maxlength="50" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelReopen">取消</el-button>
        <el-button type="primary" @click="handleConfirmReopen">确定</el-button>
      </div>
    </el-dialog>
    <address-selection
      :dialog-visible="dialogAddressVisible"
      :list-loading="returnAddressLoading"
      :address-list="returnAddressList"
      @onCancelled="dialogAddressVisible = false"
      @onConfirmed="onReturnAddressSelected"
    />
    <express-selection
      :update-order="false"
      :dialog-visible="expressDialogVisible"
      @cancelled="expressDialogVisible = false"
      @confirmed="handleSetExpress"
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
import ExpressSelection from '@/components/ExpressSelection'
import AddressInfo from './addressInfo'
import AddressSelection from './addressSelection'
import { getOrderListApi } from '@/api/orders'
import {
  getWorkOrderByIdApi,
  getWorkFlowListApi,
  createWorkOrderFlowApi,
  reopenWorkOrderFlowApi,
  getDefaultReturnAddressApi,
  getReturnAddressListApi
} from '@/api/workOrders'
import {
  work_order_status_request,
  work_order_status_approved,
  work_order_status_rejected,
  work_order_status_working,
  work_order_status_finished,
  work_order_status_refunding,
  OrderStatusDefinitions,
  PaymentStatusDefinitions,
  PayTypeOptions
} from '@/utils/constants'
import { WorkOrderStatus, WorkOrderTypes, type_change_good, type_refund_only } from './constants'
import { WorkOrderPermissions } from '@/utils/role-permissions'

const approve_request = 1
const agree_refund = 2
const reject_refund = 3
const reject_change = 4
const change_good = 5
const reopen_workorder = 6
const FlowOperations = [
  { value: approve_request, label: '通过申请' },
  { value: agree_refund, label: '同意退款' },
  { value: reject_refund, label: '拒绝退款' },
  { value: reject_change, label: '拒绝换货' },
  { value: change_good, label: '换货处理' },
  { value: reopen_workorder, label: '重置工单' }
]

const RefundResultStatusOptions = [{
  value: 0, label: '处理中'
}, {
  value: 1, label: '成功'
}, {
  value: 2, label: '失败'
}, {
  value: 3, label: '超时'
}]
export default {
  name: 'WorkOrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo,
    AddressInfo,
    AddressSelection,
    ExpressSelection
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
      return momentDate.isValid() && momentDate.isAfter('2000-01-01', 'year') ? momentDate.format(format) : ''
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
        return (yuan / 100).toFixed(2)
      }
    },
    payTypeFilter: type => {
      const find = PayTypeOptions.find(option => option.value === type)
      return find ? find.label : type
    },
    refundStatus: status => {
      const find = RefundResultStatusOptions.find(option => option.value === status)
      return find ? find.label : ''
    },
    operationFilter: op => {
      const find = FlowOperations.find(option => option.value === op)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      approveRequest: approve_request,
      agreeRefund: agree_refund,
      rejectRefund: reject_refund,
      changeGood: change_good,
      operationOptions: FlowOperations,
      dataLoading: false,
      province: '',
      city: '',
      country: '',
      typeOptions: WorkOrderTypes,
      changeGoodType: type_change_good,
      orderData: {},
      workOrderData: {},
      refundList: [],
      flows: [],
      dialogFlowVisible: false,
      includeAddress: false,
      returnAddress: {
        id: -1
      },
      dialogAddressVisible: false,
      returnAddressLoading: false,
      returnAddressList: [],
      expressDialogVisible: false,
      flowForm: {
        operation: null,
        refund: 0,
        logisticsInfo: {
          com: null,
          code: null,
          order: null
        },
        remark: null
      },
      flowRules: {
        operation: [{
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
            if (this.flowForm.operation !== agree_refund) {
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
        }],
        logisticsInfo: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.flowForm.operation !== change_good) {
              callback()
            } else {
              if (value.code === null) {
                callback(new Error('请输入正确的物流信息'))
              } else {
                callback()
              }
            }
          },
          trigger: 'blur'
        }]
      },
      dialogReopenVisible: false,
      reopenLoading: false,
      reopenForm: {
        typeId: null,
        refund: 0,
        remark: ''
      },
      reopenRules: {
        typeId: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择重置类型'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }],
        refund: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.reopenForm.typeId !== change_good) {
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
      userPermissions: 'userPermissions'
    }),
    hasEditPermission() {
      return this.userPermissions.includes(WorkOrderPermissions.update)
    },
    hasResetPermission() {
      return this.userPermissions.includes(WorkOrderPermissions.reset)
    },
    flowStatusOptions() {
      return WorkOrderStatus
    },
    couldReopenWorkOrder() {
      let noRefund = isEmpty(this.workOrderData.refundTime)
      if (!noRefund) {
        const momentDate = moment(this.workOrderData.refundTime)
        noRefund = !(momentDate.isValid() && momentDate.isAfter('2000-01-01', 'year'))
      }
      const status = this.workOrderData.status
      const closed = status === work_order_status_finished
      return this.hasResetPermission && closed && noRefund
    },
    flowOptions() {
      let options = []
      if (this.workOrderData.status === work_order_status_request) {
        options = this.workOrderData.typeId === type_change_good
          ? [approve_request, reject_change] : [approve_request, reject_refund]
      } else if (this.workOrderData.status === work_order_status_approved) {
        options = this.workOrderData.typeId === type_change_good
          ? [change_good, reject_change] : [agree_refund, reject_refund]
      } else if (this.workOrderData.status === work_order_status_working) {
        options = this.workOrderData.typeId === type_change_good
          ? [change_good, reject_change] : [agree_refund, reject_refund]
      }
      return this.operationOptions.filter(option => options.includes(option.value))
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
        if (isEmpty(this.workOrderData.comments) === false) {
          this.refundList = JSON.parse(this.workOrderData.comments)
        }
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
            const find = this.flowStatusOptions.find(option => option.value === row.status)
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
    handleShowExpressDialog() {
      this.expressDialogVisible = true
    },
    handleShowFlowDialog() {
      this.flowForm.operation = null
      this.flowForm.refund = 0
      this.flowForm.remark = ''
      this.includeAddress = this.workOrderData.status === work_order_status_request &&
        this.workOrderData.typeId !== type_refund_only
      this.dialogFlowVisible = true
    },
    handleCancelFlow() {
      this.dialogFlowVisible = false
      this.$refs.flowForm.clearValidate()
    },
    handleFlowOptionChanged(value) {
      this.flowForm.operation = value
    },
    handleSetExpress(express) {
      this.expressDialogVisible = false
      this.flowForm.logisticsInfo = {
        com: express.logisticsContent,
        code: express.comCode,
        order: express.logisticsId
      }
      this.$refs.flowForm.validateField('logisticsInfo', (_) => {
      })
    },
    handleCreateFlow() {
      this.$refs.flowForm.validate(async(valid) => {
        if (valid) {
          this.dialogFlowVisible = false
          try {
            const operator = this.$store.state.user.name
            const { operation, refund, remark } = this.flowForm
            const comments = { remark, operation }
            let status = -1
            switch (operation) {
              case approve_request:
                status = work_order_status_approved
                if (this.includeAddress) {
                  comments.returnAddress = this.returnAddress
                }
                break
              case reject_refund:
                status = work_order_status_rejected
                break
              case reject_change:
                status = work_order_status_rejected
                break
              case agree_refund:
                status = work_order_status_refunding
                comments.refund = refund
                break
              case change_good:
                status = work_order_status_finished
                if (this.workOrderData.typeId === type_change_good) {
                  comments.logisticsInfo = this.flowForm.logisticsInfo
                }
                break
              default:
                this.$message.warning('未知操作，请重新选择处理选项')
                return
            }
            const params = { workOrderId: this.workOrderData.id, operator, status, comments: JSON.stringify(comments) }
            if (operation === agree_refund) {
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
    handleReopenWorkOrder() {
      this.reopenForm.typeId = null
      this.reopenForm.refund = 0
      this.reopenForm.remark = ''
      this.dialogReopenVisible = true
    },
    handleCancelReopen() {
      this.$refs.reopenForm.clearValidate()
      this.dialogReopenVisible = false
    },
    handleConfirmReopen() {
      this.$refs.reopenForm.validate(async(valid) => {
        if (valid) {
          try {
            this.reopenLoading = true
            const operator = this.$store.state.user.name
            const comments = { remark: this.reopenForm.remark, operation: reopen_workorder }
            const workOrderId = this.workOrderData.id
            const typeId = this.reopenForm.typeId
            const params = { workOrderId, operator, typeId, comments: JSON.stringify(comments) }
            if (typeId !== change_good) {
              params.refund = this.reopenForm.refund
            }
            await reopenWorkOrderFlowApi(params)
            this.$message.success('重置工单成功！')
            this.getWorkOrderData()
          } catch (e) {
            console.warn(`Update product state error: ${e}`)
          } finally {
            this.reopenLoading = false
            this.dialogReopenVisible = false
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
