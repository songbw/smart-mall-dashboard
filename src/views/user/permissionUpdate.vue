<template class="permission-update-container">
  <div>
    <el-dialog
      :before-close="permission_update_handleClose"
      :visible.sync="isVisible"
      :fullscreen="true"
      custom-class="permission_update_dialog_style">
      <el-form ref="form" :model="form" :rules="formRules" class="permission-update-form" label-position="right">
        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('name_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="name">
              <el-input :disabled="!isNewPermission" v-model="form.name" name="name" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('description_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="description">
              <el-input v-model="form.description" name="description" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('permission_group_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="group">
              <el-select v-model="form.groupId" placeholder="请选择">
                <el-option
                  v-for="item in groups"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('permission_title_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="group">
              <el-select v-model="selectedOption" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <br>
        <div align="left" >
          <el-button :span="20" type="primary" style="width:100%; font-size:18px;" @click.native.prevent="permission_update_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="left" >
          <el-button type="cancel" style="width:100%; font-size:18px;" @click="permission_update_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { permissionUpdate, permissionInsert } from '@/api/users'

  export default {
    name: 'PermissionUpdate',
    components: {
    },
    props: {
      permission: {
        type: Object,
        required: false,
        default: null
      },
      groups: {
        type: Array,
        required: true
      },
      isNewPermission: {
        type: Boolean,
        required: true
      }
    },
    data() {
      const validatename = (rule, value, callback) => {
        if (value === null || value.length < 2 || value.length > 100) {
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
          groupId: '',
          code: ''
        },
        formRules: {
          name: [{ required: true, trigger: 'blur', validator: validatename }]
        },
        options: [{
          value: 'list',
          label: '列表'
        }, {
          value: 'select',
          label: '选择'
        }, {
          value: 'insert',
          label: '新增'
        }, {
          value: 'update',
          label: '更新'
        }, {
          value: 'delete',
          label: '删除'
        }],
        selectedOption: '',
        isVisibleOptions: false
      }
    },
    created() {
      this.isVisible = true

      if (this.isNewPermission === false) {
        this.form.id = this.permission.id
        this.form.name = this.permission.name
        this.form.description = this.permission.description
        this.form.groupId = this.permission.sysPermissionGroupId
        this.selectedOption = this.permission.code.split(':')[1]
      }
    },
    methods: {
      permission_update_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      permission_update_handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            if (this.selectedOption != null) {
              this.form.code = this.selectedOption
            } else {
              this.form.code = ' '
            }
            if (this.isNewPermission) {
              permissionInsert(this.form).then(response => {
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
              permissionUpdate(this.form).then(response => {
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
  .permission-update-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: lightcyan;
  }
  .permission-update-form {
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
  .permission-update-title {
    font-size: 26px;
    font-weight: 400;
    color: #eee;
    margin: 0px auto 40px auto;
    text-align: left;
    font-weight: bold;
  }
  .permission-update-show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: #809084;
    cursor: pointer;
    permission-select: none;
  }

  .permission_update_label {
    font-size: 18px;
    color: darkslategray;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .permission_update_dialog_style {
    background-color: lightcyan;
    font-size: 18px;
    justify: left;
  }
</style>
