<template>
  <el-container>
    <el-header style="text-align: center">
      <h1>欢迎来到凤巢信息科技商城管理平台</h1>
    </el-header>
    <el-main>
      <el-card style="width: 480px;margin: 0 auto" :body-style="{padding: '40px'}">
        <div slot="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div class="el-icon-user" style="font-size: 20px">
              {{ isRegister ? '注册' : '重置密码' }}
            </div>
            <div>
              <span>已有账号？</span>
              <el-button type="text" @click="gotoLogin">登录</el-button>
            </div>
          </div>
        </div>
        <el-form
          ref="registerForm"
          :model="registerForm"
          :rules="registerRules"
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input
              v-model="registerForm.confirm"
              type="password"
              placeholder="再次输入密码"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <div style="display: flex;justify-content: space-between">
              <el-input
                v-model="registerForm.phone"
                type="tel"
                placeholder="输入手机号码"
                style="width: 60%"
              />
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
          <el-form-item label="验证码" prop="code">
            <div style="display: flex;justify-content: space-between">
              <el-input
                v-model="registerForm.code"
                type="number"
                placeholder="输入右侧验证码"
                style="width: 60%"
              />
              <span style="font: 25px Georgia;background: #C0C4CC">{{ captcha }}</span>
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
              {{ isRegister ? '注册' : '重置密码' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import {
  validUserName,
  validPhone,
  validVerificationCode
} from '@/utils/validate'

export default {
  name: 'Register',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (validUserName(value) === false) {
        callback(new Error('请输入3-20个以字母开头、可带数字、“_”、“.”的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('请输入长度不少于6位的密码'))
      } else {
        callback()
      }
    }
    const validateConfirm = (rule, value, callback) => {
      if (value.length < 6 || value !== this.registerForm.password) {
        callback(new Error('请确保输入同样密码'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (validPhone(value) === false) {
        callback(new Error('请输入正确的手机号码'))
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
      loading: false,
      timedOut: 60,
      timer: null,
      captcha: '',
      registerForm: {
        username: '',
        password: '',
        confirm: '',
        phone: '',
        code: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        confirm: [{ required: true, trigger: 'blur', validator: validateConfirm }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      isRegister: true
    }
  },
  computed: {
    codeButtonLabel() {
      return this.timedOut < 60 ? `${this.timedOut} 秒` : '获取验证码'
    }
  },
  created() {
    this.isRegister = this.$route.path === '/register'
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
      this.$refs.registerForm.validateField('phone', errorMessage => {
        if (isEmpty(errorMessage)) {
          this.startTimer()
          this.$store.dispatch('user/getVerificationCode', { phone: this.registerForm.phone }).then((code) => {
            this.captcha = code
          }).catch(_ => {
            this.$message({
              message: '获取验证码失败，请稍后重试!',
              type: 'warning'
            })
            this.clearTimer()
          })
        }
      })
    },
    handleRegister() {
      this.loading = true
      this.$store.dispatch('user/register', this.registerForm).then(() => {
        this.$message({ message: '恭喜你，注册成功！请登录完善信息。', type: 'success' })
        this.gotoLogin()
      }).catch((error) => {
        if (error.response) {
          const status = error.response.status
          if (status >= 400) {
            const errno = Number.parseInt(error.response.data.error)
            let msg = ''
            switch (errno) {
              case 400001:
                msg = '此用户名已被使用，请确认后重试'
                break
              case 400002:
                msg = '此手机号码已被使用，请确认后重试'
                break
              case 400003:
                msg = '手机验证码错误，请重新获取验证码'
                break
              default:
                msg = '注册失败，请检查填写内容'
            }
            this.$message({ message: msg, type: 'error' })
          } else if (status >= 500) {
            this.$message({
              message: '广告服务平台出现问题，请联系管理员!',
              type: 'error'
            })
          }
        } else {
          this.$message({
            message: '服务网络出现未知，请联系管理员!',
            type: 'error'
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handlePasswordNew() {
      this.loading = true
      this.$store.dispatch('user/passwordNew', this.registerForm).then(() => {
        this.$message({ message: '恭喜你，密码重置成功！', type: 'success' })
        this.gotoLogin()
      }).catch((_) => {
        this.$message({
          message: '密码重置失败，请检查用户名及手机号码!',
          type: 'error'
        })
      })
    },
    async handleSubmit() {
      try {
        const valid = await this.$refs.registerForm.validate()
        if (valid) {
          if (this.isRegister) {
            this.handleRegister()
          } else {
            this.handlePasswordNew()
          }
        }
      } catch (e) {
        console.log(`submit:${e}`)
      }
    }
  }
}
</script>

