<template>
  <div class="user-manager-container">
    <el-form v-loading="loading"
             ref="userForm"
             :model="userForm"
             :rules="formRules"
             label-position="right"
             label-width="150px"
             class="user_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  " />
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="8" prop="loginName">
          <el-form-item :label="$t('user_login_name_label')" prop="loginName">
            <el-input v-model="userForm.loginName" name="loginName" class="user_form_input" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('user_phone_label')" prop="phone">
            <el-input v-model="userForm.phone" name="phone" class="user_form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="8">
          <el-form-item :label="$t('user_email_label')" prop="email">
            <el-input v-model="userForm.email" name="email" class="user_form_input" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('brand_table_cname_title')" prop="zhName">
            <el-input v-model="userForm.zhName" class="user_form_input" name="zhName" />
          </el-form-item>
        </el-col>
      </el-row>
      <!--el-row :gutter="0" :span="24" type="flex" justify="center">
        <el-col :span="8" :offset="-2">
          <el-form-item :label="$t('brand_table_ename_title')" prop="enName">
            <el-input v-model="userForm.enName" name="enName" class="user_form_input" />
          </el-form-item>
        </el-col>
      </el-row-->
      <el-row :gutter="1" :span="24" type="flex" justify="start">
        <el-form-item :label="$t('create_date_title')">
          <el-col :span="11">
            <el-form-item>
              <el-date-picker
                v-model="userForm.createTimeStart"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="user_form_input" />
            </el-form-item>
          </el-col>
          <el-col :span="2" :push="1">
            <span class="user_form_label">{{ $t('end_date_title') }}</span>
          </el-col>
          <el-col :span="9">
            <el-form-item>
              <el-date-picker
                v-model="userForm.createTimeEnd"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="user_form_input" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item :label="$t('update_date_title')">
          <el-col :span="11">
            <el-form-item>
              <el-date-picker
                v-model="userForm.updateTimeStart"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="user_form_input" />
            </el-form-item>
          </el-col>
          <el-col :span="2" :push="1">
            <span class="user_form_label">{{ $t('end_date_title') }}</span>
          </el-col>
          <el-col :span="9">
            <el-form-item>
              <el-date-picker
                v-model="userForm.updateTimeEnd"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="user_form_input" />
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="search_onSubmit">{{
            $t('confirm_button_search_title') }}
          </el-button>
          <el-button type="warning" style="font-size:16px;" @click="user_onCancel">{{ $t('confirm_button_cancel_title')
            }}
          </el-button>
          <el-button type="success" style="font-size:16px;" @click="add_user">{{ $t('directive_new_title') }}
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :row-class-name="user_tableRowClassName"
        :data="list"
        :header-cell-style="user_setHeadStyle"
        :row-style="user_setRowStyle"
        :cell-style="user_setCellStyle"
        element-loading-text="Loading"
        show-header
        resizable="true"
        show-overflow-tooltip="true"
        stripe
        fit
        height="500"
        style="background-color: lightcyan"
        highlight-current-row>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="user-table-expand">
              <el-form-item :label="$t('brand_table_ename_title')">
                <span>{{ scope.row.enName }}</span>
              </el-form-item>
              <el-form-item :label="$t('user_birthday_label')">
                <span>{{ scope.row.birth }}</span>
              </el-form-item>
              <el-form-item :label="$t('update_date_title')">
                <span>{{ scope.row.updateTime }}</span>
              </el-form-item>
              <el-form-item :label="$t('create_date_title')">
                <span>{{ scope.row.createTime }}</span>
              </el-form-item>
              <el-form-item :label="$t('user_address_label')">
                <span>{{ scope.row.address }}</span>
              </el-form-item>
              <el-form-item :label="$t('user_email_label')">
                <span>{{ scope.row.email }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user_login_name_label')" width="180" align="center">
          <template slot-scope="scope">
            {{ scope.row.loginName }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('user_sex_label')" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.sex | formatSexValue }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand_table_cname_title')" width="180" align="center">
          <template slot-scope="scope">
            {{ scope.row.zhName }}
          </template>
        </el-table-column>
        <!--el-table-column :label="$t('brand_table_ename_title')" width="180" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.enName }}</span>
          </template>
        </el-table-column-->
        <el-table-column :label="$t('user_phone_label')" class-name="status-col" width="180" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <!--el-table-column :label="$t('user_email_label')" align="center" width="180" >
          <template slot-scope="scope">
            <span>{{ scope.row.email }}</span>
          </template>
        </el-table-column-->
        <!--el-table-column :label="$t('user_birthday_label')" align="center" width="100" >
          <template slot-scope="scope">
            <span>{{ scope.row.birth }}</span>
          </template>
        </el-table-column-->
        <!--el-table-column :label="$t('user_address_label')" align="center" width="260" >
          <template slot-scope="scope">
            <span>{{ scope.row.address }}</span>
          </template>
        </el-table-column-->
        <!--el-table-column :label="$t('create_date_title')" align="center" width="180">
          <template slot-scope="scope">
            <i class="el-icon-time"/>
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column-->
        <!--el-table-column :label="$t('update_date_title')" align="center" width="180">
          <template slot-scope="scope">
            <i class="el-icon-time"/>
            <span>{{ scope.row.updateTime }}</span>
          </template>
        </el-table-column-->
        <el-table-column align="center" label="操 作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="edit_user(scope.$index, scope.row)">{{ $t('confirm_button_edit_title') }}
            </el-button>
            <el-button type="text" @click="delete_user(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :page-sizes="pageSizeList"
        :page-size="pageSize"
        :current-page="userForm.pageIndex"
        :total="totalNum"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @prev-click="user_handle_prev_click"
        @next-click="user_handle_next_click"
        @size-change="user_handleSizeChange"
        @current-change="user_handleCurrentChange" />
    </div>
    <user-update v-if="editorVisible"
                 :user="currentUser"
                 :is-new-user="isNewUser"
                 @fresh="user_fresh"
                 @close="user_handleUserUpdateClose" />
  </div>
