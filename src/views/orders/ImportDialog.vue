<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :center="true"
    title="导入物流"
    width="60%"
  >
    <input
      ref="excel-upload-input"
      class="excel-upload-input"
      type="file"
      accept=".xlsx, .xls"
      @change="handleFileChange"
    >
    <el-form ref="importForm" label-width="160px">
      <el-form-item label="文件">
        <el-input :value="fileName" readonly />
        <span>建议上传大小不超过1M的.xls文件</span>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" icon="el-icon-upload" @click="handleSelect">
          选择文件
        </el-button>
        <el-button icon="el-icon-document" @click="handleTemplate">
          下载模板
        </el-button>
        <el-button :loading="expressLoading" type="info" icon="el-icon-document" @click="handleDownloadExpress">
          下载物流公司列表
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      element-loading-text="正在导入..."
      :data="excelResults"
      border
      style="width: 100%;margin-top:20px;"
      height="250"
    >
      <el-table-column label="子订单编号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.subOrderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流单号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logisticsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流公司名称" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.logisticsContent }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流公司编码" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.comCode }}</span>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button
        type="primary"
        :disabled="loading"
        @click="handleDialogConfirm"
      >
        确认
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import XLSX from 'xlsx'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import {
  getOrderListApi,
  uploadLogisticsApi,
  getExpressCompanyApi
} from '@/api/orders'
import {
  suborder_status_waiting_deliver
} from '@/utils/constants'

const DeliveryHeaders = [
  { field: 'subOrderId', label: '子订单编号', type: 'string' },
  { field: 'logisticsId', label: '物流单号', type: 'string' },
  { field: 'comCode', label: '物流公司编码', type: 'string' },
  { field: 'logisticsContent', label: '物流公司名称', type: 'string' }
]

export default {
  name: 'ImportDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      fileName: null,
      expressLoading: false,
      excelResults: []
    }
  },
  methods: {
    async getOrderData(subOrderId) {
      try {
        const params = { pageIndex: 1, pageSize: 1, subOrderId }
        const { data } = await getOrderListApi(params)
        if (data.result.total > 0) {
          const orderData = data.result.list[0]
          return { status: orderData.subStatus, orderId: orderData.id }
        }
      } catch (e) {
        console.warn('Orders List error: ' + e)
      }
      return { status: -1, orderId: -1 }
    },
    handleSelect() {
      this.$refs['excel-upload-input'].click()
    },
    handleTemplate() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = DeliveryHeaders.map(header => header.label)
        const data = []
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '导入物流信息模板'
        })
      })
    },
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      if (rawFile.size >= 1024 * 1024) {
        this.$message.warning('请选择小于1M的文件')
        return
      }
      const mimeTyps = [
        'application/vnd.ms-excel',
        'application/vnd.sealed.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template'
      ]
      if (mimeTyps.includes(rawFile.type) === false) {
        this.$message.warning('请选择正确的文件格式')
        return
      }
      this.fileName = rawFile.name
      this.$refs['excel-upload-input'].value = null // fix can't select the same excel
      this.readDate(rawFile).then(_ => {
        console.debug('Good import file ' + this.fileName)
      }).catch(e => {
        console.warn('Good import file error: ' + e)
      })
    },
    readDate(rawFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateData(results)
          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    parseValue(type, value) {
      if (type === 'string') {
        if (isString(value)) {
          return value
        } else {
          return value ? value.toString() : null
        }
      } else {
        if (isNumber(value)) {
          return value
        } else {
          const val = Number.parseInt(value)
          return Number.isNaN(val) ? null : val
        }
      }
    },
    async generateData(results) {
      this.loading = true
      for (const item of results) {
        const delivery = {}
        DeliveryHeaders.forEach(header => {
          if (header.label in item) {
            delivery[header.field] = this.parseValue(header.type, item[header.label])
          }
        })
        if (!isEmpty(delivery)) {
          const { status, orderId } = await this.getOrderData(delivery.subOrderId)
          if (status === suborder_status_waiting_deliver) {
            delivery.orderId = orderId
            this.excelResults.push(delivery)
          }
        }
      }
      this.loading = false
      const count = this.excelResults.length
      this.$message.info(`成功导入${count}个物流信息，无效为${results.length - count}个`)
    },
    clearDialogData() {
      this.fileName = null
      this.excelResults = []
    },
    handleDialogCancel() {
      this.clearDialogData()
      this.$emit('canceled')
    },
    async handleDialogConfirm() {
      const total = this.excelResults.length
      if (total) {
        try {
          this.loading = true
          const params = {
            total,
            logisticsList: this.excelResults
          }
          await uploadLogisticsApi(params)
          this.$message.success('上传物流信息成功！')
          this.clearDialogData()
          this.$emit('finished')
        } catch (e) {
          console.warn('Delivery import error:' + e)
          this.$message.error('上传物流信息失败，请联系管理员！')
        } finally {
          this.loading = false
        }
      } else {
        this.$message.info('请导入有效的物流信息！')
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    async handleDownloadExpress() {
      try {
        const params = { pageNo: 1, pageSize: 100 }
        this.expressLoading = true
        const { data } = await getExpressCompanyApi(params)
        const expressOption = data.result.list.map(item => {
          return {
            code: item.code,
            name: item.name
          }
        })
        const expressData = this.formatJson(['name', 'code'], expressOption)
        import('@/utils/Export2Excel').then(excel => {
          const header = ['物流公司名称', '物流公司编码']
          excel.export_json_to_excel({
            header,
            data: expressData,
            filename: '物流公司列表'
          })
        })
      } catch (e) {
        console.warn('Delivery import get express error: ' + e)
        this.$message.warning('获取物流公司列表失败，请联系管理员！')
      } finally {
        this.expressLoading = false
      }
    }
  }
}
</script>

<style scoped>
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }
</style>
