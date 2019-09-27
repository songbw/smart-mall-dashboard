<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="导入商品"
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
      <el-form-item v-if="productCreation && isAdminUser" label="供应商名" prop="merchantId">
        <el-select :value="formData.merchantId" clearable @change="handleVendorChanged">
          <el-option
            v-for="item in productVendors"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span>{{ item.label }}</span>
          </el-option>
        </el-select>
      </el-form-item>
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
      <el-table-column label="商品SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="productPromotion" label="促销价格(元)" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.discount ? Number.parseFloat(scope.row.price) - scope.row.discount : null }}</span>
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
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import XLSX from 'xlsx'
import { searchProductsApi } from '@/api/products'
import { product_state_on_sale } from '@/utils/constants'

const CreationHeaders = [
  { field: 'skuid', label: '商品SKU', type: 'string' },
  { field: 'name', label: '商品名称', type: 'string' },
  { field: 'brand', label: '商品品牌', type: 'string' },
  { field: 'brandId', label: '品牌编号', type: 'number' },
  { field: 'category', label: '类别编号', type: 'string' },
  { field: 'model', label: '商品型号', type: 'string' },
  { field: 'weight', label: '商品重量', type: 'string' },
  { field: 'image', label: '商品封面图', type: 'string' },
  { field: 'upc', label: '商品条形码', type: 'string' },
  { field: 'saleunit', label: '销售单位', type: 'string' },
  { field: 'price', label: '销售价格(元)', type: 'string' },
  { field: 'sprice', label: '进货价格(元)', type: 'string' },
  { field: 'inventory', label: '商品库存', type: 'number' },
  { field: 'imagesUrl', label: '商品主图', type: 'string' },
  { field: 'introductionUrl', label: '商品描述图', type: 'string' }
]

const PromotionHeaders = [
  { field: 'skuid', label: '商品SKU', type: 'string' },
  { field: 'pprice', label: '促销价格(元)', type: 'string' }
]

const SkuHeaders = [
  { field: 'skuid', label: '商品SKU', type: 'string' }
]

export default {
  name: 'GoodsImportDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    productCreation: {
      type: Boolean,
      default: false
    },
    productPromotion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formRules: {
        merchantId: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === null && this.productCreation && this.isAdminUser) {
              callback(new Error('请选择商品供应商'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      },
      formData: {
        merchantId: null,
        fileName: null
      },
      percentage: 0,
      excelResults: []
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      vendorId: 'vendorId',
      productVendors: 'productVendors'
    })
  },
  methods: {
    handleVendorChanged(value) {
      this.formData.merchantId = value
      this.excelResults.forEach(item => {
        item.merchantId = value
      })
    },
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
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
        const pHeader = this.productPromotion ? PromotionHeaders : SkuHeaders
        const tHeader = this.productCreation ? CreationHeaders : pHeader
        const data = []
        excel.export_json_to_excel({
          header: tHeader.map(header => header.label),
          data,
          filename: '导入商品信息模板'
        })
      })
    },
    handleDialogCancel() {
      this.loading = false
      this.clearDialogData()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      const skus = this.excelResults
      if (skus.length > 0) {
        this.$refs.importForm.validate((valid) => {
          if (valid) {
            this.$emit('onSelectionConfirmed', skus)
            this.clearDialogData()
          }
        })
      } else {
        this.$emit('onSelectionConfirmed', skus)
        this.clearDialogData()
      }
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
      if (this.productCreation) {
        this.parseCreateSkuData(results)
      } else if (this.productPromotion) {
        this.parsePromotionData(results)
      } else {
        this.searchSkuData(results)
      }
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
    parseCreateSkuData(results) {
      let count = 0
      results.forEach(item => {
        const product = {}
        CreationHeaders.forEach(header => {
          if (header.label in item) {
            product[header.field] = this.parseValue(header.type, item[header.label])
          }
        })
        if (!isEmpty(product) && !isEmpty(product.name)) {
          if (this.isAdminUser) {
            if (this.formData.merchantId) {
              product.merchantId = this.formData.merchantId
            }
          } else {
            product.merchantId = this.vendorId
          }
          count++
          this.excelResults.push(product)
        }
      })
      this.loading = false
      this.$message.info(`成功导入${count}个商品，无效商品为${results.length - count}个`)
    },
    async parsePromotionData(results) {
      let fetchedNum = 0
      const parsedSkus = []
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const product = {}
        PromotionHeaders.forEach(header => {
          if (header.label in result) {
            product[header.field] = this.parseValue(header.type, result[header.label])
          }
        })
        if ('skuid' in product && !isEmpty(product.skuid)) {
          try {
            const response = await searchProductsApi({ offset: 1, limit: 10, skuid: product.skuid })
            fetchedNum++
            this.percentage = Math.round(fetchedNum * 100 / results.length)
            const data = response.data.result
            if (data.total === 1) {
              const fetchedData = data.list[0]
              if (this.isSearchProductValid(fetchedData)) {
                const item = {
                  skuid: fetchedData.skuid,
                  mpu: fetchedData.mpu,
                  price: fetchedData.price,
                  name: fetchedData.name,
                  brand: fetchedData.brand,
                  imagePath: fetchedData.image,
                  intro: ''
                }
                if ('pprice' in product) {
                  const pprice = Number.parseFloat(product.pprice)
                  const price = Number.parseFloat(item.price)
                  if (!Number.isNaN(pprice) && !Number.isNaN(price)) {
                    item.discount = price > pprice ? (price - pprice) : 0
                  }
                }
                parsedSkus.push(item)
              }
            }
          } catch (err) {
            console.log('GoodImport: search error ' + product.skuid)
          }
        }
      }
      this.excelResults = parsedSkus
      this.loading = false
      this.$message.info(`成功导入${parsedSkus.length}个商品，无效商品为${results.length - parsedSkus.length}个`)
    },
    async searchSkuData(results) {
      const fetchedSkus = []
      let fetchedNum = 0
      for (let i = 0; i < results.length; i++) {
        const item = results[i]
        const skuID = this.parseValue(SkuHeaders[0].type, item[SkuHeaders[0].label])
        if (skuID) {
          try {
            const response = await searchProductsApi({ offset: 1, limit: 10, skuid: skuID })
            fetchedNum++
            this.percentage = Math.round(fetchedNum * 100 / results.length)
            const data = response.data.result
            if (data.total === 1) {
              const product = data.list[0]
              if (this.isSearchProductValid(product)) {
                const item = {
                  skuid: product.skuid,
                  mpu: product.mpu,
                  price: product.price,
                  name: product.name,
                  brand: product.brand,
                  imagePath: product.image,
                  intro: ''
                }
                fetchedSkus.push(item)
              }
            }
          } catch (err) {
            console.log('GoodImport: search error ' + skuID)
          }
        }
      }
      this.excelResults = fetchedSkus
      this.loading = false
      this.$message.info(`成功导入${fetchedSkus.length}个商品，无效商品为${results.length - fetchedSkus.length}个`)
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
