<template class="user-update-container">
  <div>
    <el-dialog
      v-loading="loading"
      :before-close="user_update_handleClose"
      :visible.sync="isVisible"
      :fullscreen="isFullScreen"
      custom-class="user_update_dialog_style">
      <el-form ref="form" :model="form" :rules="formRules" class="user-update-form" label-position="right">
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_login_name_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="username">
              <el-input :disabled="!isNewUser" :placeholder="$t('login_username_tips')" v-model="form.username" name="username" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_password_label') }}</span>
          </el-col>
          <el-col v-if="isNewUser" :span="16">
            <el-form-item prop="password">
              <el-input :placeholder="$t('login_password_tips')" v-model="form.password" name="password" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
          <el-col v-else :span="16">
            <el-form-item prop="password">
              <el-button v-if="!isVisiblePassword" type="warning" justify="center" style="width:60%; color:snow; font-size:20px;" @click="user_change_password">
                {{ $t('change_password_tips') }}
              </el-button>
              <el-input v-if="isVisiblePassword" :placeholder="$t('login_password_tips')" v-model="form.password" name="password" type="text" auto-complete="on"/>
              <el-button v-if="isVisiblePassword" type="warning" justify="center" style="width:60%; color:snow; font-size:20px;" @click="user_change_password">
                {{ $t('confirm_button_ok_title') }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('brand_table_cname_title') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="zhName">
              <el-input v-model="form.zhName" name="zhName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('brand_table_ename_title') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="enName">
              <el-input v-model="form.enName" name="enName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_birthday_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="birth">
              <el-date-picker
                v-model="form.birth"
                type="date"
                placeholder="选择日期"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_phone_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" name="zhName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_sex_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="sex">
              <el-select v-model="form.sex">
                <el-option label="男" value="0"/>
                <el-option label="女" value="1"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_email_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="email">
              <el-input v-model="form.email" name="email" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('user_address_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="address">
              <el-input v-model="form.address" name="address" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="user_update_label">{{ $t('organization_manager_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-cascader
              v-if="isVisibleOptions"
              :props="props"
              :options="orgTree"
              :show-all-levels="false"
              v-model="selectedOption"
              size="medium"
              filterable
              change-on-select
              @change="handleChange"
            />
          </el-col>
        </el-row>
        <br>
        <div align="left" >
          <el-button :span="20" type="primary" style="width:100%; font-size:18px;" @click.native.prevent="user_update_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="left" >
          <el-button type="cancel" style="width:100%; font-size:18px;" @click="user_update_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { getOrgTree, userUpdate, userInsert, getUserOrgList } from '@/api/users'
  import { isRightUsername } from '@/utils/validate'

  export default {
    name: 'UserUpdate',
    components: {
    },
    props: {
      user: {
        type: Object,
        required: false,
        default: null
      },
      isNewUser: {
        type: Boolean,
        required: true
      }
    },
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!isRightUsername(value)) {
          callback(new Error('请输入正确的用户名'))
        } else {
          callback()
        }
      }
      const validatePass = (rule, value, callback) => {
        if (this.isNewUser && value !== null) {
          if (value.length < 4) {
            callback(new Error('密码不能小于4位'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
      return {
        form: {
          id: 0,
          username: '',
          password: '',
          zhName: '',
          enName: '',
          address: '',
          birth: '',
          sex: '',
          phone: '',
          organization: '',
          email: '',
          permissionIds: null
        },
        formRules: {
          username: [{ required: true, trigger: 'blur', validator: validateUsername }],
          password: [{ required: true, trigger: 'blur', validator: validatePass }]
        },
        permissionList: null,
        orgTree: null,
        orgOptions: null,
        userId: 0,
        isFullScreen: true,
        selectedOption: [],
        loading: false,
        isVisiblePassword: false,
        isVisibleOptions: false,
        props: {
          value: 'id',
          label: 'fullName',
          children: 'children'
        }
      }
    },
    watch: {
      isVisibleOptions(newVal, oldVal) {
        if (newVal === true && oldVal === false) {
          if (this.user !== null && this.user.organizationId !== null) {
            getUserOrgList(this.user.organizationId).then(response => {
              this.selectedOption = response.data
              this.loading = false
            })
          }
        }
      }
    },
    created() {
      this.isVisible = true
      this.loading = true

      getOrgTree().then(response => {
        // console.log('got list')
        this.orgTree = response.data
        this.loading = false
        this.isVisibleOptions = true
      }, error => {
          this.loading = false
          alert(error)
        }
      )

      if (this.isNewUser === false) {
        this.form.id = this.user.id
        this.form.username = this.user.loginName
        this.form.zhName = this.user.zhName
        this.form.enName = this.user.enName
        this.form.phone = this.user.phone
        this.form.birth = this.user.birth
        this.form.email = this.user.email
        this.form.address = this.user.address
        if (this.user.sex !== null) {
          this.form.sex = this.user.sex.toString()
        } else {
          this.form.sex = ''
        }
        if (this.user.organizationId !== null) {
          this.form.organization = this.user.organizationId.toString()
        }
      }

      if (this.isVisibleOptions === true) {
        getUserOrgList(this.user.organizationId).then(response => {
          this.selectedOption = response.data
          this.loading = false
        }, error => {
            this.loading = false
            alert(error)
          }
        )
      }
    },
    methods: {
      user_update_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      user_change_password() {
        if (this.isVisiblePassword === false) {
          this.isVisiblePassword = true
        } else {
          this.isVisiblePassword = false
        }
      },
      user_update_handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            if (this.isNewUser) {
              userInsert(this.form).then(response => {
                alert('成功')
                this.$emit('close')
                this.$emit('fresh')
                this.closed = true
                this.isVisible = false
              }, error => {
                  alert(error)
                  this.$emit('close')
                  this.closed = true
                  this.isVisible = false
                }
              )
            } else {
              userUpdate(this.form).then(response => {
                alert('成功')
                this.$emit('close')
                this.$emit('fresh')
                this.closed = true
                this.isVisible = false
              }, error => {
                  alert(error)
                  this.$emit('close')
                  this.closed = true
                  this.isVisible = false
                }
              )
            }
          }
        })
      },
      handleChange(value) {
        this.form.organization = this.selectedOption[this.selectedOption.length - 1]
      },
      user_update_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'buser_update-style:outset;'
      },
      user_update_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5'
      },
      user_update_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;buser_update-style:outset;'
      }
    }
  }
</script>

<style>
  .user-update-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: lightcyan;
  }
  .user-update-form {
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

  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #809084;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .user-update-title {
    font-size: 26px;
    font-weight: 400;
    color: #eee;
    margin: 0px auto 40px auto;
    text-align: left;
    font-weight: bold;
  }
  .user-update-show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: #809084;
    cursor: pointer;
    user-select: none;
  }

  .user_update_label {
    font-size: 18px;
    color: darkslategray;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .user_update_dialog_style {
    background-color: lightcyan;
    font-size: 18px;
    justify: left;
  }
</style>
