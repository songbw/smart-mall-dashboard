<template>
  <el-dialog
    :visible="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="导出活动商品"
  >
    <el-form ref="exportForm" :model="exportForm" :rules="exportRules" label-width="5rem">
      <el-form-item label="导出规则">
        <span>{{ exportPolicy }}</span>
      </el-form-item>
      <el-form-item label="比价方法" prop="symbol">
        <el-select v-model="exportForm.symbol">
          <el-option
            v-for="item in methodOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="参考价格" prop="type">
        <el-select v-model="exportForm.type">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="系数(乘)" prop="coefficient">
        <el-input-number
          v-model="exportForm.coefficient"
          :precision="2"
          :step="0.05"
          :min="0"
          :max="10"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">
        确认
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ExportPromotions',
  props: {
    appId: {
      type: String,
      default: ''
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      methodOptions: [{
        value: 'more',
        label: '大于'
      }, {
        value: 'equals',
        label: '等于'
      }, {
        value: 'less',
        label: '小于'
      }],
      typeOptions: [{
        value: 'price',
        label: '销售价'
      }, {
        value: 'sprice',
        label: '进货价'
      }, {
        value: 'comparePrice',
        label: '第三方售价'
      }],
      exportForm: {
        symbol: null,
        coefficient: 1.1,
        type: null
      },
      exportRules: {
        symbol: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择有效的比价方法'))
            } else {
              callback()
            }
          }
        }],
        coefficient: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请选择有效的比价方法'))
            }
          }
        }],
        type: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择对应的参考价格'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  computed: {
    exportPolicy() {
      if (this.exportForm.type !== null && this.exportForm.symbol !== null) {
        const type = this.typeOptions.find(item => item.value === this.exportForm.type)
        const method = this.methodOptions.find(item => item.value === this.exportForm.symbol)
        return `活动价格 ${method.label} ${type.label} x ${this.exportForm.coefficient}`
      } else {
        return '请选择比价方法以及参考价格'
      }
    }
  },
  methods: {
    handleDialogCancel() {
      this.$emit('cancelled')
      this.$refs.exportForm.resetFields()
    },
    handleDialogConfirm() {
      this.$refs.exportForm.validate((valid) => {
        if (valid) {
          this.$emit('confirmed', { ...this.exportForm, appId: this.appId })
          this.$refs.exportForm.resetFields()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
