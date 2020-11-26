<template>
  <el-dialog
    v-loading="loading"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="导出售后工单"
  >
    <el-form
      ref="exportForm"
      :model="formData"
      :rules="formRules"
      label-width="6rem"
      @submit.prevent.native="onExportClicked"
    >
      <el-form-item label="日期范围" prop="exportDates">
        <el-date-picker
          v-model="formData.exportDates"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="onCancelClicked">取消</el-button>
      <el-button type="primary" @click="onExportClicked">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import { getWorkOrderListApi } from '@/api/workOrders'
import { getOrderListByIdListApi } from '@/api/orders'
import { mapGetters } from 'vuex'
import { WorkOrderTypes } from '@/views/workorders/constants'
import { floatToFixed } from '@/utils'
import { work_order_status_finished, WorkOrderStatusDefinition } from '@/utils/constants'
import * as excel from '@/utils/Export2Excel'

const ExportHeaders = [
  { field: 'orderId', label: '主订单号' },
  { field: 'subOrderId', label: '子订单号' },
  { field: 'logisticsId', label: '物流单号' },
  { field: 'logisticsContent', label: '物流公司' },
  { field: 'receiverName', label: '收货人名' },
  { field: 'mobile', label: '联系电话' },
  { field: 'skuId', label: '商品SKU' },
  { field: 'mpu', label: '商品MPU' },
  { field: 'skuName', label: '商品名称' },
  { field: 'merchantName', label: '供应商名' },
  { field: 'paymentAt', label: '支付时间' },
  { field: 'createTime', label: '申请时间' },
  { field: 'updateTime', label: '更新时间' },
  { field: 'refundTime', label: '退款时间' },
  { field: 'payType', label: '支付类型' },
  { field: 'refundType', label: '售后类型' },
  { field: 'title', label: '售后原因' },
  { field: 'description', label: '售后描述' },
  { field: 'paymentTotalFee', label: '支付金额' },
  { field: 'refundAmount', label: '申请金额' },
  { field: 'realRefundAmount', label: '实际退款' },
  { field: 'workOrderStatus', label: '售后状态' },
  { field: 'refundStatus', label: '退款状态' }
]

const getOptionLabel = (options, val) => {
  if (options.length > 0 && val) {
    const option = options.find(item => item.value === val)
    if (option) {
      return option.label
    }
  }
  return ''
}

const parseDate = date => {
  const format = 'YYYY-MM-DD HH:mm:ss'
  const momentDate = moment(date)
  return momentDate.isValid() && momentDate.isAfter('2000-01-01', 'year') ? momentDate.format(format) : ''
}

const formatJson = (filterVal, jsonData) => {
  return jsonData.map(v => filterVal.map(j => v[j]))
}

export default {
  name: 'ExportDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        exportDates: null
      },
      formRules: {
        exportDates: [{
          required: true,
          validator: (rule, value, callback) => {
            let valid = false
            if (value && Array.isArray(value)) {
              const format = 'YYYY-MM-DD'
              const startDate = moment(value[0], format)
              const maxEndDate = moment(value[0], format).add(3, 'months')
              const endDate = moment(value[1], format)
              valid = endDate.isSameOrAfter(startDate) && endDate.isSameOrBefore(maxEndDate)
            }
            if (valid) {
              callback()
            } else {
              callback(new Error('请选择合适的导出日期范围，区间最多3个月'))
            }
          },
          trigger: 'change'
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      vendorList: 'vendorList'
    })
  },
  methods: {
    async getWorkOrderList() {
      const vendorOptions = this.vendorList.map(item => ({
        value: item.companyId,
        label: item.companyName
      }))
      let workOrderList = []
      try {
        let total = 0
        let fetched = 0
        const params = {
          timeStart: this.formData.exportDates[0],
          timeEnd: this.formData.exportDates[1],
          pageIndex: 1,
          pageSize: 50
        }
        do {
          const workOrderRes = await getWorkOrderListApi(params)
          if (workOrderRes && Array.isArray(workOrderRes.rows)) {
            total = workOrderRes.total
            fetched += workOrderRes.rows.length
            const subOrderIdList = workOrderRes.rows.map(item => item.orderId)
            const subOrderRes = await getOrderListByIdListApi(subOrderIdList)
            const subOrderList = subOrderRes.code === 200 ? subOrderRes.data : []
            const dataList = workOrderRes.rows.map(item => {
              const orderData = subOrderList.find(o => o.subOrderId === item.orderId)
              return {
                orderId: orderData ? orderData.id : '',
                subOrderId: item.orderId,
                logisticsId: orderData ? orderData.logisticsId : '',
                logisticsContent: orderData ? orderData.logisticsContent : '',
                receiverName: orderData ? orderData.receiverName : '',
                mobile: orderData ? orderData.mobile : '',
                skuId: orderData ? orderData.skuId : '',
                mpu: orderData ? orderData.mpu : '',
                skuName: orderData ? orderData.name : '',
                merchantName: orderData ? getOptionLabel(vendorOptions, orderData.merchantId) : '',
                paymentAt: orderData ? parseDate(orderData.paymentAt) : '',
                createTime: parseDate(item.createTime),
                updateTime: parseDate(item.updateTime),
                refundTime: parseDate(item.refundTime),
                payType: orderData ? orderData.payType : '',
                refundType: getOptionLabel(WorkOrderTypes, item.typeId),
                title: item.title,
                description: item.description,
                paymentTotalFee: orderData ? floatToFixed(orderData.paymentTotalFee / 100).toString() : '',
                refundAmount: item.refundAmount,
                realRefundAmount: item.realRefundAmount,
                workOrderStatus: getOptionLabel(WorkOrderStatusDefinition, item.status),
                refundStatus: item.status === work_order_status_finished
                  ? parseDate(item.refundTime) !== '' ? '退款成功' : '退款失败'
                  : ''
              }
            })
            workOrderList = workOrderList.concat(dataList)
          }
          params.pageIndex += 1
        } while (fetched < total)
      } catch (e) {
        console.warn('Get work order list error:' + e)
      }
      return workOrderList
    },
    async handleExportData() {
      this.loading = true
      const jsonData = await this.getWorkOrderList()
      const tHeaders = ExportHeaders.map(header => header.label)
      const tFields = ExportHeaders.map(header => header.field)
      const data = formatJson(tFields, jsonData)
      excel.export_json_to_excel({
        autoWidth: false,
        header: tHeaders,
        data,
        filename: `售后工单列表-${this.formData.exportDates[0]}-${this.formData.exportDates[1]}`
      })
      this.loading = false
      this.onCancelClicked()
    },
    onCancelClicked() {
      this.$refs.exportForm.resetFields()
      this.$emit('done')
    },
    onExportClicked() {
      this.$refs.exportForm.validate(valid => {
        if (valid) {
          this.handleExportData()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
