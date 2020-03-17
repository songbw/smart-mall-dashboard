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
                :disabled="!couldOperate || (couldOperate && flowOptions.length === 0)"
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
                <address-info
                  :address="flow.returnAddress"
                />
              </div>
              <div v-if="flow.receiverAddress" style="font-size: 13px">
                <span>修改订单收货人地址如下：</span>
                <address-info
                  :address="flow.receiverAddress"
                />
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
              :address="returnAddress"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="flowForm.operation === changeReceiver" label="收货人地址" prop="receiverAddress">
          <el-button type="primary" size="mini" @click="showReceiverDialog">
            修改地址
          </el-button>
          <div v-if="flowForm.receiverAddress !== null">
            <address-info
              :address="flowForm.receiverAddress"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-if="flowForm.operation === changeGood || flowForm.operation === updateUserLogistics"
          :label="flowForm.operation === changeGood ? '换货物流' : '退货物流'"
          prop="logisticsInfo"
        >
          <el-button type="primary" size="mini" style="margin-left: 10px" @click="handleShowExpressDialog">
            填写物流
          </el-button>
          <div v-if="flowForm.logisticsInfo.comCode">
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
    <receiver-dialog
      :dialog-visible="dialogReceiverVisible"
      :sub-order-id="workOrderData.orderId"
      @cancelled="dialogReceiverVisible = false"
      @confirmed="onReceiverAddressChanged"
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
import { getOrderListApi, changeOrderReceiverApi } from '@/api/orders'
import {
  getWorkOrderByIdApi,
  getWorkFlowListApi,
  createWorkOrderFlowApi,
  reopenWorkOrderFlowApi,
  getDefaultReturnAddressApi,
  getReturnAddressListApi,
  getWorkFlowOpsCodeApi
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
import ReceiverDialog from './receiverDialog'

const vendorYiyatong = 4
const yiyatong_request_reject = 302
const yiyatong_request_approve = 303
const yiyatong_request_unknown = 401
const yiyatong_refund_reject = 312
const yiyatong_refund_approve = 313

const approve_request = 1
const agree_refund = 2
const reject_refund = 3
const reject_change = 4
const change_good = 5
const reopen_workorder = 6
const change_receiver = 7
const update_user_logistics = 8

const FlowOperations = [
  { value: approve_request, label: '通过申请' },
  { value: agree_refund, label: '同意退款' },
  { value: reject_refund, label: '拒绝退款' },
  { value: reject_change, label: '拒绝换货' },
  { value: change_good, label: '换货处理' },
  { value: reopen_workorder, label: '重置工单' },
  { value: change_receiver, label: '修改收货人信息' },
  { value: update_user_logistics, label: '更新退货物流' }
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

const FlowOpsCodeList = []

export default {
  name: 'WorkOrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo,
    AddressInfo,
    AddressSelection,
    ExpressSelection,
    ReceiverDialog
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
      const options = FlowOpsCodeList.length > 0 ? FlowOpsCodeList : FlowOperations
      const find = options.find(option => option.value === op)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      approveRequest: approve_request,
      agreeRefund: agree_refund,
      rejectRefund: reject_refund,
      changeGood: change_good,
      changeReceiver: change_receiver,
      updateUserLogistics: update_user_logistics,
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
      dialogReceiverVisible: false,
      dialogAddressVisible: false,
      returnAddressLoading: false,
      returnAddressList: [],
      expressDialogVisible: false,
      flowForm: {
        operation: null,
        refund: 0,
        logisticsInfo: {
          com: null,
          comCode: null,
          order: null
        },
        receiverAddress: null,
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
            if (this.flowForm.operation !== change_good &&
              this.flowForm.operation !== update_user_logistics) {
              callback()
            } else {
              if (value.comCode === null) {
                callback(new Error('请输入正确的物流信息'))
              } else {
                callback()
              }
            }
          },
          trigger: 'blur'
        }],
        receiverAddress: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.flowForm.operation !== change_receiver) {
              callback()
            } else {
              if (value === null) {
                callback(new Error('请选择对应的收货人地址'))
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
        if (this.orderData.merchantId !== vendorYiyatong) {
          options = this.workOrderData.typeId === type_change_good
            ? [approve_request, reject_change, change_receiver] : [approve_request, reject_refund, change_receiver]
        } else {
          const approve = this.flows.findIndex(item => item.operation === yiyatong_request_approve)
          const reject = this.flows.findIndex(item => item.operation === yiyatong_request_reject)
          const unknown = this.flows.findIndex(item => item.operation === yiyatong_request_unknown)
          if (approve >= 0) {
            options = [approve_request]
          } else if (reject >= 0) {
            options = this.workOrderData.typeId === type_change_good
              ? [reject_change] : [reject_refund]
          } else if (unknown >= 0) {
            options = this.workOrderData.typeId === type_change_good
              ? [approve_request, reject_change] : [approve_request, reject_refund]
          } else {
            options = []
          }
        }
      } else if (this.workOrderData.status === work_order_status_approved) {
        if (this.orderData.merchantId !== vendorYiyatong) {
          options = this.workOrderData.typeId === type_change_good
            ? [change_good, reject_change] : [agree_refund, reject_refund]
        } else {
          const approve = this.flows.findIndex(item => item.operation === yiyatong_refund_approve)
          const reject = this.flows.findIndex(item => item.operation === yiyatong_refund_reject)
          if (approve >= 0) {
            options = this.workOrderData.typeId === type_change_good
              ? [change_good] : [agree_refund, update_user_logistics]
          } else if (reject >= 0) {
            options = this.workOrderData.typeId === type_change_good
              ? [reject_change] : [reject_refund, update_user_logistics]
          } else {
            options = this.workOrderData.typeId === type_change_good
              ? [change_good, reject_change] : [agree_refund, reject_refund, update_user_logistics]
          }
        }
      } else if (this.workOrderData.status === work_order_status_working) {
        if (this.workOrderData.typeId === type_change_good) {
          options = [change_good, reject_change, update_user_logistics]
        } else {
          if (this.orderData.merchantId !== vendorYiyatong) {
            options = [agree_refund, reject_refund, update_user_logistics]
          } else {
            const approve = this.flows.findIndex(item => item.operation === yiyatong_refund_approve)
            const reject = this.flows.findIndex(item => item.operation === yiyatong_refund_reject)
            if (approve >= 0) {
              options = [agree_refund]
            } else if (reject >= 0) {
              options = [reject_refund]
            } else {
              options = [update_user_logistics]
            }
          }
        }
      }
      return this.operationOptions.filter(option => options.includes(option.value))
    },
    maxRefund() {
      const yuan = Number.parseFloat(this.orderData.paymentAmount)
      return Number.isNaN(yuan) ? 1000000 : (yuan / 100)
    },
    couldOperate() {
      if (this.orderData.merchantId !== vendorYiyatong) {
        return true
      } else {
        switch (this.workOrderData.status) {
          case work_order_status_request:
            if (this.flows.length > 0) {
              const responseIndex = this.flows.findIndex(
                item => item.operation === yiyatong_request_approve ||
                  item.operation === yiyatong_request_reject ||
                  item.operation === yiyatong_request_unknown)
              return responseIndex >= 0
            } else {
              return false
            }
          default:
            return true
        }
      }
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    async prepareData() {
      this.dataLoading = true
      await this.getFlowOpsCode()
      await this.getDefaultReturnAddress()
      await this.getWorkOrderData()
      this.dataLoading = false
    },
    async getFlowOpsCode() {
      try {
        const data = await getWorkFlowOpsCodeApi()
        for (const key of Object.keys(data)) {
          FlowOpsCodeList.push({ value: parseInt(key), label: data[key] })
        }
      } catch (e) {
        console.warn('Work flow operation code error:' + e)
      }
    },
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
      getWorkFlowListApi({ pageIndex: 1, pageSize: 100, workOrderId: id }).then(data => {
        this.flows = data.rows.map(row => {
          const format = 'YYYY-MM-DD HH:mm:ss'
          const momentDate = moment(row.createTime)
          const timeline = momentDate.isValid() ? momentDate.format(format) : row.createTime
          const find = this.flowStatusOptions.find(option => option.value === row.status)
          let flowComment
          try {
            flowComment = { ...JSON.parse(row.comments) }
          } catch (e) {
            console.warn('Parse flow comment error:' + e)
            flowComment = {}
          }
          const remark = flowComment.remark ? flowComment.remark : ''
          const content = find ? find.label + ' - ' + remark : remark
          return { ...row, timeline, content, ...flowComment }
        })
      }).catch(e => {
        console.warn('Get work flows error:' + e)
      })
    },
    async getOrderData(subOrderId) {
      try {
        const { code, data } = await getOrderListApi({ pageIndex: 1, pageSize: 1, subOrderId })
        if (code === 200 && data.result.list.length > 0) {
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
        comCode: express.comCode,
        order: express.logisticsId
      }
      this.$refs.flowForm.validateField('logisticsInfo', (_) => {
      })
    },
    handleCreateFlow() {
      this.$refs.flowForm.validate(async (valid) => {
        if (valid) {
          this.dialogFlowVisible = false
          try {
            const operator = this.$store.state.user.name
            const { operation, refund, remark } = this.flowForm
            const comments = { remark, operation }
            let status = -1
            let receiverChanged = false
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
              case change_receiver:
                receiverChanged = await this.handleChangeOrderReceiver()
                if (receiverChanged) {
                  status = work_order_status_rejected
                  comments.receiverAddress = this.flowForm.receiverAddress
                } else {
                  return
                }
                break
              case update_user_logistics:
                status = work_order_status_working
                comments.logisticsInfo = this.flowForm.logisticsInfo
                break
              default:
                this.$message.warning('未知操作，请重新选择处理选项')
                return
            }
            const params = { workOrderId: this.workOrderData.id, operator, status, comments: JSON.stringify(comments) }
            if (operation === agree_refund) {
              params.refund = refund
            }
            if (operation === update_user_logistics) {
              params.expressNo = this.flowForm.logisticsInfo.order
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
      this.$refs.reopenForm.validate(async (valid) => {
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
    showReceiverDialog() {
      this.dialogReceiverVisible = true
    },
    onReceiverAddressChanged(address) {
      this.dialogReceiverVisible = false
      this.flowForm.receiverAddress = address
    },
    async handleChangeOrderReceiver() {
      let ret = false
      try {
        this.dataLoading = true
        const { receiverPhone, ...rest } = this.flowForm.receiverAddress
        const params = {
          orderDetailId: this.orderData.subId,
          mobile: receiverPhone,
          ...rest
        }
        const { code, msg } = await changeOrderReceiverApi(params)
        if (code === 200) {
          this.$message.success('修改收货人地址成功！')
          ret = true
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Change order receiver error:' + e)
      } finally {
        this.dataLoading = false
      }
      return ret
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
