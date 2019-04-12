<template>
  <div class="delivery-import-container">
    <el-form v-loading="loading"
             ref="form"
             :model="form"
             :rules="formRules"
             label-position="right"
             label-width="150px"
             class="form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  " />
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="8" prop="orderId">
          <el-form-item label="订单编号" prop="orderId">
            <el-input v-model="form.orderId" name="orderId" class="form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="8">
          <el-form-item label="子订单号" prop="skuId">
            <el-input v-model="form.skuId" name="skuId" class="form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="8">
          <el-form-item label="快递单号" prop="deliveryId">
            <el-input v-model="form.deliveryId" name="deliveryId" class="form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="8">
          <el-form-item label="备注" prop="notes">
            <el-input
              :rows="2"
              v-model="form.notes"
              type="textarea"
              placeholder="请输入内容"
              class="form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="formSubmit">{{ $t('confirm_button_ok_title') }}
          </el-button>
          <el-button type="warning" style="font-size:16px;" @click="formCancel">{{ $t('confirm_button_cancel_title')
            }}
          </el-button>
          <el-button type="success" style="font-size:16px;" @click="deliveryImportExcel">导入EXCEL</el-button>
          <el-button type="primary" style="font-size:16px;" @click="downTemplate">下载模板文件
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <import-excel v-if="isVisibleDialog"
                  @close="deliveryCloseImport" />
  </div>
</template>

<script>
  import { deliveryUpload } from '@/api/orders'
  import ImportExcel from './importExcel'

  export default {
    components: {
      ImportExcel
    },
    data() {
      const ruleValidateNumber = (rule, value, callback) => {
        const reg = /^[0-9]+$/
        if (value.length < 1 || !reg.test(value)) {
          callback(new Error('请输入正确的单号'))
        } else {
          callback()
        }
      }
      const ruleValidateName = (rule, value, callback) => {
        if (value.length < 1) {
          callback(new Error('请输入正确的单号'))
        } else {
          callback()
        }
      }
      return {
        form: {
          orderId: '',
          skuId: '',
          deliveryId: '',
          notes: '',
          pageIndex: 1,
          pageSize: 10
        },
        formRules: {
          orderId: [{ required: true, trigger: 'blur', validator: ruleValidateNumber }],
          skuId: [{ required: true, trigger: 'blur', validator: ruleValidateName }],
          deliveryId: [{ required: true, trigger: 'blur', validator: ruleValidateName }]
        },
        list: [],
        totalNum: 1,
        isVisibleDialog: false,
        loading: false
      }
    },
    methods: {
      clearForm() {
        this.form.orderId = ''
        this.form.skuId = ''
        this.form.deliveryId = ''
        this.form.notes = ''

        this.form.pageIndex = 1
        this.form.pageSize = 10
      },
      formSubmit() {
        this.form.pageIndex = 1
        this.deliveryUploading()
      },
      formCancel() {
        this.clearForm()
      },
      deliveryImportExcel() {
        this.isVisibleDialog = true
      },
      deliveryCloseImport() {
        this.isVisibleDialog = false
      },
      delivery_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      delivery_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      delivery_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      downTemplate() {
        import('@/utils/exportToExcel').then(excel => {
          const tHeader = ['orderId', 'subOrderId', 'logisticsId', 'logisticsContent']
          const data = []
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'deliveryTemplate'
          })
        })
      },
      deliveryUploading() {
        this.loading = true
        if (this.form.orderId !== null) {
          this.form.orderId = this.form.orderId.trim()
        }
        if (this.form.skuId !== null) {
          this.form.skuId = this.form.skuId.trim()
        }
        if (this.form.deliveryId !== null) {
          this.form.deliveryid = this.form.deliveryId.trim()
        }
        this.$refs.form.validate(valid => {
          if (valid) {
            this.list = [{
              orderId: Number(this.form.orderId),
              subOrderId: this.form.skuId,
              logisticsId: this.form.deliveryId,
              logisticsContent: this.form.notes
            }]
            deliveryUpload(this.totalNum, this.list).then(response => {
                this.loading = false
                this.$alert('添加成功', {
                  confirmButtonText: '确定',
                  type:'success',
                  title: '物流信息添加',
                  callback: action => {
                    this.clearForm()
                  }
                })
            }).catch(err=>{
                this.loading = false
                // alert(err)
                this.$alert('添加失败', {
                  confirmButtonText: '确定',
                  type:'warn',
                  title: '物流信息添加'
                })
            })
          } else {
            // console.log('error submit!!')
            this.loading = false
            return false
          }
        })
      }
    }
  }
</script>

<style scoped>
  .delivery-import-container {
    text-content: center;
  }

  .form {
  }

  .delivery-table-expand {
    font-size: 0;
  }

  .delivery-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .delivery-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

