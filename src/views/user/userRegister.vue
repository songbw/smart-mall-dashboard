<template>
  <div>
    <el-dialog
      :before-close="user_register_handleClose"
      :visible.sync="isVisible"
      :fullscreen="isFullScreen"
      :modal="false"
      custom-class="user_custom_class_style">
      <el-form ref="registryForm" :model="registryForm" :rules="registryRules" class="registry-form" label-position="right">
        <h3 class="title">{{ $t('register_label') }}</h3>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('login_username_tips') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="username">
              <el-input :placeholder="$t('login_username_tips')" v-model="registryForm.username" name="username" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('login_password_tips') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="password">
              <el-input :placeholder="$t('login_password_tips')" v-model="registryForm.password" name="password" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('brand_table_cname_title') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="zhName">
              <el-input v-model="registryForm.zhName" name="zhName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('brand_table_ename_title') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="enName">
              <el-input v-model="registryForm.enName" name="enName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('user_birthday_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="birth">
              <el-date-picker
                v-model="registryForm.birth"
                type="date"
                placeholder="    选择日期"
                format="    yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('user_phone_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="phone">
              <el-input v-model="registryForm.phone" name="zhName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('user_sex_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="sex">
              <el-select v-model="registryForm.sex" placeholder="请选择">
                <el-option label="男" value="0"/>
                <el-option label="女" value="1"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_register_label">{{ $t('user_email_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="email">
              <el-input v-model="registryForm.email" name="email" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="isShowGetCode" :span="30">
          <el-col :span="16">
            <el-form-item prop="code">
              <el-input :placeholder="$t('login_code_tips')" v-model="registryForm.code" name="code" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="verifyCode">
              <el-button type="primary" style="width:100%; font-size:22px" @click.native.prevent="handleVerifyCode">
                {{ verifyCodeGet }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <br>
        <div align="center" >
          <el-button :span="20" type="primary" style="width:100%; color:red; font-size:20px;" @click.native.prevent="user_register_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="center" >
          <el-button type="primary" style="width:100%; color:snow; font-size:20px;" @click="user_register_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { getCode, userRegistry } from '../../api/userLogin'
  import { isRightUsername } from '@/utils/validate'

  export default {
    name: 'UserRegister',
    components: {
    },
    props: {
      id: {
        type: Number,
        required: true
      }
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
        registryForm: {
          username: '',
          password: '',
          code: '',
          zhName: '',
          enName: '',
          address: '',
          birth: '',
          sex: '',
          email: ''
        },
        registryRules: {
          username: [{ required: true, trigger: 'blur', validator: validateUsername }],
          password: [{ required: true, trigger: 'blur', validator: validatePass }],
          code: [{ required: true, trigger: 'blur', validator: validateVerifyCode }]
        },
        isFullScreen: true,
        pwdType: 'password',
        isShowGetCode: false,
        verifyCodeGet: '获取验证码'
      }
    },
    created() {
      this.isVisible = true
    },
    methods: {
      user_register_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      handleVerifyCode() {
        // console.log('get Code')
        this.verifyCodeGet = '获取验证码'
        getCode(this.registryForm.username).then(response => {
          this.verifyCodeGet = response.data.msg
        })
      },
      user_register_handleSubmit() {
        this.$refs.registryForm.validate(valid => {
          if (valid) {
            userRegistry(this.registryForm).then(response => {
              alert('注册成功,等待管理员审核权限')
              this.$emit('close')
              this.closed = true
              this.isVisible = false
            }, error => {
                alert(error)
              }
            )
          }
        })
      },
      user_register_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'buser_register-style:outset;'
      },
      user_register_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5'
      },
      user_register_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;buser_register-style:outset;'
      },
      user_register_handleSizeChange(val) {
        // val is the number per page
        this.pageSize = val
        this.pageNo = 1
        this.user_register_fetchData(this.id, 1, val)
      },
      user_register_handleCurrentChange(val) {
        this.pageNo = val
        this.user_register_fetchData(this.id, val, this.pageSize)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" module>
  $bg: #2c394a;
  $dark_gray: #809084;
  $light_gray: #eee;
  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
  .registry-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 620px;
    padding: 35px 35px 15px 35px;
    margin: 0px auto;
    font-size: 20px;
  }
  .tips {
    font-size: 16px;
    color: #fff;
    margin-bottom: 10px;
  span {
  &:first-of-type {
     margin-right: 16px;
     font-size: 20px;
     color: #C03639;
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
  .user_register_label {
    font-size: 18px;
    color: aqua;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .user_custom_class_style {
    background-color: #2c394a;
    font-size: 18px;
  }
</style>
