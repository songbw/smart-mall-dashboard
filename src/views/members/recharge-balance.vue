<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :visible.sync="dialogVisible"
    title="余额充值"
  >
    <el-form
      ref="rechargeForm"
      :model="rechargeForm"
      :rules="rechargeRules"
      label-position="right"
      label-width="160px"
    >
      <el-form-item v-if="name" label="会员姓名">
        <el-input :value="name" readonly />
      </el-form-item>
      <el-form-item v-if="telephone" label="会员电话">
        <el-input :value="telephone" readonly />
      </el-form-item>
      <el-form-item label="充值额度(元)" prop="amount">
        <el-input-number
          v-model="rechargeForm.amount"
          :precision="2"
          :step="1"
          :min="0"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelRecharge">取消</el-button>
      <el-button type="primary" @click="confirmRecharge">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'RechargeBalance',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    telephone: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      rechargeForm: {
        amount: 0
      },
      rechargeRules: {
        amount: [{
          required: true, validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请输入有效的充值额度'))
            }
          }, trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    cancelRecharge() {
      this.$refs.rechargeForm.clearValidate()
      this.$emit('cancelled')
    },
    confirmRecharge() {
      this.$refs.rechargeForm.validate(async valid => {
        if (valid) {
          this.$emit('confirmed', this.rechargeForm.amount)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
