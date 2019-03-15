<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
             label-position="left">
      <h3 class="title">{{ $t('login_title') }}</h3>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user"/>
        </span>
        <el-input :placeholder="$t('login_username_tips')" v-model="loginForm.username" name="username" type="text"
                  auto-complete="on"/>
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
        <el-input :type="pwdType" :placeholder="$t('login_password_tips')" v-model="loginForm.password" name="password"
                  auto-complete="on" @keyup.enter.native="handleLogin"/>
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye"/>
        </span>
      </el-form-item>
      <el-row v-show="isShowGetCode" :span="30">
        <el-col :span="16">
          <el-form-item prop="verifyCode">
            <el-input :placeholder="$t('login_code_tips')" v-model="loginForm.verifyCode" name="verifyCode" type="text"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="verifyCode">
            <el-button type="primary" style="width:100%; font-size:18px" @click.native.prevent="handleVerifyCode">
              {{ verifyCodeGet }}
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleLogin">
          {{ $t('login_signin_title') }}
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleRegister">
          {{ $t('register_label') }}
        </el-button>
      </el-form-item>
    </el-form>

    <user-register v-if="isVisibleRegistry"
                   :id="1"
                   @close="user_handleRegistryClose"/>
  </div>
</template>

<script>
  import { isRightUsername } from '@/utils/validate'
  import { getCode } from '../../api/userLogin'
  import UserRegister from './userRegister'

  export default {
    name: 'Login',
    components: {
      UserRegister
    },
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!isRightUsername(value)) {
          callback(new Error('请输入正确的用户名'))
          this.isShowGetCode = false
        } else {
          this.isShowGetCode = true
          this.verifyCodeGet = '获取验证码'
          callback()
        }
      }
      const validatePass = (rule, value, callback) => {
        if (value.length < 4) {
          callback(new Error('密码不能小于4位'))
        } else {
          callback()
        }
      }
      const validateVerifyCode = (rule, value, callback) => {
        if (value.length < 4) {
          callback(new Error('验证码不能小于4位'))
        } else {
          callback()
        }
      }
      return {
        loginForm: {
          username: '',
          password: '',
          verifyCode: ''
        },
        loginRules: {
          username: [{ required: true, trigger: 'blur', validator: validateUsername }],
          password: [{ required: true, trigger: 'blur', validator: validatePass }],
          verifyCode: [{ required: true, trigger: 'blur', validator: validateVerifyCode }]
        },
        loading: false,
        pwdType: 'password',
        isShowGetCode: false,
        verifyCodeGet: '获取验证码',
        isVisibleRegistry: false
      }
    },
    methods: {
      showPwd() {
        if (this.pwdType === 'password') {
          this.pwdType = ''
        } else {
          this.pwdType = 'password'
        }
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('UserLogin', this.loginForm).then(() => {
              this.loading = false
              // console.log('=== UserLogin done')
              this.$router.push({ path: '/' })
            }).catch((error) => {
              this.loading = false
              console.log(error)
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      handleVerifyCode() {
        // console.log('get Code')
        this.verifyCodeGet = '获取验证码'
        getCode(this.loginForm.username).then(response => {
          this.verifyCodeGet = response.data.msg
        }, error => {
            alert(error)
          }
        )
      },
      handleRegister() {
        // console.log('register')
        this.isVisibleRegistry = true
      },
      user_handleRegistryClose() {
        // console.log('detail dialog closed')
        this.isVisibleRegistry = false
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  $bg: #2d3a4b;
  $light_gray: #eee;

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      }
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg: #2d3a4b;
  $dark_gray: #889aa4;
  $light_gray: #eee;
  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
    .login-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 520px;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
    }
    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;
      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }
    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      &_login {
        font-size: 20px;
      }
    }
    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
