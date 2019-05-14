<template>
  <div class="permission-manager-container">
    <el-form v-loading="loading"
             ref="form"
             :model="form"
             :rules="formRules"
             label-position="right"
             label-width="150px"
             class="permission_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  "/>
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="8" prop="name">
          <el-form-item :label="$t('name_label')" prop="name">
            <el-input v-model="form.name" name="name" class="permission_form_input"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('description_label')" prop="description">
            <el-input v-model="form.description" name="description" class="permission_form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="8">
          <el-form-item :label="$t('brand_table_id_title')" prop="code">
            <el-input v-model="form.code" name="code" class="permission_form_input" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('permission_group_label')" prop="group">
            <el-select v-if="!listLoading" v-model="form.groupId" placeholder="请选择">
              <el-option
                v-for="item in groups"
                :key="item.id"
                :label="item.name"
                :value="item.id"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="searchSubmit">{{ $t('confirm_button_search_title') }}</el-button>
          <el-button type="warning" style="font-size:16px;" @click="permissionCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
          <el-button type="success" style="font-size:16px;" @click="addItem">{{ $t('directive_new_title') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :row-class-name = "permission_tableRowClassName"
        :data="list"
        :header-cell-style="permission_setHeadStyle"
        :row-style="permission_setRowStyle"
        :cell-style="permission_setCellStyle"
        element-loading-text="Loading"
        show-header
        resizable="true"
        show-overflow-tooltip="true"
        stripe
        fit
        highlight-current-row>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="permission-table-expand">
              <el-form-item :label="$t('aggregation_table_name_title')">
                <span>{{ scope.row.name }}</span>
              </el-form-item>
              <el-form-item :label="$t('description_label')">
                <span>{{ scope.row.description }}</span>
              </el-form-item>
              <el-form-item :label="$t('code_label')">
                <span>{{ scope.row.code }}</span>
              </el-form-item>
              <el-form-item :label="$t('permission_group_label')">
                <span>{{ scope.row.sysPermissionGroupId }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('permission_title_label')" width="180" align="center">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('code_label')" class-name="status-col" width="180" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('permission_group_label')" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.sysPermissionGroupId | formatGroupIdValue }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操 作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="edit_item(scope.$index, scope.row)">{{ $t('confirm_button_edit_title') }}</el-button>
            <el-button type="text" @click="delete_item(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :page-sizes = "pageSizeList"
        :page-size = "pageSize"
        :current-page="form.pageIndex"
        :total = "totalNum"
        :background= "true"
        layout="total, sizes, prev, pager, next, jumper"
        @prev-click= "permission_handle_prev_click"
        @next-click= "permission_handle_next_click"
        @size-change = "permission_handleSizeChange"
        @current-change="permission_handleCurrentChange"/>
    </div>
    <permission-update
      v-if="editorVisible"
      :permission="currentPermission"
      :groups="groups"
      :is-new-permission="isNewItem"
      @fresh="permission_fresh"
      @close="permission_handleClose"/>
  </div>
</template>

<script>
  import { permissionSearch, getPermissionGroups, permissionDelete } from '@/api/users'
  import PermissionUpdate from './permissionUpdate'

  export default {
    components: {
      PermissionUpdate
    },
    filters: {
      formatGroupIdValue(val) {
         return val
      }
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
          name: '',
          description: '',
          code: '',
          groupId: '',
          pageIndex: 1,
          pageSize: 10
        },
        formRules: {
          name: [{ required: false, trigger: 'blur', validator: ruleValidateName }]
        },
        list: null,
        groups: [],
        selectGroupId: '',
        currentPermission: null,
        isNewItem: false,
        listLoading: true,
        isShowTable: false,
        dialogVisible: false,
        editorVisible: false,
        pageSize: 10,
        pageCount: 1,
        totalNum: 5,
        pageSizeList: [10, 20, 100, 200],
        loading: false
      }
    },
    created() {
      getPermissionGroups().then(response => {
        // console.log('got list')
        this.groups = response.data
        this.listLoading = false
        this.permission_fetchData()
      }, error => {
          this.listLoading = false
          alert(error)
        }
      )
    },
    methods: {
      permission_clearUpForm() {
        this.form.name = ''
        this.form.description = ''
        this.form.code = ''
        this.form.groupId = ''
        // this.selectGroupId =''
        this.form.pageIndex = 1
        this.form.pageSize = 10
      },
      searchSubmit() {
        // this.$message('submit!')
        this.form.pageIndex = 1
        this.permission_fetchData()
      },
      edit_item(index, row) {
        this.currentPermission = row
        this.isNewItem = false
        this.editorVisible = true
      },
      delete_item(index, row) {
        if (row.id !== null) {
          var confirmTitle = '确认删除 [' + row.name + '] ?'
          var r = confirm(confirmTitle)
          if (r === true) {
            permissionDelete(row.id).then(response => {
              // this.$message('成功')
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
      permissionCancel() {
        // this.$message({
        //  message: 'cancel!',
         // type: 'warning'
       // })
        this.isShowTable = false
        this.permission_clearUpForm()
      },
      permission_setCellStyle(row, column, rowIndex, columnIndex) {
        return ''
        // return 'border-style:outset;'
      },
      permission_setRowStyle(row, rowIndex) {
        return ''
        // return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      permission_setHeadStyle(row, column, rowIndex, columnIndex) {
        return ''
        // return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      permission_sortByKey(a, k) {
        return a.sort(function(c, d) {
          var x = c[k]
          var y = d[k]
          return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        })
      },
      permission_fetchData() {
        // console.log('fetchData')
        this.isShowTable = true
        this.listLoading = true
        // console.log('try get list')

        if (this.form.name !== null) {
          this.form.name = this.form.name.trim()
        }
        if (this.form.description !== null) {
          this.form.description = this.form.description.trim()
        }
        if (this.form.code !== null) {
          this.form.code = this.form.code.trim()
        }
        // if (this.selectGroupId !== null) {
         // this.form.groupId = this.selectGroupId
        // }
        permissionSearch(this.form).then(response => {
          // console.log('got list')
          this.list = response.data.rows
          this.listLoading = false
          this.totalNum = response.data.total
          this.pageCount = this.totalNum / this.pageSize + 1
          this.permission_sortByKey(this.list, 'id')
        }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      permission_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      permission_handleSizeChange(val) {
        // val is the number per page
        // onsole.log('page.size.change: ' + val)
        // this.permission_fetchData(1, val)
      },
      permission_handleCurrentChange(val) {
        // console.log('permission_handleCurrentChange')
        if (val === 0) {
          val = 1
        }
        this.form.pageIndex = val
        this.permission_fetchData()
      },
      permission_handle_prev_click() {
        if (this.form.pageIndex > 1) {
          this.form.pageIndex--
        } else {
          this.form.pageIndex = 1
        }
        this.permission_fetchData()
      },
      permission_handle_next_click() {
        if (this.form.pageIndex < this.pageCount) {
          this.form.pageIndex++
          this.permission_fetchData()
        }
      },
      permission_fresh() {
        this.permission_fetchData()
      },
      permission_handleClose() {
        // console.log('detail dialog closed')
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .permission-manager-container {
    /* background-color: lightcyan; */
    text-content: center;
  }

  .permission-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .permission-table-expand {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

