<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="编辑商品"
    @opened="skuInit"
  >
    <el-form ref="subSkuForm" :model="skuForm" :rules="formRules" label-width="160px">
      <el-form-item label="品种编码">
        <el-input readonly :value="subSku.code" />
      </el-form-item>
      <el-form-item label="进货价(元)">
        <el-input readonly :value="subSku.sprice | centFilter" />
      </el-form-item>
      <el-form-item label="建议销售价(元)">
        <el-input readonly :value="subSku.advisePrice | centFilter" />
      </el-form-item>
      <el-form-item label="销售价(元)" prop="price">
        <el-input-number
          v-model="skuForm.price"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import isNumber from 'lodash/isNumber'

export default {
  name: 'SubSkuInfo',
  filters: {
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        return (yuan / 100).toFixed(2)
      }
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    subSku: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      skuForm: {
        price: 0
      },
      formRules: {
        price: [{
          required: true, validator: (rule, value, callback) => {
            if (isNumber(value) && value > 0) {
              callback()
            } else {
              callback(new Error('请输入销售价'))
            }
          }, trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    skuInit() {
      this.skuForm.price = this.subSku.price > 0 ? this.subSku.price / 100 : 0
    },
    handleDialogCancel() {
      this.$refs.subSkuForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.subSkuForm.validate(valid => {
        if (valid) {
          const price = Math.round(this.skuForm.price * 100)
          this.skuForm.price = price * 100
          this.$emit('confirmed', {
            id: this.subSku.id,
            price
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
