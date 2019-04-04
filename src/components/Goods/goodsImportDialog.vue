<template>
  <el-dialog :visible="dialogVisible"
             :title="$t('aggregation_customization_goods_import_title')"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             width="60%"
             center>
    <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls"
           @change="handleFileChange">
    <el-form label-width="160px">
      <el-form-item label="文件">
        <el-input v-model="fileName" readonly />
        <span>建议上传大小不超过1M的.xls文件，最多200个商品</span>
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
    <el-table :data="excelData.results" border highlight-current-row style="width: 100%;margin-top:20px;"
              max-height="250">
      <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_name_title')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.intro }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('product_table_price_title')" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button @click="handleDialogCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
      <el-button type="primary" @click="handleDialogConfirm">{{ $t('confirm_button_ok_title') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import XLSX from 'xlsx'
  import { searchProductInfo } from '@/api/products'

  export default {
    name: 'GoodsImportDialog',
    props: {
      dialogVisible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        loading: false,
        fileName: '',
        excelData: {
          header: [],
          results: []
        }
      }
    },
    methods: {
      handleFileChange(e) {
        const files = e.target.files
        const rawFile = files[0] // only use files[0]
        if (!rawFile) return
        this.fileName = rawFile.name
        this.$refs['excel-upload-input'].value = null // fix can't select the same excel
        this.readDate(rawFile)
      },
      handleSelect() {
        this.$refs['excel-upload-input'].click()
      },
      handleTemplate() {
        import('@/utils/exportToExcel').then(excel => {
          const tHeader = ['skuID']
          const data = []
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '导入商品信息模板'
          })
        })
      },
      handleDialogCancel() {
        this.clearDialogData()
        this.$emit('onSelectionCancelled')
      },
      handleDialogConfirm() {
        const skus = this.excelData.results
        this.$emit('onSelectionConfirmed', skus)
        this.clearDialogData()
      },
      clearDialogData() {
        this.fileName = ''
        this.excelData.header = []
        this.excelData.results = []
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
      async generateData({ header, results }) {
        this.excelData.header = header
        const fetchedSkus = []
        for (let i = 0; i < results.length; i++) {
          const skuID = results[i].skuID
          try {
            const response = await searchProductInfo({ offset: 1, limit: 10, skuid: skuID })
            const data = response.result
            if (data.total > 0) {
              const product = data.list[0]
              const item = {}
              item.skuid = product.skuid
              item.price = product.price
              item.image = product.image
              item.intro = product.brand + ` ` + product.name
              fetchedSkus.push(item)
            }
          } catch (err) {
            console.log('GoodImport: search error ' + skuID)
          }
        }
        this.excelData.results = fetchedSkus
        this.loading = false
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
