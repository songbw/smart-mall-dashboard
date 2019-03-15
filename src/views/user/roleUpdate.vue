<template class="role-update-container">
  <div>
    <el-dialog
      :before-close="role_update_handleClose"
      :visible.sync="isVisible"
      :fullscreen="true"
      custom-class="role_update_dialog_style">
      <el-form ref="form" :model="form" :rules="formRules" class="role-update-form" label-position="right" type="flex">
        <el-row :span="40">
          <el-col :span="8" :pull="6">
            <span class="role_update_label">{{ $t('name_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="6">
            <el-form-item prop="name">
              <el-input :disabled="!isNewRole" v-model="form.name" name="name" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="8" :pull="6">
            <span class="role_update_label">{{ $t('description_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="6">
            <el-form-item prop="description">
              <el-input v-model="form.description" name="description" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="4" :pull="2">
            <span class="role_update_label">{{ $t('permission_title_label') }}</span>
          </el-col>
          <el-col :span="30">
            <el-form-item prop="group">
              <el-transfer
                v-model="selectedIds"
                :data="permissionData"
                :titles="['未选择权限', '已选择权限']"
                :format="{
                  noChecked: '${total}',
                  hasChecked: '${checked}/${total}'
                }"
                style="text-align: left"
                display="inline-block"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <br>
        <div align="left" >
          <el-button :span="20" type="primary" style="width:100%; font-size:18px;" @click.native.prevent="role_update_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="left" >
          <el-button type="cancel" style="width:100%; font-size:18px;" @click="role_update_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { updateRole, insertRole, getPermissions, getPermissionIdByRole } from '@/api/users'

  export default {
    name: 'RoleUpdate',
    components: {
    },
    props: {
      role: {
        type: Object,
        default: null,
        required: false
      },
      isNewRole: {
        type: Boolean,
        required: true
      }
    },
    data() {
      const validatename = (rule, value, callback) => {
        if (value === null || value.length < 2 || value.length > 100) {
          // console.log('=== ' + value)
          callback(new Error('请输入正确的权限名'))
        } else {
          callback()
        }
      }
      return {
        form: {
          id: 0,
          name: '',
          description: '',
          permissionIds: [],
          codes: []
        },
        formRules: {
          name: [{ required: true, trigger: 'blur', validator: validatename }]
        },
        permissions: null,
        permissionData: [],
        selectedIds: [],
        loading: true
      }
    },
    created() {
      this.isVisible = true

      getPermissions().then(response => {
        this.permissions = response.data
        if (this.permissions != null) {
          for (let i = 0; i < this.permissions.length; i++) {
            this.permissionData.push(
              {
              key: this.permissions[i].id,
              label: this.permissions[i].description,
              disabled: false
              }
            )
          }
        }
        this.loading = false
      })

      if (this.isNewRole === false) {
          this.form.id = this.role.id
          this.form.name = this.role.name
          this.form.description = this.role.description
          getPermissionIdByRole(this.role.id).then(response => {
            this.selectedIds = response.data
          })
        }
    },
    methods: {
      role_update_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      role_update_handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.form.permissionIds = this.selectedIds
            if (this.isNewRole) {
              insertRole(this.form).then(response => {
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
              updateRole(this.form).then(response => {
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
      }
    }
  }
</script>

<style>
  .role-update-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: lightcyan;
  }
  .role-update-form {
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
  .role-update-title {
    font-size: 26px;
    font-weight: 400;
    color: #eee;
    margin: 0px auto 40px auto;
    text-align: left;
    font-weight: bold;
  }
  .role-update-show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: #809084;
    cursor: pointer;
    role-select: none;
  }

  .role_update_label {
    font-size: 18px;
    color: darkslategray;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .role_update_dialog_style {
    background-color: lightcyan;
    font-size: 18px;
    justify: left;
  }
</style>
