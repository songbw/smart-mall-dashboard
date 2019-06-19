<template>
  <el-container>
    <el-header style="text-align: center">
      <h1>欢迎来到凤巢信息科技商城管理平台</h1>
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
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" placeholder="请输入密码" show-password />
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
  </el-container>
</template>

<script>
import isEmpty from 'lodash/isEmpty'

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
      if (isEmpty(value) || value.length < 6) {
        callback(new Error('请输入不小于6位密码'))
      } else {
        callback()
      }
    }
    return {
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
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            this.loading = true
            const username = this.loginForm.username
            const password = this.loginForm.password
            await this.$store.dispatch('user/login', {
              username,
              password
            })
            await this.$store.dispatch('user/getRole')
            this.$router.push({ path: '/' })
          } catch (e) {
            console.warn('User Login:' + e)
            this.$message.warning('用户名或密码错误，请确认后重试！')
          } finally {
            this.loading = false
          }
        }
      })
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
