<template>
  <div class="role-manager-container">
    <el-form v-loading="loading"
             ref="form"
             :model="form"
             :rules="formRules"
             label-position="right"
             label-width="150px"
             class="role_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  "/>
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="8" prop="name">
          <el-form-item :label="$t('name_label')" prop="name">
            <el-input v-model="form.name" name="name" class="role_form_input"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('description_label')" prop="description">
            <el-input v-model="form.description" name="description" class="role_form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :span="30">
        <el-form-item :label="$t('permission_group_label')" prop="group">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">
            全选
          </el-checkbox>
          <el-checkbox-group v-if="!loading" v-model="selectedGroupId" @change="handleCheckedGroupChange">
            <el-checkbox v-for="item in groups" :label="item.id" :key="item.id">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-row>
      <el-row :span="30">
        <el-col :span="16">
          <el-form-item :label="$t('permission_title_label')" prop="option">
            <el-checkbox :indeterminate="isIndeterminateOption" v-model="checkAllOption" @change="handleCheckAllOptionChange">全选</el-checkbox>
            <el-checkbox-group v-model="selectedOption" @change="handleCheckedOptionChange">
              <el-checkbox v-for="item in options" :label="item.value" :key="item.value">
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="searchSubmit">{{ $t('confirm_button_search_title') }}</el-button>
          <el-button type="warning" style="font-size:16px;" @click="roleCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
          <el-button type="success" style="font-size:16px;" @click="addItem">{{ $t('directive_new_title') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :row-class-name="role_tableRowClassName"
        :data="list"
        :header-cell-style="role_setHeadStyle"
        :row-style="role_setRowStyle"
        :cell-style="role_setCellStyle"
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
            <el-form label-position="left" inline class="role-table-expand">
              <!--el-form-item :label="$t('name_label')">
                <span>{{ scope.row.name }}</span>
              </el-form-item>
              <el-form-item :label="$t('description_label')">
                <span>{{ scope.row.description }}</span>
              </el-form-item-->
              <el-form-item :label="$t('permission_title_label')">
                <span>{{ scope.row.permissionCodes }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('name_label')" class-name="status-col" width="300" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('description_label')" width="600" align="center">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操 作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="edit_item(scope.$index, scope.row)">{{ $t('confirm_button_edit_title') }}</el-button>
            <el-button type="text" @click="delete_item(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--el-pagination
        :page-sizes = "pageSizeList"
        :page-size = "pageSize"
        :current-page="form.pageIndex"
        :total = "totalNum"
        :background= "true"
        layout="total, sizes, prev, pager, next, jumper"
        @prev-click= "role_handle_prev_click"
        @next-click= "role_handle_next_click"
        @size-change = "role_handleSizeChange"
        @current-change="role_handleCurrentChange"/-->
    </div>
    <role-update
      v-if="editorVisible"
      :role="currentRole"
      :is-new-role="isNewItem"
      @fresh="role_fresh"
      @close="role_handleClose"/>
  </div>
</template>

<script>
  import { searchRole, getPermissionGroups, deleteRole } from '@/api/users'
   import RoleUpdate from './roleUpdate'

  export default {
     components: {
      RoleUpdate
     },
    data() {
      const ruleValidateName = (rule, value, callback) => {
        if (value.length < 1) {
          callback(new Error('请输入正确的名称'))
        } else {
          callback()
        }
      }
      return {
        form: {
          id: 0,
          name: '',
          description: '',
          permissionGroups: [],
          permissions: [],
          pageIndex: 1,
          pageSize: 10
        },
        formRules: {
          name: [{ required: false, trigger: 'blur', validator: ruleValidateName }]
        },
        list: null,
        groups: [],
        checkAll: false,
        isIndeterminate: false,
        selectedGroupId: [],
        allGroupId: [],
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
        checkAllOption: false,
        isIndeterminateOption: false,
        selectedOption: [],
        allOptionValue: [],
        currentRole: null,
        isNewItem: false,
        listLoading: true,
        isShowTable: false,
        dialogVisible: false,
        editorVisible: false,
        pageSize: 10,
        pageCount: 1,
        totalNum: 5,
        pageSizeList: [10, 20, 100, 200],
        loading: true
      }
    },
    created() {
      getPermissionGroups().then(response => {
        // console.log('got list')
        this.groups = response.data
        this.loading = false
        for (let i = 0; i < this.groups.length; i++) {
          this.allGroupId.push(this.groups[i].id)
        }
        for (let i = 0; i < this.options.length; i++) {
          this.allOptionValue.push(this.options[i].value)
        }
        this.role_fetchData()
      }, error => {
          this.loading = false
          alert(error)
        }
      )
    },
    methods: {
      role_clearUpForm() {
        this.form.name = ''
        this.form.description = ''
        this.form.permissions = []
        this.form.permissionGroups = []
        this.selectedOption = []
        this.checkAll = false
        this.isIndeterminate = false
        this.checkAllOption = false
        this.isIndeterminateOption = false
        this.selectedGroupId = []
        this.form.pageIndex = 1
        this.form.pageSize = 10
      },
      searchSubmit() {
        this.$message('submit!')
        if (this.form.name !== null) {
          this.form.name = this.form.name.trim()
        }
        if (this.form.description !== null) {
          this.form.description = this.form.description.trim()
        }

        this.form.permissionGroups = this.selectedGroupId
        this.form.permissions = this.selectedOption

        this.role_fetchData()
      },
      edit_item(index, row) {
        // console.log(row.id)
        this.currentRole = row
        this.isNewItem = false
        this.editorVisible = true
      },
      delete_item(index, row) {
        // console.log(row.id + ' index: ' + index)
        if (row.id !== null) {
          this.form.id = row.id
          const confirmTitle = '确认删除 [' + row.name + '] ?'
          const r = confirm(confirmTitle)
          if (r === true) {
            deleteRole(this.form).then(response => {
              this.$message('成功')
              this.list.splice(index, 1)
            }, error => {
                alert(error)
              }
            )
          }
        }
      },
      addItem() {
        this.isNewItem = true
        this.editorVisible = true
      },
      handleCheckAllChange(val) {
        this.selectedGroupId = val ? this.allGroupId : []
        this.isIndeterminate = false
      },
      handleCheckedGroupChange(value) {
        const checkedGroupCount = value.length
        this.checkAll = checkedGroupCount === this.groups.length
        this.isIndeterminate = checkedGroupCount > 0 && checkedGroupCount < this.groups.length
      },
      handleCheckAllOptionChange(val) {
        this.selectedOption = val ? this.allOptionValue : []
        this.isIndeterminateOption = false
      },
      handleCheckedOptionChange(value) {
        const checkedCountO = value.length
        this.checkAllOption = checkedCountO === this.options.length
        this.isIndeterminateOption = checkedCountO > 0 && checkedCountO < this.options.length
      },
      roleCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
        this.isShowTable = false
        this.role_clearUpForm()
      },
      role_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      role_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      role_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      role_sortByKey(a, k) {
        return a.sort(function(c, d) {
          var x = c[k]
          var y = d[k]
          return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        })
      },
      role_fetchData() {
        // console.log('fetchData')
        this.isShowTable = true
        this.listLoading = true
        // console.log('try get list')

        searchRole(this.form).then(response => {
          // console.log('got list')
          this.list = response.data
          this.listLoading = false
          // this.totalNum = response.data.total
          // this.pageCount = this.totalNum / this.pageSize + 1
          // this.role_sortByKey(this.list, 'id')
        }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      role_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      role_handleSizeChange(val) {
        // val is the number per page
        // console.log('page.size.change: ' + val)
        // this.role_fetchData(1, val)
      },
      role_handleCurrentChange(val) {
        // console.log('role_handleCurrentChange')
        if (val === 0) {
          val = 1
        }
        this.form.pageIndex = val
        this.role_fetchData()
      },
      role_handle_prev_click() {
        if (this.form.pageIndex > 1) {
          this.form.pageIndex--
        } else {
          this.form.pageIndex = 1
        }
        this.role_fetchData()
      },
      role_handle_next_click() {
        if (this.form.pageIndex < this.pageCount) {
          this.form.pageIndex++
          this.role_fetchData()
        }
      },
      role_fresh() {
        this.role_fetchData()
      },
      role_handleClose() {
        // console.log('detail dialog closed')
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .role-manager-container {
    background-color: lightcyan;
    text-content: center;
  }
  .role_form {

  }

  .role-table-expand {
    font-size: 0;
  }
  .role-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .role-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