</template>

<script>
  import { userSearch, deleteByName } from '@/api/users'
  import { isRightUsername, validateEmail } from '@/utils/validate'
  import UserUpdate from './userUpdate'

  export default {
    components: {
      UserUpdate
    },
    filters: {
      formatSexValue(val) {
        switch (val) {
          case 0:
            return '男'
          case 1:
            return '女'
        }
      }
    },
    data() {
      const ruleValidateLoginName = (rule, value, callback) => {
        if (!isRightUsername(value)) {
          callback(new Error('请输入正确的用户名'))
        } else {
          callback()
        }
      }
      const ruleValidateEmail = (rule, value, callback) => {
        if (!validateEmail(value)) {
          callback(new Error('Email格式错误'))
        } else {
          callback()
        }
      }
      const ruleValidatePhoneNum = (rule, value, callback) => {
        // console.log('phone number')
        if (value.length > 0 && value.length < 8) {
          callback(new Error('不能小于8位'))
        } else {
          callback()
        }
      }
      return {
        userForm: {
          loginName: '',
          zhName: '',
          enName: '',
          email: '',
          sex: '',
          phone: '',
          createTimeStart: '',
          createTimeEnd: '',
          updateTimeStart: '',
          updateTimeEnd: '',
          pageIndex: 1,
          pageSize: 10
        },
        formRules: {
          loginName: [{ required: false, trigger: 'blur', validator: ruleValidateLoginName }],
          email: [{ required: false, trigger: 'blur', validator: ruleValidateEmail }],
          phone: [{ required: false, trigger: 'blur', validator: ruleValidatePhoneNum }]
        },
        list: null,
        notes: '',
        currentUser: null,
        isNewUser: false,
        listLoading: false,
        isShowTable: false,
        dialogVisible: false,
        editorVisible: false,
        pageSize: 10,
        totalNum: 5,
        pageCount: 1,
        pageSizeList: [10, 20, 100, 200],
        loading: false
      }
    },
    created() {
      this.user_fetchData()
    },
    methods: {
      user_clearUpForm() {
        this.userForm.loginName = ''
        this.userForm.zhName = ''
        this.userForm.enName = ''
        this.userForm.email = ''
        this.userForm.sex = ''
        this.userForm.phone = ''
        this.userForm.createTimeStart = ''
        this.userForm.createTimeEnd = ''
        this.userForm.updateTimeStart = ''
        this.userForm.updateTimeEnd = ''
        this.userForm.pageIndex = 1
        this.userForm.pageSize = 10
      },
      search_onSubmit() {
        this.$message('submit!')
        this.userForm.pageIndex = 1
        this.user_fetchData()
      },
      edit_user(index, row) {
        // console.log(row.loginName)
        this.currentUser = row
        this.isNewUser = false
        this.editorVisible = true
      },
      delete_user(index, row) {
        // console.log(row.loginName)
        if (row.loginName !== null) {
          var confirmTitle = '确认删除 [' + row.loginName + '] ?'
          var r = confirm(confirmTitle)
          if (r === true) {
            deleteByName(row.loginName).then(response => {
              this.$message('成功')
              this.list.splice(index, 1)
            })
          }
        }
      },
      add_user() {
        this.$message('add user')
        this.isNewUser = true
        this.editorVisible = true
      },
      user_onCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
        this.isShowTable = false
        this.user_clearUpForm()
      },
      user_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      user_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      user_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      user_sortByKey(a, k) {
        return a.sort(function (c, d) {
          var x = c[k]
          var y = d[k]
          return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        })
      },
      user_fetchData() {
        // console.log('fetchData')
        this.isShowTable = true
        this.listLoading = true
        // console.log('try get list')

        if (this.userForm.loginName !== null) {
          this.userForm.loginName = this.userForm.loginName.trim()
        }
        if (this.userForm.zhName !== null) {
          this.userForm.zhName = this.userForm.zhName.trim()
        }
        if (this.userForm.enName !== null) {
          this.userForm.enName = this.userForm.enName.trim()
        }
        if (this.userForm.phone !== null) {
          this.userForm.phone = this.userForm.phone.trim()
        }
        userSearch(this.userForm).then(response => {
            // console.log('got list')
            this.list = response.data.rows
            this.listLoading = false
            this.pageSize = response.data.pageSize
            this.totalNum = response.data.total
            this.pageCount = this.totalNum / this.userForm.pageSize + 1
            this.user_sortByKey(this.list, 'id')
          }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      user_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      user_handleSizeChange(val) {
        // val is the number per page

      },
      user_handleCurrentChange(val) {
        // console.log('user_handleCurrentChange')
        if (val === 0) {
          val = 1
        }
        this.userForm.pageIndex = val
        this.user_fetchData()
      },
      user_handle_prev_click() {
        if (this.userForm.pageIndex > 1) {
          this.userForm.pageIndex--
        } else {
          this.userForm.pageIndex = 1
        }
        this.user_fetchData()
      },
      user_handle_next_click() {
        if (this.userForm.pageIndex < this.pageCount) {
          this.userForm.pageIndex++
          this.user_fetchData()
        }
      },
      user_fresh() {
        this.user_fetchData()
      },
      user_handleUserUpdateClose() {
        // console.log('detail dialog closed')
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .user-manager-container {
    background-color: lightcyan;
    text-content: center;
  }

  .user-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .user-table-expand {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

