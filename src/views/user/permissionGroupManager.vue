<template>
  <div class="permission-group-container">
    <el-form v-loading="loading"
             ref="form"
             :model="form"
             label-position="right"
             label-width="150px"
             class="permission_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  "/>
        </el-col>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="success" style="font-size:16px;" @click="addItem">{{ $t('directive_new_title') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :row-class-name = "group_tableRowClassName"
        :data="list"
        element-loading-text="Loading"
        show-header
        resizable="true"
        show-overflow-tooltip="true"
        stripe
        fit
        highlight-current-row>
        <el-table-column :label="$t('permission_title_label')" width="180" align="center">
          <template slot-scope="scope">
            {{ scope.row.name }}
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
        <el-table-column align="center" label="操 作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="edit_item(scope.$index, scope.row)">{{ $t('confirm_button_edit_title') }}</el-button>
            <el-button type="text" @click="delete_item(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <permission-group-update
      v-if="editorVisible"
      :group="currentGroup"
      :is-new-group="isNewItem"
      @fresh="permission_group_handleFresh"
      @close="permission_group_handleClose"/>
  </div>
</template>

<script>
  import { getPermissionGroups, deletePermissionGroup } from '@/api/users'
  import PermissionGroupUpdate from './permissionGroupUpdate'

  export default {
    components: {
      PermissionGroupUpdate
    },
    filters: {
      formatGroupIdValue(val) {
        return val
      }
    },
    data() {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          code: '',
          groupId: ''
        },
        list: null,
        selectGroupId: '',
        currentGroup: null,
        isNewItem: false,
        listLoading: true,
        isShowTable: false,
        dialogVisible: false,
        editorVisible: false,
        loading: false
      }
    },
    created() {
      getPermissionGroups().then(response => {
          // console.log('got list')
          this.list = response.data
          this.listLoading = false
          this.isShowTable = true
        }, error => {
          this.listLoading = false
          alert(error)
        }
      )
    },
    methods: {
      edit_item(index, row) {
        this.currentGroup = row
        this.isNewItem = false
        this.editorVisible = true
      },
      delete_item(index, row) {
        if (row.id !== null) {
          var confirmTitle = '确认删除 [' + row.name + '] ?'
          var r = confirm(confirmTitle)
          if (r === true) {
            deletePermissionGroup(row).then(response => {
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
      group_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      permission_group_handleFresh() {
        getPermissionGroups().then(response => {
            // console.log('got list')
            this.list = response.data
            this.listLoading = false
            this.isShowTable = true
          }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      permission_group_handleClose() {
        // console.log('detail dialog closed')
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .permission-group-container {
    /* background-color: lightcyan; */
    text-content: center;
  }
  .permission_form {

  }
</style>

