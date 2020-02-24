<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="导入商品"
    top="5vh"
    width="60%"
  >
    <input
      ref="excel-upload-input"
      class="excel-upload-input"
      type="file"
      accept=".xlsx, .xls"
      @change="handleFileChange"
    >
    <el-form ref="importForm" :model="formData" :rules="formRules" label-width="160px">
      <el-form-item label="文件">
        <el-input :value="formData.fileName" readonly />
        <span>建议上传大小不超过1M的.xls文件</span>
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
import isString from 'lodash/isString'
import isEmpty from 'lodash/isEmpty'

const ImportHeaders = [
  { field: 'id', label: '提货券编号', type: 'string', template: '1(必填项)' },
  { field: 'card', label: '提货券编码', type: 'string', template: '1581393532963593654(必填项)' }
]

const fileExt = filename => {
  const parts = filename.split('.')
  return (parts.length > 1) ? parts.pop() : ''
}

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
      ticketList: [],
      formData: {
        fileName: null
      },
      formRules: {}
    }
  },
  methods: {
    parseValue(type, value) {
      if (isString(value) && isEmpty(value.trim())) {
        return null
      }
      return isString(value) ? value.trim() : value.toString()
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
    generateData({ header, results }) {
      this.ticketList = []
      for (const item of results) {
        const ticket = {}
        ImportHeaders.forEach(header => {
          if (header.label in item) {
            const value = this.parseValue(header.type, item[header.label])
            if (value !== null) {
              ticket[header.field] = value
            }
          }
        })
        if ('id' in ticket && 'card' in ticket) {
          this.ticketList.push(ticket)
        }
      }
      this.loading = false
      const count = this.ticketList.length
      this.$message.info(`成功导入${count}个提货券，无效为${results.length - count}个`)
    },
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      if (rawFile.size >= 1024 * 1024) {
        this.$message.warning('请选择小于1M的文件')
        return
      }
      const ext = fileExt(rawFile.name)
      const validExt = ['xls', 'xlsx']
      if (validExt.includes(ext) === false) {
        this.$message.warning('请选择正确的文件格式')
        return
      }
      this.formData.fileName = rawFile.name
      this.$refs['excel-upload-input'].value = null // fix can't select the same excel
      this.readDate(rawFile).then(_ => {
        console.debug('Good import file ' + this.formData.fileName)
      }).catch(e => {
        console.warn('Good import file error: ' + e)
      })
    },
    handleSelect() {
      this.$refs['excel-upload-input'].click()
    },
    handleTemplate() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ImportHeaders
        const data = [tHeader.map(item => item.template)]
        excel.export_json_to_excel({
          header: tHeader.map(header => header.label),
          data,
          filename: '导入提货券模板'
        })
      })
    },
    handleDialogCancel() {
      this.loading = false
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$emit('confirmed', this.ticketList)
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
