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
              重置密码
            </div>
          </div>
        </div>
        <el-form
          ref="passwordForm"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="新密码" prop="password">
            <el-input
              v-model="regPassword"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input
              v-model="passwordForm.confirm"
              type="password"
              placeholder="再次输入密码"
            />
          </el-form-item>
          <el-form-item label="手机号码">
            <div style="display: flex;justify-content: space-between">
              <span style="width: 60%"> {{ displayPhone }}</span>
              <el-button
                :disabled="timedOut < 60"
                plain
                style="width: 38%"
                @click="handleGetCode"
              >
                {{ codeButtonLabel }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="手机验证码" prop="code">
            <div style="display: flex;justify-content: space-between">
              <el-input
                v-model="passwordForm.code"
                type="number"
                placeholder="输入手机验证码"
                style="width: 60%"
              />
              <span v-if="showCode" style="font: 25px Georgia;background: #C0C4CC">{{ captcha }}</span>
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
              修改密码
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
import trim from 'lodash/trim'
import {
  validPassword,
  validVerificationCode
} from '@/utils/validate'

export default {
  name: 'PasswordReset',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (validPassword(value)) {
        callback()
      } else {
        callback(new Error('请输入以字母开头，包含大小写及数字的8-20位密码'))
      }
    }
    const validateConfirm = (rule, value, callback) => {
      if (value.length < 6 || value !== this.passwordForm.password) {
        callback(new Error('请确保输入同样密码'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value.length !== 6 || validVerificationCode(value) === false) {
        callback(new Error('请输入正确的验证码'))
      } else {
        callback()
      }
    }
    return {
      title: process.env.VUE_APP_NAME,
      showCode: false,
      loading: false,
      timedOut: 60,
      timer: null,
      captcha: '',
      passwordForm: {
        username: '',
        password: '',
        confirm: '',
        phone: '',
        code: ''
      },
      passwordRules: {
        password: [{ required: true, trigger: 'change', validator: validatePassword }],
        confirm: [{ required: true, trigger: 'change', validator: validateConfirm }],
        code: [{ required: true, trigger: 'change', validator: validateCode }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userName',
      'userPhone'
    ]),
    regPassword: {
      get() {
        return this.passwordForm.password
      },
      set(value) {
        this.passwordForm.password = trim(value)
      }
    },
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
    gotoLogin() {
      this.$router.replace('/login')
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
    getErrorMessage(error) {
      let msg = null
      if (error.response) {
        const status = error.response.status
        if (status >= 400) {
          const data = error.response.data
          const errno = Number.parseInt(data.error)
          if (!Number.isNaN(errno)) {
            msg = data.message + '，请确认后重试！'
          }
        } else if (status >= 500) {
          msg = '服务平台出现问题，请联系管理员！'
        }
      }
      return msg
    },
    handlePasswordNew() {
      this.loading = true
      this.passwordForm.username = this.userName
      this.passwordForm.phone = this.userPhone
      this.$store.dispatch('user/passwordNew', this.passwordForm).then(() => {
        this.$message({ message: '密码修改成功！', type: 'success' })
        this.gotoLogin()
      }).catch((e) => {
        const msg = this.getErrorMessage(e) || '密码修改失败，请联系管理员!'
        this.$message({
          message: msg,
          type: 'error'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    async handleSubmit() {
      try {
        const valid = await this.$refs.passwordForm.validate()
        if (valid) {
          this.handlePasswordNew()
        }
      } catch (e) {
        console.log(`submit:${e}`)
      }
    }
  }
}
</script>

