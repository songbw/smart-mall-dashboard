<template class="org-update-container">
  <div>
    <el-dialog
      :before-close="org_update_beforeClose"
      :visible.sync="isVisible"
      :modal-append-to-body='false'
      :fullscreen="false"
      width="40%"
      top="1vh"
      custom-class="org_update_dialog_style">
      <el-form ref="form" :model="form" :rules="formRules" class="org-update-form" label-position="right" type="flex">
        <el-row :span="40">
          <el-col :span="6" :pull="4">
            <span class="org_update_label">{{ $t('name_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="4">
            <el-form-item prop="name">
              <el-input :disabled="!isNewOrg" v-model="form.name" name="name" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="6" :pull="4">
            <span class="org_update_label">{{ $t('full_name_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="4">
            <el-form-item prop="fullName">
              <el-input :disabled="!isNewOrg" v-model="form.fullName" name="fullName" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="6" :pull="4">
            <span class="org_update_label">{{ $t('description_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="4">
            <el-form-item prop="description">
              <el-input v-model="form.description" name="description" type="text" auto-complete="on"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="6" :pull="4">
            <span class="org_update_label">{{ $t('organization_rank_label') }}</span>
          </el-col>
          <el-col :span="16" :pull="4">
            <el-form-item prop="roleOption">
              <el-cascader
                v-if="isVisibleOptions"
                :props="treeProps"
                :options="orgTree"
                :show-all-levels="false"
                v-model="selectedOption"
                size="medium"
                filterable
                change-on-select
                @change="handleChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="40">
          <el-col :span="2">
            <span class="org_update_label">{{ $t('role_title_label') }}</span>
          </el-col>
          <el-col :span="28">
            <el-form-item prop="selectRoles">
              <el-transfer
                v-model="selectedIds"
                :data="roleData"
                :titles="['未选择', '已选择']"
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
        <div align="center" >
          <el-button :span="20" type="primary" style="width:34%; font-size:18px;" @click.native.prevent="org_update_handleSubmit">
            {{ $t('confirm_button_ok_title') }}
          </el-button>
        </div>
        <br>
        <div align="center" >
          <el-button type="cancel" style="width:34%; font-size:18px;" @click="org_update_handleClose">
            {{ $t('confirm_button_cancel_title') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import { updateOrganization, insertOrganization, getOrgTree, getUserOrgList } from '@/api/users'

  export default {
    name: 'OrgUpdate',
    components: {
    },
    props: {
      org: {
        type: Object,
        default: null,
        required: false
      },
      roles: {
        type: Array,
        default: null,
        required: false
      },
      isNewOrg: {
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
          fullName: '',
          description: '',
          parentId: '',
          roleIds: []
        },
        formRules: {
          name: [{ required: true, trigger: 'blur', validator: validatename }]
        },
        orgTree: null,
        isCleanTree: false,
        treeProps: {
          value: 'id',
          label: 'fullName',
          children: 'children'
        },
        selectedOption: [],
        isVisibleOptions: false,
        roleData: [],
        selectedIds: [],
        loading: true
      }
    },
    created() {
      this.isVisible = true

      if (this.roles != null) {
        for (let i = 0; i < this.roles.length; i++) {
          this.roleData.push(
            {
              key: this.roles[i].id,
              label: this.roles[i].name,
              disabled: false
            }
          )
        }
      }
      this.isCleanTree = false
      getOrgTree().then(response => {
        this.orgTree = response.data
        if (this.orgTree != null) {
          this.isVisibleOptions = true
          if (this.org != null && this.org.parentId != null) {
            this.form.parentId = this.org.parentId
            getUserOrgList(this.form.parentId).then(response => {
              this.selectedOption = response.data
              this.loading = false
            })
          }
        }
        this.loading = false
      })

      if (this.isNewOrg === false) {
        this.form.id = this.org.id
        this.form.name = this.org.name
        this.form.description = this.org.description
        if (this.org.roleIds !== null && this.org.roleIds.length > 0) {
          for (let i = 0; i < this.org.roleIds.length; i++) {
            this.form.roleIds.push(this.org.roleIds[i])
            this.selectedIds.push(this.org.roleIds[i])
          }
        }
      }
    },
    methods: {
      getTreeData(data){
        for(var i=0;i<data.length;i++){
          if(data[i].children.length<1){
            data[i].children=undefined;
          }else {
            this.getTreeData(data[i].children);
          }
        }
        return data;
      },
      org_update_beforeClose() {
        this.$confirm('确认关闭？')
          .then(_ => {
            this.$emit('close')
            this.closed = true
            this.isVisible = false
          })
          .catch(_ => {
            this.isVisible = true
            this.closed = false
          })
      },
      org_update_handleClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
      },
      org_update_handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.form.roleIds = this.selectedIds
            if (this.isNewOrg) {
              insertOrganization(this.form).then(response => {
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
              updateOrganization(this.form).then(response => {
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
        if (this.isCleanTree === false) {
          this.orgTree = this.getTreeData(this.orgTree)
          this.isCleanTree = true
        }
        this.form.parentId = this.selectedOption[this.selectedOption.length - 1]
      },
      org_update_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'borg_update-style:outset;'
      },
      org_update_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5'
      },
      org_update_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;borg_update-style:outset;'
      }
    }
  }
</script>

<style>
  .org-update-container {
    position: fixed;
    height: 100%;
    width: 100%;
    /* background-color: lightcyan; */
  }
  .org-update-form {
    left: 0;
    right: 0;
    margin: 0px auto;
    font-size: 20px;
  }
  .tips {
    font-size: 16px;
    color: #fff;
    margin-bottom: 10px;

  }
  .org-update-title {
    font-size: 26px;
    font-weight: 400;
    color: #eee;
    margin: 0px auto 40px auto;
    text-align: left;
    font-weight: bold;
  }
  .org-update-show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: #809084;
    cursor: pointer;
    org-select: none;
  }

  .org_update_label {
    font-size: 18px;
    color: darkslategray;
    float: right;
    padding: 12px 12px 0px 0px;
  }
  .org_update_dialog_style {
    /* background-color: lightcyan; */
    font-size: 18px;
    justify: center;
  }
</style>
