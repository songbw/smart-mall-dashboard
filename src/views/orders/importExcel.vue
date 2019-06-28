<template>
  <div>
    <el-dialog
      v-loading="loading"
      :before-close="excel_handleDialogClose"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <input
        id="upload"
        type="file"
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        @change="importFxx"
      >
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="excel_handleDialogClose">取消</el-button>
        <el-button :loading="addLoading" type="primary" @click.native="excelImportSub">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deliveryUploadApi } from '@/api/orders'
import XLSX from 'xlsx'

export default {
  name: 'ImportExcel',
  data() {
    return {
      inputValues: ['test'],
      addLoading: false,
      loading: false,
      dialogVisible: true
    }
  },
  created() {
    this.dialogVisible = true
  },
  methods: {
    excelImportSub() {
      // console.log('apply it ')
      this.addLoading = true
      deliveryUploadApi(this.inputValues.length, this.inputValues).then(response => {
        this.$alert(' 记录导入成功', {
          confirmButtonText: '确定',
          type: 'success',
          title: '物流信息文件记录导入',
          callback: action => {
            this.loading = false
            this.addLoading = false
            this.dialogVisible = false
            this.$emit('close')
          }
        })
        this.loading = false
        this.addLoading = false
        this.dialogVisible = false
      }, error => {
        this.addLoading = false
        alert(error)
      })
    },
    excel_handleDialogClose() {
      this.$emit('close')
      this.dialogVisible = false
      // console.log('emit close')
    },
    importFxx() {
      this.loading = true
      const _this = this
      this.file = event.currentTarget.files[0]
      var isReadBinary = false
      var f = this.file

      var readerOuter = new FileReader()

      FileReader.prototype.readAsBinaryString = function(f) {
        var binary = ''
        // 是否将文件读取为二进制字符串
        var rABS = false
        var wb = null
        var outdata = null
        var reader = new FileReader()

        const fixdata = (data) => {
          var o = ''
          var l = 0
          var w = 10240
          for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
          o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
          return o
        }

        reader.onload = function(e) {
          const bytes = new Uint8Array(reader.result)
          const length = bytes.byteLength
          for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
          }

          if (rABS) {
            wb = XLSX.read(btoa(fixdata(binary)), {
              type: 'base64'
            })
          } else {
            wb = XLSX.read(binary, {
              type: 'binary'
            })
          }
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

          _this.inputValues = outdata.concat([])
          _this.loading = false
        }
        reader.readAsArrayBuffer(f)
      }
      if (isReadBinary) {
        readerOuter.readAsArrayBuffer(f)
      } else {
        readerOuter.readAsBinaryString(f)
      }
    }
  }
}
</script>
<style scoped>
  .import_input_title {
    font-size: 16px;
    font-weight: bold;
  }
</style>
