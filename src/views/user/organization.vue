<template>
  <div class="organization-manager-container">
    <el-form v-loading="loading"
             ref="form"
             :model="form"
             :rules="formRules"
             label-position="right"
             label-width="150px"
             class="organization_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  " />
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="6" prop="name">
          <el-form-item :label="$t('name_label')" prop="name">
            <el-input v-model="form.name" name="name" class="organization_form_input" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="$t('description_label')" prop="description">
            <el-input v-model="form.description" name="description" class="organization_form_input" />
          </el-form-item>
        </el-col>
        <el-form-item :label="$t('organization_rank_label')" prop="role">
          <el-cascader
            v-if="isVisibleOptions"
            :props="orgProps"
            :options="orgTree"
            :show-all-levels="false"
            v-model="selectedOption"
            size="medium"
            filterable
            change-on-select
            @change="handleChange"
          />
        </el-form-item>
      </el-row>
      <el-row :span="30">
        <el-form-item :label="$t('role_title_label')" prop="role">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">
            全选
          </el-checkbox>
          <el-checkbox-group v-if="!loading" v-model="selectedRole" @change="handleCheckedRoleChange">
            <el-checkbox v-for="item in roles" :label="item.id" :key="item.id">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="searchSubmit">{{ $t('confirm_button_search_title')
            }}
          </el-button>
          <el-button type="warning" style="font-size:16px;" @click="organizationCancel">{{
            $t('confirm_button_cancel_title') }}
          </el-button>
          <el-button type="success" style="font-size:16px;" @click="addItem">{{ $t('directive_new_title') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :data="list"
        :header-cell-style="organization_setHeadStyle"
        :row-style="organization_setRowStyle"
        :cell-style="organization_setCellStyle"
        element-loading-text="Loading"
        show-header
        resizable="true"
        show-overflow-tooltip="true"
        stripe
        fit
        style="background-color: lightcyan"
        highlight-current-row>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="organization-table-expand">
              <el-form-item :label="$t('role_title_label')">
                <span>{{ scope.row.roles }}</span>
              </el-form-item>
              <!--el-form-item :label="$t('description_label')">
                <span>{{ scope.row.description }}</span>
              </el-form-item-->
              <!--el-form-item :label="$t('role_title_label')">
                <span>{{ scope.row.roles }}</span>
              </el-form-item-->
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('name_label')" class-name="status-col" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('organization_rank_label')" class-name="status-col" width="60" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('description_label')" width="300" align="center">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操 作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="edit_item(scope.$index, scope.row)">{{ $t('confirm_button_edit_title') }}
            </el-button>
            <el-button type="text" @click="delete_item(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :page-sizes="pageSizeList"
        :page-size="pageSize"
        :current-page="form.pageIndex"
        :total="totalNum"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @prev-click="org_handle_prev_click"
        @next-click="org_handle_next_click"
        @size-change="org_handleSizeChange"
        @current-change="org_handleCurrentChange" />
    </div>
    <organization-update
      v-if="editorVisible"
      :org="currentOrganization"
      :roles="roles"
      :is-new-org="isNewItem"
      @fresh="organization_fresh"
      @close="organization_handleClose" />
  </div>
</template>

<script>
  import { searchOrganization, deleteOrganization, getRoles, getOrgTree } from '@/api/users'
  import OrganizationUpdate from './organizationUpdate'

  export default {
    components: {
      OrganizationUpdate
    },
    data() {
      const ruleValidateName = (rule, value, callback) => {
        if (value.length < 2) {
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
          parentId: '',
          roleIds: [],
          pageIndex: 1,
          pageSize: 10
        },
        formRules: {
          name: [{ required: false, trigger: 'blur', validator: ruleValidateName }]
        },
        list: null,
        orgTree: null,
        isVisibleOptions: false,
        selectedOption: [],
        orgProps: {
          value: 'id',
          label: 'fullName',
          children: 'children'
        },
        checkAll: false,
        isIndeterminate: false,
        roles: [],
        allRoleId: [],
        selectedRole: [],
        currentOrganization: null,
        isNewItem: false,
        isShowTable: false,
        editorVisible: false,
        totalNum: 5,
        pageSize: 10,
        pageCount: 1,
        pageSizeList: [10, 20, 100, 200],
        listLoading: true,
        loading: true
      }
    },
    created() {
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
      getRoles().then(response => {
          this.roles = response.data
          for (let i = 0; i < this.roles.length; i++) {
            this.allRoleId.push(this.roles[i].id)
          }
          this.loading = false
          this.organization_fetchData()
        }, error => {
          this.loading = false
          alert(error)
        }
      )
    },
    methods: {
      organization_clearUpForm() {
        this.form.name = ''
        this.form.description = ''
        this.form.roleIds = []
        this.form.parentId = ''
        this.checkAll = false
        this.isIndeterminate = false
        this.selectedRole = []
        this.selectedOption = []
      },
      searchSubmit() {
        // this.$message('submit!')
        if (this.form.name !== null) {
          this.form.name = this.form.name.trim()
        }
        if (this.form.description !== null) {
          this.form.description = this.form.description.trim()
        }

        this.form.roleIds = this.selectedRole

        this.organization_fetchData()
      },
      edit_item(index, row) {
        // console.log(row.id)
        this.currentOrganization = row
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
            deleteOrganization(this.form).then(response => {
                this.$message('成功')
                // this.list.splice(index, 1)
                this.organization_fetchData()
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
      handleChange(value) {
        this.form.parentId = this.selectedOption[this.selectedOption.length - 1]
      },
      handleCheckAllChange(val) {
        this.selectedRole = val ? this.allRoleId : []
        this.isIndeterminate = false
      },
      handleCheckedRoleChange(value) {
        const checkedCount = value.length
        this.checkAll = checkedCount === this.roles.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length
      },
      organizationCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
        this.isShowTable = false
        this.organization_clearUpForm()
      },
      organization_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      organization_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      organization_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      organization_sortByKey(a, k) {
        return a.sort(function (c, d) {
          var x = c[k]
          var y = d[k]
          return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        })
      },
      organization_fetchData() {
        // console.log('fetchData')
        this.isShowTable = true
        this.listLoading = true
        searchOrganization(this.form).then(response => {
            // console.log('got list')
            this.list = response.data.rows
            this.listLoading = false
            this.totalNum = response.data.total
            this.pageCount = this.totalNum / this.form.pageSize + 1
          }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      org_handleSizeChange(val) {
        // val is the number per page

      },
      org_handleCurrentChange(val) {
        if (val === 0) {
          val = 1
        }
        this.form.pageIndex = val
        this.organization_fetchData()
      },
      org_handle_prev_click() {
        if (this.form.pageIndex > 1) {
          this.form.pageIndex--
        } else {
          this.form.pageIndex = 1
        }
        this.organization_fetchData()
      },
      org_handle_next_click() {
        if (this.form.pageIndex < this.pageCount) {
          this.form.pageIndex++
          this.organization_fetchData()
        }
      },
      organization_fresh() {
        this.organization_fetchData()
      },
      organization_handleClose() {
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .organization-manager-container {
    background-color: lightcyan;
    text-content: center;
  }

  .organization_form {

  }

  .organization-table-expand {
    font-size: 0;
  }

  .organization-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .organization-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

