<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="导入活动商品"
    width="60%"
  >
    <input
      ref="excel-upload-input"
      class="excel-upload-input"
      type="file"
      accept=".xlsx, .xls"
      @change="handleFileChange"
    >
    <el-form ref="importForm" :model="formData" label-width="160px">
      <el-form-item label="文件">
        <el-input :value="formData.fileName" readonly />
        <span>更新”编辑中“的商品活动价，建议上传大小不超过1M的.xls文件</span>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" icon="el-icon-upload" @click="handleSelect">
          选择文件
        </el-button>
        <el-button icon="el-icon-document" @click="handleTemplate">
          下载模板
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-progress
          v-if="loading"
          text-inside
          :stroke-width="18"
          :percentage="percentage"
          style="width: 80%"
        />
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
      <el-table-column label="活动名称" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.promotionName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品MPU" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.mpu }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="促销价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.discount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进货价格(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.sprice }}</span>
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
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import uniq from 'lodash/uniq'
import XLSX from 'xlsx'
import { getPromotionsApi } from '@/api/promotions'
import { getProductsByMpuListApi } from '@/api/products'
import { product_state_on_sale, promotion_status_init } from '@/utils/constants'

const floatToFixed = (value, precision) =>
  parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision))
const convertToNumber = value => isNumber(value) ? floatToFixed(value, 2)
  : floatToFixed(Number.parseFloat(value), 2)
const convertToInt = value => Number.isInteger(value) ? value : Math.round(convertToNumber(value))

const PromotionHeaders = [
  { field: 'promotionId', label: '活动ID', type: 'integer', template: '20' },
  { field: 'promotionName', label: '活动名称', type: 'string', template: '凤巢秒杀活动' },
  { field: 'promotionState', label: '活动状态', type: 'string', template: '编辑中' },
  { field: 'mpu', label: '商品MPU', type: 'string', template: '10001234' },
  { field: 'skuid', label: '商品SKU', type: 'string', template: '10001234' },
  { field: 'name', label: '商品名', type: 'string', template: '凤巢测试商品' },
  { field: 'discount', label: '促销价格(元)', type: 'float', template: '888.88' },
  { field: 'price', label: '销售价格(元)', type: 'float', template: '888.88' },
  { field: 'sprice', label: '进货价格(元)', type: 'float', template: '666.66' },
  { field: 'comparePrice', label: '第三方平台价', type: 'float', template: '888.88' }
]

const fileExt = filename => {
  const parts = filename.split('.')
  return (parts.length > 1) ? parts.pop() : ''
}

export default {
  name: 'ImportPromotions',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    appId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        fileName: null
      },
      percentage: 0,
      excelResults: []
    }
  },
  methods: {
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      if (rawFile.size >= 2 * 1024 * 1024) {
        this.$message.warning('请选择小于2M的文件')
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
        const tHeader = PromotionHeaders
        const data = [tHeader.map(item => item.template)]
        excel.export_json_to_excel({
          header: tHeader.map(header => header.label),
          data,
          filename: '导入活动商品信息模板'
        })
      })
    },
    handleDialogCancel() {
      this.loading = false
      this.clearDialogData()
      this.$refs.importForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      const skus = this.excelResults
      this.$emit('confirmed', skus)
      this.clearDialogData()
    },
    clearDialogData() {
      this.percentage = 0
      this.formData.merchantId = null
      this.formData.fileName = null
      this.excelResults = []
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
    isSearchProductValid(product) {
      const price = Number.parseFloat(product.price)
      const name = product.name
      const state = Number.parseInt(product.state)
      return !(Number.isNaN(price) || isEmpty(name) || state !== product_state_on_sale)
    },
    generateData({ header, results }) {
      this.parsePromotionData(results)
    },
    parseValue(type, value) {
      switch (type) {
        case 'string':
          if (isString(value)) {
            return value.trim()
          } else {
            return value != null ? value.toString() : null
          }
        case 'integer':
          return convertToInt(value)
        case 'float':
          return convertToNumber(value)
        default:
          return value
      }
    },
    async parsePromotionData(results) {
      try {
        this.excelResults = []
        const skus = results.map(item => {
          const product = {}
          for (const header of PromotionHeaders) {
            if (header.label in item) {
              product[header.field] = this.parseValue(header.type, item[header.label])
            }
          }
          return product
        })
        const promotionIds = uniq(skus.map(item => item.promotionId))
        const editingIds = []
        const promotionResponse = await getPromotionsApi({
          offset: 1,
          limit: promotionIds.length,
          ids: promotionIds.join(',')
        })
        if (promotionResponse.code === 200) {
          const list = promotionResponse.data.result.list
          for (const item of list) {
            if (item.status === promotion_status_init) {
              editingIds.push(item.id)
            }
          }
        }
        const filterSkus = skus.filter(item => editingIds.includes(item.promotionId) &&
          !isEmpty(item.mpu) && item.discount > 0)
        const fetchList = filterSkus.map(item => item.mpu)
        const validMpus = []
        if (fetchList.length > 0) {
          for (let begin = 0; begin < fetchList.length; begin += 50) {
            const params = {
              mpuIdList: fetchList.slice(begin, begin + 50).join(',')
            }
            const response = await getProductsByMpuListApi(params)
            const data = response.data.result
            if (data.length > 0) {
              data.forEach(product => {
                if (this.isSearchProductValid(product)) {
                  validMpus.push(product.mpu)
                }
              })
            }
          }
        }
        const parsedSkus = filterSkus.filter(item => validMpus.includes(item.mpu))
        this.excelResults = parsedSkus
        let msg = `成功导入${parsedSkus.length}个商品，`
        msg += `无效商品为${skus.length - parsedSkus.length}个。`
        this.$message.info(msg)
      } catch (e) {
        console.warn('Import promotions error:' + e)
        this.$message.warning('导入活动商品失败')
      } finally {
        this.loading = false
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
