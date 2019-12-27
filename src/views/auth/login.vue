<template>
  <el-container>
    <el-header style="text-align: center">
      <h1>欢迎来到{{ title }}</h1>
    </el-header>
    <el-main>
      <el-card style="width: 480px;margin: 0 auto" :body-style="{padding: '40px'}">
        <div slot="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div class="el-icon-user" style="font-size: 20px">登录</div>
            <div>
              <span>还没有账号？</span>
              <el-button type="text" @click="gotoRegister">注册</el-button>
            </div>
          </div>
        </div>
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          label-position="right"
          label-width="100px"
          @keyup.enter.native="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginName" placeholder="请输入用户名" maxlength="20" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginPassword"
              placeholder="请输入密码"
              type="password"
              show-password
              maxlength="20"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              style="width: 100%"
              icon="el-icon-user"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="text"
              style="float: right"
              @click="gotoPasswordNew"
            >
              忘记密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
    <el-footer style="font-size: 12px;text-align: center">
      <div>
        <svg-icon icon-class="copyright" />
        <span>2018-2019 深圳凤巢信息科技有限公司</span>
      </div>
      <div>
        版本：{{ appVersion }}
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import {
  role_admin_name,
  role_watcher_name,
  storage_merchant_id,
  vendor_status_approved
} from '@/utils/constants'
import { storageSetItem } from '@/utils/storage'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入有效用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入登录密码'))
      } else {
        if (value === this.loginForm.username) {
          callback(new Error('请输入与用户名不一致的密码'))
        } else {
          callback()
        }
      }
    }
    return {
      title: process.env.VUE_APP_NAME,
      appVersion: process.env.VUE_APP_VERSION,
      loading: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      }
    }
  },
  computed: {
    loginName: {
      get() {
        return this.loginForm.username
      },
      set(value) {
        if (value === null) {
          this.loginForm.username = ''
        } else {
          this.loginForm.username = trim(value)
        }
      }
    },
    loginPassword: {
      get() {
        return this.loginForm.password
      },
      set(value) {
        if (value === null) {
          this.loginForm.password = ''
        } else {
          this.loginForm.password = trim(value)
        }
      }
    }
  },
  created() {
    this.resetUserState()
  },
  methods: {
    async resetUserState() {
      try {
        await this.$store.dispatch('user/resetUser')
      } catch (e) {
        console.warn('Login reset user error:' + e)
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            this.loading = true
            const username = this.loginForm.username
            const password = this.loginForm.password
            const data = await this.$store.dispatch('user/login', { username, password })
            if (data.passwordReset) {
              await this.$router.push({ path: '/password/reset' })
            } else {
              if (data.twoFactorAuth > 0) {
                await this.$router.push({ path: '/login/2fa' })
              } else {
                const role = await this.$store.dispatch('user/getRole')
                if (role_admin_name === role || role_watcher_name === role) {
                  this.$store.commit('vendor/SET_VENDOR_PROFILE', { id: 0, status: vendor_status_approved })
                  await storageSetItem(storage_merchant_id, 0)
                } else {
                  await this.getVendorProfile()
                }
                await this.$router.replace({ path: '/' })
              }
            }
          } catch (e) {
            console.warn('User Login:' + e)
            let msg = '系统服务有问题，请联系管理员！'
            const res = e.response
            if (res && res.status >= 400 && res.status < 500) {
              if (res && res.data) {
                const data = res.data
                if (data.error && Number.parseInt(data.error) === 400006) {
                  msg = '此用户名未注册，请确认后重试！'
                } else {
                  msg = '用户名或密码错误，请确认后重试！'
                }
              }
            }
            this.$message.warning(msg)
          } finally {
            this.loading = false
          }
        }
      })
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
    gotoRegister() {
      this.$router.replace('/register')
    },
    gotoPasswordNew() {
      this.$router.replace('/password/new')
    }
  }
}
</script>

