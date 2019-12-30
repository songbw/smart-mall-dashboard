<template>
  <el-dialog
    :visible="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="指定会员发放券码"
  >
    <el-form ref="redeemForm" :model="redeemForm" :rules="redeemRules" label-width="8rem">
      <el-form-item label="会员电话" prop="telephone">
        <el-autocomplete
          v-model.trim="redeemForm.telephone"
          :fetch-suggestions="queryMembers"
          :maxlength="11"
          placeholder="请输入待发放会员电话"
          @select="handleSelectMember"
        />
      </el-form-item>
      <el-form-item label="会员OpenID" prop="userOpenId">
        <el-input :value="redeemForm.userOpenId" maxlength="50" readonly />
      </el-form-item>
      <el-form-item label="用户券码">
        <el-input :value="code" readonly />
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
import { getMemberListApi } from '@/api/members'
import { validPhone } from '@/utils/validate'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'RedeemDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    appId: {
      type: String,
      default: ''
    },
    code: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      redeemForm: {
        telephone: '',
        userOpenId: ''
      },
      redeemRules: {
        userOpenId: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请通过电话号码选择所需的会员'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  methods: {
    async queryMembers(queryString, cb) {
      let results = []
      if (validPhone(queryString)) {
        try {
          const params = {
            pageNo: 1,
            pageSize: 1,
            telephone: queryString
          }
          const { code, data } = await getMemberListApi(params)
          if (code === 200) {
            results = data.userList.list.map(item => ({ value: item.telephone, openId: item.openId }))
          }
        } catch (e) {
          console.warn('Redeem coupon search members error:' + e)
        }
      }
      cb(results)
    },
    handleSelectMember(item) {
      this.redeemForm.userOpenId = this.appId + item.openId
    },
    handleDialogCancel() {
      this.$emit('cancelled')
      this.$refs.redeemForm.resetFields()
    },
    handleDialogConfirm() {
      this.$refs.redeemForm.validate((valid) => {
        if (valid) {
          this.$emit('confirmed', {
            userOpenId: this.redeemForm.userOpenId,
            appId: this.appId,
            userCouponCode: this.code
          })
          this.$refs.redeemForm.resetFields()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
