<template class="permission-group-update-container">
  <div>
    <el-dialog
      v-loading="loading"
      :before-close="group_update_handleClose"
      :visible.sync="isVisible"
      :fullscreen="true"
      custom-class="permission_group_update_dialog_style">
      <el-form ref="form" :model="form" :rules="formRules" class="permission-group-update-form" label-position="right">
        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('name_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="name">
              <el-input :disabled="!isNewGroup" v-model="form.name" name="name" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="30">
          <el-col :span="8">
            <span class="permission_update_label">{{ $t('code_label') }}</span>
          </el-col>
          <el-col :span="16">
            <el-form-item prop="code">
              <el-input :disabled="!isNewGroup" v-model="form.code" name="code" type="text" auto-complete="on"/>
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
        <br>
        <div align="left" >
          <el-button :span="20" type="primary" style="width:100%; font-size:18px;" @click.native.prevent="group_update_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="left" >
          <el-button type="cancel" style="width:100%; font-size:18px;" @click="group_update_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { setPermissionGroup, addPermissionGroup } from '@/api/users'

  export default {
    name: 'PermissionGroupUpdate',
    components: {
    },
    props: {
      group: {
        type: Object,
        required: false,
        default: null
      },
      isNewGroup: {
        type: Boolean,
        required: true
      }
    },
    data() {
      const validatename = (rule, value, callback) => {
        if (value === null || value.length < 2 || value.length > 100) {
          callback(new Error('请输入正确的组名'))
        } else {
          callback()
        }
      }
      return {
        form: {
          id: 0,
          name: '',
          description: '',
          code: ''
        },
        formRules: {
          name: [{ required: true, trigger: 'blur', validator: validatename }]
        },
        selectedOption: '',
        loading: false,
        isVisibleOptions: false
      }
    },
    created() {
      this.isVisible = true

      if (this.isNewGroup === false) {
        this.form.id = this.group.id
        this.form.name = this.group.name
        this.form.code = this.group.code
        this.form.description = this.group.description
      }
    },
    methods: {
      group_update_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      group_update_handleSubmit() {
        this.$refs.form.validate(valid => {
            if (this.isNewGroup) {
              this.loading = true
              addPermissionGroup(this.form).then(response => {
                  alert('成功')
                  this.loading = true
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
              this.loading = true
              setPermissionGroup(this.form).then(response => {
                  alert('成功')
                  this.loading = true
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
        })
      }
    }
  }
</script>

<style>
  .permission-group-update-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: lightcyan;
  }
  .permission-group-update-form {
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
  .permission_update_label {
    font-size: 18px;
    color: darkslategray;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .permission_group_update_dialog_style {
    background-color: lightcyan;
    font-size: 18px;
    justify: left;
  }
</style>
