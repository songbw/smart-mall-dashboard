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
      <el-form-item v-if="needVendor" label="供应商名" prop="merchantId">
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
      <el-form-item v-if="productUpdate" label="上架可更新">
        <div>{{ changeOnSaleLabel }}</div>
      </el-form-item>
      <el-form-item v-if="productUpdate" label="需下架更新">
        <div>{{ changeNotSaleLabel }}</div>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      element-loading-text="正在导入..."
      :data="parsedSkuList"
      border
      style="width: 100%;margin-top:20px;"
      height="350"
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
      <el-table-column v-if="updateState" label="操作" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.state | productState }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!updateState" label="商品价格(元)" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="productPromotion" label="促销价格(元)" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row | promotionPrice }}</span>
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
import uniq from 'lodash/uniq'
import uniqBy from 'lodash/uniqBy'
import XLSX from 'xlsx'
import { getProductsByMpuList, searchProductsApi } from '@/api/products'
import {
  product_state_on_sale,
  product_state_off_shelves,
  ProductTaxRateOptions
} from '@/utils/constants'
import { ProductPermissions } from '@/utils/role-permissions'

const floatToFixed = (value, precision) =>
  parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision))
const convertToNumber = value => isNumber(value) ? floatToFixed(value, 2)
  : floatToFixed(Number.parseFloat(value), 2)
const convertToInt = value => Number.isInteger(value) ? value : Math.round(convertToNumber(value))

const CreationHeaders = [
  { field: 'skuid', label: '商品SKU', type: 'string', template: '(可填项)' },
  { field: 'name', label: '商品名称', type: 'string', template: '凤巢测试商品(必填项)' },
  { field: 'subTitle', label: '商品副标题', type: 'string', template: '凤巢测试商品副标题(可填项)' },
  { field: 'brand', label: '商品品牌', type: 'string', template: '凤巢品牌(可填项)' },
  { field: 'model', label: '商品型号', type: 'string', template: '(可填项)' },
  { field: 'weight', label: '商品重量', type: 'string', template: '(可填项)' },
  { field: 'image', label: '商品封面图', type: 'string', template: '(可填项)' },
  { field: 'upc', label: '商品条形码', type: 'string', template: '(可填项)' },
  { field: 'saleunit', label: '销售单位', type: 'string', template: '(可填项)' },
  { field: 'price', label: '销售价格(元)', type: 'float', template: '888.88(必填项)' },
  { field: 'sprice', label: '进货价格(元)', type: 'float', template: '666.66(可填项)' },
  { field: 'inventory', label: '商品库存', type: 'integer', template: '99999(可填项)' },
  { field: 'taxRate', label: '商品税率', type: 'string', template: '3%(可填项)' },
  { field: 'floorPrice', label: '销售底价(元)', type: 'float', template: '777.77(可填项)' },
  { field: 'comparePrice', label: '对比价格(元)', type: 'float', template: '999.99(可填项)' },
  { field: 'compareUrl', label: '对比商品链接', type: 'string', template: '(可填项)' }
]

const UpdateHeaders = [
  { field: 'mpu', label: '商品MPU', type: 'string', template: '10001234(必填项)', changeOnSale: false },
  { field: 'name', label: '商品名称', type: 'string', template: '凤巢测试商品(可填项)', changeOnSale: false },
  { field: 'subTitle', label: '商品副标题', type: 'string', template: '凤巢测试商品副标题(可填项)', changeOnSale: false },
  { field: 'brand', label: '商品品牌', type: 'string', template: '凤巢品牌(可填项)', changeOnSale: false },
  { field: 'model', label: '商品型号', type: 'string', template: '(可填项)', changeOnSale: true },
  { field: 'weight', label: '商品重量', type: 'string', template: '(可填项)', changeOnSale: true },
  { field: 'image', label: '商品封面图', type: 'string', template: '(可填项)', changeOnSale: false },
  { field: 'upc', label: '商品条形码', type: 'string', template: '(可填项)', changeOnSale: true },
  { field: 'saleunit', label: '销售单位', type: 'string', template: '(可填项)', changeOnSale: true },
  { field: 'price', label: '销售价格(元)', type: 'float', template: '888.88(可填项)', changeOnSale: false },
  { field: 'sprice', label: '进货价格(元)', type: 'float', template: '666.66(可填项)', changeOnSale: false },
  { field: 'inventory', label: '商品库存', type: 'integer', template: '99999(可填项)', changeOnSale: false },
  { field: 'taxRate', label: '商品税率', type: 'string', template: '3%(可填项)', changeOnSale: true },
  { field: 'floorPrice', label: '销售底价(元)', type: 'float', template: '777.77(可填项)', changeOnSale: true },
  { field: 'comparePrice', label: '对比价格(元)', type: 'float', template: '999.99(可填项)', changeOnSale: true },
  { field: 'compareUrl', label: '对比商品链接', type: 'string', template: '(可填项)', changeOnSale: true }
]

