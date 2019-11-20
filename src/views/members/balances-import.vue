<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="初始化会员余额"
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
        <span>建议上传大小不超过2M的.xls文件</span>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" icon="el-icon-upload" @click="handleSelect">
          选择文件
        </el-button>
        <el-button icon="el-icon-document" @click="handleTemplate">
          下载模板
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
      <el-table-column label="会员电话" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.telephone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
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

const BalanceHeaders = [
  { field: 'telephone', label: 'mobile', type: 'string' },
  { field: 'amount', label: '余额', type: 'number' }
]

export default {
  name: 'BalancesImport',
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
      excelResults: []
    }
  },
  methods: {
    handleSelect() {
      this.$refs['excel-upload-input'].click()
    },
    handleTemplate() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = BalanceHeaders
        const data = []
        excel.export_json_to_excel({
          header: tHeader.map(header => header.label),
          data,
          filename: '导入会员余额模板'
        })
      })
    },
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      if (rawFile.size >= 2 * 1024 * 1024) {
        this.$message.warning('请选择小于2M的文件')
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
        console.debug('Balance import file ' + this.fileName)
      }).catch(e => {
        console.warn('Balance import file error: ' + e)
      })
    },
    readDate(rawFile) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const header = this.getHeaderRow(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateData({ header, results })
          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        /* find the cell in the first row */
        let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    },
    generateData({ results }) {
      let count = 0
      for (const item of results) {
        const balance = {}
        BalanceHeaders.forEach(header => {
          if (header.label in item) {
            balance[header.field] = this.parseValue(header.type, item[header.label])
          }
        })
        if (!isEmpty(balance) && !isEmpty(balance.telephone)) {
          count++
          this.excelResults.push(balance)
        }
      }
      this.loading = false
      this.$message.info(`成功导入${count}个会员余额，无效余额为${results.length - count}个`)
    },
    parseValue(type, value) {
      if (type === 'string') {
        if (isString(value)) {
          return value
        } else {
          return value != null ? value.toString() : null
        }
      } else {
        if (isNumber(value)) {
          return value
        } else {
          const val = Number.parseFloat(value).toFixed(2)
          return Number.isNaN(val) ? null : val
        }
      }
    },
    handleDialogCancel() {
      this.loading = false
      this.excelResults = []
      this.$refs.importForm.clearValidate()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      const balances = this.excelResults
      this.$emit('onSelectionConfirmed', balances)
      this.excelResults = []
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
