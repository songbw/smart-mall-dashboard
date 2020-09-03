<template>
  <el-container>
    <el-main>
      <el-card
        shadow="never"
        style="width: 480px;margin: 0 auto"
        :body-style="{padding: '40px'}"
      >
        <div slot="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div class="el-icon-user" style="font-size: 20px">
              手机验证登录
            </div>
          </div>
        </div>
        <el-form
          ref="twoFactorForm"
          :model="twoFactorForm"
          :rules="twoFactorRules"
          label-position="right"
          label-width="6rem"
          @keyup.enter.native="handleSubmit"
        >
          <el-form-item label="手机号码">
            <div style="display: flex;justify-content: space-between">
              <el-input :value="displayPhone" readonly style="width: 10rem" />
              <el-button
                :disabled="timedOut < 60"
                plain
                @click="handleGetCode"
              >
                {{ codeButtonLabel }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="手机验证码" prop="code">
            <div style="display: flex;justify-content: space-between">
              <el-input
                v-model="twoFactorForm.code"
                placeholder="输入手机验证码"
                maxlength="6"
                style="width: 10rem"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              style="width: 100%"
              icon="el-icon-user"
              @click="handleSubmit"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import {
  validVerificationCode
} from '@/utils/validate'
import {
  platform_renter_id,
  role_admin_name,
  role_renter_name,
  role_watcher_name,
  storage_merchant_id,
  storage_renter_id,
  vendor_status_approved
} from '@/utils/constants'
import { storageSetItem } from '@/utils/storage'

export default {
  name: 'TwoFactorAuth',
  data() {
    const validateCode = (rule, value, callback) => {
      if (value.length !== 6 || validVerificationCode(value) === false) {
        callback(new Error('请输入正确的验证码'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      timedOut: 60,
      captcha: '',
      timer: null,
      twoFactorForm: {
        phone: '',
        code: ''
      },
      twoFactorRules: {
        code: [{ required: true, trigger: 'change', validator: validateCode }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userPhone'
    ]),
    displayPhone() {
      const len = this.userPhone.length
      if (len >= 8) {
        const reg = this.userPhone.slice(-8, -4)
        return this.userPhone.replace(reg, '****')
      } else {
        return ''
      }
    },
    codeButtonLabel() {
      return this.timedOut < 60 ? `${this.timedOut} 秒` : '获取验证码'
    }
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    startTimer() {
      this.clearTimer()
      this.timedOut--
      this.timer = setInterval(() => {
        this.timedOut--
        if (this.timedOut === 0) {
          this.clearTimer()
        }
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.timedOut = 60
    },
    handleGetCode() {
      if (!isEmpty(this.userPhone)) {
        this.startTimer()
        this.$store.dispatch('user/getVerificationCode', { phone: this.userPhone }).then((code) => {
          this.captcha = code
        }).catch(_ => {
          this.$message({
            message: '获取验证码失败，请稍后重试!',
            type: 'warning'
          })
          this.clearTimer()
        })
      }
    },
    async getVendorProfile() {
      try {
        const { status, id } = await this.$store.dispatch('vendor/getProfile')
        if (status === vendor_status_approved) {
          await storageSetItem(storage_merchant_id, id)
        } else {
          await storageSetItem(storage_merchant_id, -1)
        }
      } catch (e) {
        console.warn('Login vendor profile error:' + e)
      }
    },
    async getRenterProfile() {
      try {
        const { companyId, renterId } = await this.$store.dispatch('vendor/getRenterProfile')
        await storageSetItem(storage_merchant_id, companyId)
        await storageSetItem(storage_renter_id, renterId)
      } catch (e) {
        console.warn('Login renter profile error:' + e)
      }
    },
    handleSubmit() {
      this.$refs.twoFactorForm.validate(async valid => {
        if (valid) {
          try {
            this.twoFactorForm.phone = this.userPhone
            const role = await this.$store.dispatch('user/twoFactorAuth', this.twoFactorForm)
            if (role_admin_name === role || role_watcher_name === role) {
              this.$store.commit('vendor/SET_VENDOR_PROFILE', { id: 0, status: vendor_status_approved })
              await storageSetItem(storage_merchant_id, 0)
              await storageSetItem(storage_renter_id, platform_renter_id)
            } else {
              if (role_renter_name === role) {
                await this.getRenterProfile()
              } else {
                await this.getVendorProfile()
              }
            }
            await this.$router.replace({ path: '/' })
          } catch (e) {
            console.warn('Two Factor Login:' + e)
            let msg = '系统服务有问题，请联系管理员！'
            const res = e.response
            if (res && res.status >= 400 && res.status < 500) {
              if (res && res.data) {
                const data = res.data
                if (data.error && Number.parseInt(data.error) === 400004) {
                  msg = '手机验证码无效，请确认后重试！'
                } else {
                  msg = '用户手机号码无效，请确认后重试！'
                }
              }
            }
            this.$message.warning(msg)
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