const UpdateStateHeaders = [
  { field: 'mpu', label: '商品MPU', type: 'string', template: '10001234(必填项)' },
  { field: 'state', label: '商品状态', type: 'string', template: '0(必填项 0:下架,1:上架)' }
]

const PromotionHeaders = [
  { field: 'mpu', label: '商品MPU', type: 'string', template: '10001234(必填项)' },
  { field: 'pprice', label: '促销价格(元)', type: 'float', template: '888.88(可填项)' }
]

const SkuHeaders = [
  { field: 'mpu', label: '商品MPU', type: 'string', template: '10001234(必填项)' }
]

const fileExt = filename => {
  const parts = filename.split('.')
  return (parts.length > 1) ? parts.pop() : ''
}

export default {
  name: 'GoodsImportDialog',
  filters: {
    promotionPrice: sku => {
      const discount = sku.discount > 0 ? Math.round(sku.discount * 100) : 0
      return discount > 0 ? discount / 100 : null
    },
    productState: state => {
      const value = Number.parseInt(state)
      return value === product_state_on_sale ? '上架' : '下架'
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    productCreation: {
      type: Boolean,
      default: false
    },
    productUpdate: {
      type: Boolean,
      default: false
    },
    productPromotion: {
      type: Boolean,
      default: false
    },
    updateState: {
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
            if (value === null && this.needVendor) {
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
      parsedSkuList: [],
      excelResults: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      vendorId: 'vendorId',
      productVendors: 'productVendors'
    }),
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    },
    hasSalePricePermission() {
      return this.userPermissions.includes(ProductPermissions.salePrice)
    },
    needVendor() {
      return this.productCreation && this.hasVendorPermission
    },
    changeOnSaleLabel() {
      return UpdateHeaders
        .filter(item => item.changeOnSale && item.field !== 'mpu')
        .map(item => item.label)
        .join('，')
    },
    changeNotSaleLabel() {
      return UpdateHeaders
        .filter(item => !item.changeOnSale && item.field !== 'mpu')
        .map(item => item.label)
        .join('，')
    }
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
      if (this.needVendor) {
        this.$refs.importForm.validateField('merchantId', errorMessage => {
          if (isEmpty(errorMessage)) {
            this.$refs['excel-upload-input'].click()
          }
        })
      } else {
        this.$refs['excel-upload-input'].click()
      }
    },
    getTemplateHeaders() {
      if (this.productCreation) {
        return this.hasSalePricePermission ? CreationHeaders : CreationHeaders.filter(item => item.field !== 'price')
      } else if (this.productUpdate) {
        return this.hasSalePricePermission ? UpdateHeaders : UpdateHeaders.filter(item => item.field !== 'price')
      } else if (this.productPromotion) {
        return PromotionHeaders
      } else if (this.updateState) {
        return UpdateStateHeaders
      } else {
        return SkuHeaders
      }
    },
    handleTemplate() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = this.getTemplateHeaders()
        const data = [tHeader.map(item => item.template)]
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
      this.$refs.importForm.clearValidate()
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
      this.parsedSkuList = []
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
      } else if (this.productUpdate) {
        this.parseUpdateSkuData(results)
      } else if (this.productPromotion) {
        this.parsePromotionData(results)
      } else if (this.updateState) {
        this.parseUpdateStateSkuData(results)
      } else {
        this.searchSkuData(results)
      }
    },
    parseValue(type, value) {
      let parsedValue = null
      if (isString(value) && isEmpty(value.trim())) {
        return null
      }
      switch (type) {
        case 'string':
          if (isString(value)) {
            parsedValue = value.trim()
          } else {
            parsedValue = value != null ? value.toString() : null
          }
          break
        case 'integer':
          parsedValue = convertToInt(value)
          break
        case 'float':
          parsedValue = convertToNumber(value)
          break
        default:
          break
      }
      return parsedValue
    },
    parseCreateSkuData(results) {
      let count = 0
      const importHeaders = this.hasSalePricePermission
        ? CreationHeaders : CreationHeaders.filter(item => item.field !== 'price')
      results.forEach(item => {
        const product = {}
        importHeaders.forEach(header => {
          if (header.label in item) {
            const value = this.parseValue(header.type, item[header.label])
            if (value !== null) {
              product[header.field] = value
            }
          }
        })
        if (!isEmpty(product) && !isEmpty(product.name)) {
          if (this.hasVendorPermission) {
            if (this.formData.merchantId) {
              product.merchantId = this.formData.merchantId
            }
          } else {
            product.merchantId = this.vendorId
          }
          if (!('skuid' in product)) {
            product.skuid = ''
          }
          if ('taxRate' in product) {
            const taxOption = ProductTaxRateOptions.find(item => item.label === product.taxRate)
            product.taxRate = taxOption ? taxOption.value : ''
          }
          count++
          this.parsedSkuList.push(product)
        }
      })
      this.excelResults = this.parsedSkuList
      this.loading = false
      this.$message.info(`成功导入${count}个商品，无效商品为${results.length - count}个`)
    },
    isReadyForSale(product) {
      const price = Number.parseFloat(product.price)
      return !(Number.isNaN(price) || price < 0 ||
        isEmpty(product.image) ||
        isEmpty(product.imagesUrl) ||
        isEmpty(product.introductionUrl) ||
        isEmpty(product.category)
      )
    },
    async parseUpdateStateSkuData(results) {
      const fetchList = []
      for (const item of results) {
        const product = {}
        UpdateStateHeaders.forEach(header => {
          if (header.label in item) {
            const value = this.parseValue(header.type, item[header.label])
            if (value !== null) {
              product[header.field] = value
            }
          }
        })
        if ('mpu' in product && 'state' in product && !isEmpty(product.mpu)) {
          const state = Number.parseInt(product.state)
          if (state === product_state_on_sale || state === product_state_off_shelves) {
            fetchList.push(product)
          }
        }
      }
      const mpuList = await this.getProductsByMpuList(fetchList.map(item => item.mpu))
      const productList = fetchList.map(item => {
        const find = mpuList.find(mpuItem => mpuItem.mpu === item.mpu)
        if (find) {
          const state = Number.parseInt(item.state)
          const couldAdd = state === product_state_on_sale ? this.isReadyForSale(find) : true
          const hasPermission = this.hasVendorPermission ? true : find.merchantId === this.vendorId
          return couldAdd && hasPermission ? { ...find, ...item } : null
        } else {
          return null
        }
      })
      this.parsedSkuList = productList.filter(item => item !== null)
      this.excelResults = this.parsedSkuList.map(item => ({ mpu: item.mpu, state: item.state }))
      this.loading = false
      const count = this.excelResults.length
      this.$message.info(`成功导入${count}个商品，无效商品为${results.length - count}个`)
    },
    async getProductsByMpuList(fetchList) {
      let mpuList = []
      for (let begin = 0; begin < fetchList.length; begin += 50) {
        const params = {
          mpuIdList: fetchList.slice(begin, begin + 50).join(',')
        }
        try {
          const { code, data } = await getProductsByMpuList(params)
          if (code === 200 && data.result.length > 0) {
            mpuList = mpuList.concat(data.result)
          }
        } catch (err) {
          console.warn('Coupon Goods: search error:' + err)
        }
      }
      return mpuList
    },
    async parseUpdateSkuData(results) {
      const importHeaders = this.hasSalePricePermission
        ? UpdateHeaders : UpdateHeaders.filter(item => item.field !== 'price')
      const fetchList = []
      for (const item of results) {
        const product = {}
        importHeaders.forEach(header => {
          if (header.label in item) {
            const value = this.parseValue(header.type, item[header.label])
            if (value !== null) {
              product[header.field] = value
            }
          }
        })
        if ('mpu' in product && Object.keys(product).length > 1) {
          if ('taxRate' in product) {
            const taxOption = ProductTaxRateOptions.find(
              item => item.label === product.taxRate || item.value === product.taxRate
            )
            product.taxRate = taxOption ? taxOption.value : ''
          }
          fetchList.push(product)
        }
      }
      const mpuList = await this.getProductsByMpuList(fetchList.map(item => item.mpu))
      const productList = fetchList.map(item => {
        const find = mpuList.find(mpuItem => mpuItem.mpu === item.mpu)
        if (find) {
          const couldAdd = this.hasVendorPermission ? true : find.merchantId === this.vendorId
          return couldAdd ? { ...find, ...item } : null
        } else {
          return null
        }
      })
      this.parsedSkuList = productList.filter(item => item !== null)
      this.excelResults = fetchList
        .map(item => {
          const { mpu, ...updateItems } = item
          const find = this.parsedSkuList.find(mpuItem => mpuItem.mpu === mpu)
          const state = Number.parseInt(find.state)
          if (state !== product_state_on_sale) {
            return { id: find.id, ...updateItems }
          } else {
            const keys = UpdateHeaders.filter(item => item.changeOnSale).map(item => item.field)
            const onSaleUpdateItems = {}
            for (const key of keys) {
              if (key in updateItems) {
                onSaleUpdateItems[key] = updateItems[key]
              }
            }
            return isEmpty(onSaleUpdateItems) ? null : { id: find.id, ...onSaleUpdateItems }
          }
        })
        .filter(item => item !== null)
      const count = this.excelResults.length
      this.loading = false
      this.$message.info(`成功导入${count}个商品，无效商品为${results.length - count}个`)
    },
    async parsePromotionData(results) {
      const parsedSkus = []
      const skus = results.map(item => {
        const product = {}
        for (const header of PromotionHeaders) {
          if (header.label in item) {
            const value = this.parseValue(header.type, item[header.label])
            if (value != null) {
              product[header.field] = value
            }
          }
        }
        return product
      })
      const filterSkus = uniqBy(skus.filter(item => 'mpu' in item && !isEmpty(item.mpu)), 'mpu')
      const mpuList = await this.getProductsByMpuList(filterSkus.map(item => item.mpu))
      const validMpuList = mpuList.filter(item => this.isSearchProductValid(item))
      for (const product of validMpuList) {
        const promotion = filterSkus.find(item => item.mpu === product.mpu)
        const item = {
          skuid: product.skuid,
          mpu: product.mpu,
          price: product.price,
          floorPrice: product.floorPrice,
          name: product.name,
          brand: product.brand,
          imagePath: product.image,
          intro: ''
        }
        if ('pprice' in promotion) {
          const pprice = Number.parseFloat(promotion.pprice)
          const price = Number.parseFloat(item.price)
          if (!Number.isNaN(pprice) && !Number.isNaN(price) && pprice > 0 && price > 0) {
            const ipprice = Math.round(pprice * 100)
            const iprice = Math.round(price * 100)
            item.discount = iprice > ipprice ? ipprice / 100 : 0
          }
        }
        parsedSkus.push(item)
      }
      this.parsedSkuList = parsedSkus
      this.excelResults = parsedSkus
      this.loading = false
      let msg = `成功导入${parsedSkus.length}个商品，`
      msg += `重复商品为${skus.length - filterSkus.length}个，`
      msg += `无效商品为${filterSkus.length - parsedSkus.length}个。`
      this.$message.info(msg)
    },
    async searchSkuData(results) {
      const parsedMpuList = uniq(results.map(item => this.parseValue(SkuHeaders[0].type, item[SkuHeaders[0].label])))
      const mpuList = await this.getProductsByMpuList(parsedMpuList)
      const fetchedSkus = mpuList
        .filter(item => this.isSearchProductValid(item))
        .map(product => ({
          skuid: product.skuid,
          mpu: product.mpu,
          price: product.price,
          floorPrice: product.floorPrice,
          name: product.name,
          brand: product.brand,
          imagePath: product.image,
          intro: ''
        }))
      this.parsedSkuList = fetchedSkus
      this.excelResults = fetchedSkus
      this.loading = false
      let msg = `成功导入${fetchedSkus.length}个商品，`
      msg += `无效商品为${results.length - fetchedSkus.length}个。`
      this.$message.info(msg)
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
