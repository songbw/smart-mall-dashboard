<template>
  <el-container>
    <el-main>
      <el-card
        shadow="never"
        style="width: 480px"
        :body-style="{padding: '40px'}"
      >
        <div slot="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div class="el-icon-user" style="font-size: 20px">
              修改密码
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
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              placeholder="请输入就密码"
              show-password
              maxlength="20"
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码"
              show-password
              maxlength="20"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input
              v-model="passwordForm.confirm"
              type="password"
              placeholder="再次输入密码"
              maxlength="20"
            />
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
import { validPassword } from '@/utils/validate'

export default {
  name: 'PasswordChange',
  data() {
    const validateOldPassword = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入登录密码'))
      } else {
        callback()
      }
    }
    const validateNewPassword = (rule, value, callback) => {
      if (validPassword(value)) {
        callback()
      } else {
        callback(new Error('请输入以字母开头，包含大小写及数字的8-20位密码'))
      }
    }
    const validateConfirm = (rule, value, callback) => {
      if (isEmpty(value) || value !== this.passwordForm.newPassword) {
        callback(new Error('请确保输入同样密码'))
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
        oldPassword: '',
        newPassword: '',
        confirm: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, trigger: 'change', validator: validateOldPassword }],
        newPassword: [{ required: true, trigger: 'change', validator: validateNewPassword }],
        confirm: [{ required: true, trigger: 'change', validator: validateConfirm }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userName'
    ])
  },
  methods: {
    getErrorMessage(error) {
      let msg = null
      if (error.response) {
        const status = error.response.status
        if (status >= 400) {
          const data = error.response.data
          const errno = Number.parseInt(data.error)
          if (!Number.isNaN(errno)) {
            if (errno === 400003) {
              msg = '登录密码错误，请确认后重试！'
            } else {
              msg = data.message + '，请确认后重试！'
            }
          }
        } else if (status >= 500) {
          msg = '服务平台出现问题，请联系管理员！'
        }
      }
      return msg
    },
    handlePasswordChange() {
      this.loading = true
      this.passwordForm.username = this.userName
      this.$store.dispatch('user/passwordChange', this.passwordForm).then(() => {
        this.$message({ message: '密码修改成功！', type: 'success' })
        this.$router.back()
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
          this.handlePasswordChange()
        }
      } catch (e) {
        console.log(`submit:${e}`)
      }
    }
  }
}
</script>

