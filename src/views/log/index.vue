<template>
  <div class="log-manager-container">
    <el-form v-loading="loading"
             ref="logForm"
             :model="logForm"
             label-position="right"
             label-width="150px"
             class="log_form">
      <el-row :span="24" type="flex" justify="center">
        <el-col :span="10">
          <el-form-item label="  "/>
        </el-col>
      </el-row>
      <el-row :span="24" type="flex" justify="start">
        <el-col :span="6" prop="user">
          <el-form-item :label="$t('user_login_name_label')" prop="user">
            <el-input v-model="logForm.user" name="user" class="log_form_input"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="method" prop="phone">
            <el-input v-model="logForm.method" name="method" class="log_form_input" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="url" prop="url">
            <el-input v-model="logForm.url" name="url" class="log_form_input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" :span="24" type="flex" justify="start">
        <el-col :span="6">
          <el-form-item label="参数" prop="param">
            <el-input v-model="logForm.param" class="log_form_input" name="param"/>
          </el-form-item>
        </el-col>
        <el-form-item :label="$t('create_date_title')">
          <el-col :span="11">
            <el-form-item>
              <el-date-picker
                v-model="logForm.createTimeStart"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="log_form_input"/>
            </el-form-item>
          </el-col>
          <el-col :span="2" :push="1">
            <span class="log_form_label">{{ $t('end_date_title') }}</span>
          </el-col>
          <el-col :span="9">
            <el-form-item>
              <el-date-picker
                v-model="logForm.createTimeEnd"
                type="datetime"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                class="log_form_input" />
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-row>
      <el-row :gutter="1" :span="12" type="flex" justify="start">
        <el-form-item>
          <el-button type="primary" style="font-size:16px;" @click="search_onSubmit">{{ $t('confirm_button_search_title') }}</el-button>
          <el-button type="warning" style="font-size:16px;" @click="log_onCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
          <el-button type="danger" style="font-size:16px;" @click="shrink_log">{{ $t('confirm_button_shrink_title') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div v-if="isShowTable" style="width: max-content">
      <el-table
        v-loading="listLoading"
        :row-class-name = "log_tableRowClassName"
        :data="list"
        :header-cell-style="log_setHeadStyle"
        :row-style="log_setRowStyle"
        :cell-style="log_setCellStyle"
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
            <el-form label-position="left" inline class="log-table-expand">
              <el-form-item label="IP">
                <span>{{ scope.row.ip }}</span>
              </el-form-item>
              <el-form-item label="Time used">
                <span>{{ scope.row.timeUsed }}</span>
              </el-form-item>
              <el-form-item label="Method">
                <span>{{ scope.row.method }}</span>
              </el-form-item>
              <el-form-item label="Parameter">
                <span>{{ scope.row.param }}</span>
              </el-form-item>
              <el-form-item label="Agent">
                <span>{{ scope.row.userAgent }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('user_login_name_label')" width="140" align="center">
          <template slot-scope="scope">
            {{ scope.row.user }}
          </template>
        </el-table-column>
        <!--el-table-column label="Method" align="center" width="400">
          <template slot-scope="scope">
            <span>{{ scope.row.method }}</span>
          </template>
        </el-table-column-->
        <el-table-column label="url" width="400" align="center">
          <template slot-scope="scope">
            {{ scope.row.url }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('create_date_title')" align="center" width="180" >
          <template slot-scope="scope">
            <span>{{ scope.row.createTimeStart }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操 作" width="80">
          <template slot-scope="scope">
            <el-button type="text" @click="delete_log(scope.$index, scope.row)">{{ $t('confirm_button_del_title') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="warning" style="font-size:16px;" @click="delete_all_rows">{{ $t('confirm_button_delete_all_title') }}</el-button>
      <el-pagination
        :page-sizes = "pageSizeList"
        :page-size = "pageSize"
        :current-page="logForm.pageIndex"
        :total = "totalNum"
        :background= "true"
        layout="total, sizes, prev, pager, next, jumper"
        @prev-click= "log_handle_prev_click"
        @next-click= "log_handle_next_click"
        @size-change = "log_handleSizeChange"
        @current-change="log_handleCurrentChange"/>
    </div>
  </div>
</template>

<script>
  import { searchLog, deleteLog, shrinkLog, deleteLogList } from '@/api/users'

  export default {
    data() {
      return {
        logForm: {
          user: '',
          method: '',
          param: '',
          url: '',
          createTimeStart: '',
          createTimeEnd: '',
          pageIndex: 1,
          pageSize: 10
        },
        list: null,
        currentlog: null,
        listLoading: false,
        isShowTable: false,
        pageSize: 10,
        totalNum: 5,
        pageCount: 1,
        pageSizeList: [10, 20, 100, 200],
        loading: false
      }
    },
    created() {
      this.log_fetchData()
    },
    methods: {
      log_clearUpForm() {
        this.logForm.user = ''
        this.logForm.method = ''
        this.logForm.param = ''
        this.logForm.url = ''
        this.logForm.createTimeStart = ''
        this.logForm.createTimeEnd = ''
        this.logForm.pageIndex = 1
        this.logForm.pageSize = 10
      },
      search_onSubmit() {
        this.$message('submit!')
        this.logForm.pageIndex = 1
        this.log_fetchData()
      },
      delete_log(index, row) {
        if (row.id !== null) {
          let info = ' '
          if (row.user !== null && row.createTimeStart) {
            info = ' ' + row.user + ' : ' + row.createTimeStart
          }
          var confirmTitle = '确认删除 [' + info + ' ]  记录?'
          var r = confirm(confirmTitle)
          if (r === true) {
            deleteLog(row.id).then(response => {
              this.$message('成功')
              this.list.splice(index, 1)
            }, error => {
                alert(error)
              }
            )
          }
        }
      },
      log_onCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
        this.isShowTable = false
        this.log_clearUpForm()
      },
      delete_all_rows() {
        var confirmTitle = '确认删除以上所有记录?'
        var r = confirm(confirmTitle)
        if (r === true) {
          const idList = []
          for (let i = 0; i < this.list.length; i++) {
            idList.push(this.list[i].id)
          }
          this.loading = true
          deleteLogList(idList).then(response => {
              this.loading = false
              for (let j = 0; j < idList.length; j++) {
                this.list.splice(0, 1)
              }
              this.log_fetchData()
          }, error => {
              this.loading = false
              alert(error)
            }
          )
        }
      },
      shrink_log() {
        var confirmTitle = '确认清理已删除记录?'
        var r = confirm(confirmTitle)
        if (r === true) {
          shrinkLog().then(response => {
            this.$message('成功')
          }, error => {
            alert(error)
          })
        }
      },
      log_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      log_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      log_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      log_fetchData() {
        // console.log('fetchData')

        if (this.logForm.user !== null) {
          this.logForm.user = String.trim(this.logForm.user)
        }
        if (this.logForm.method !== null) {
          this.logForm.method = String.trim(this.logForm.method)
        }
        if (this.logForm.param !== null) {
          this.logForm.param = String.trim(this.logForm.param)
        }
        searchLog(this.logForm).then(response => {
          // console.log('got list')
          this.list = response.data.rows
          this.listLoading = false
          this.pageSize = response.data.pageSize
          this.totalNum = response.data.total
          this.pageCount = this.totalNum / this.logForm.pageSize + 1
          this.isShowTable = true
        }, error => {
            this.listLoading = false
            alert(error)
          }
        )
      },
      log_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      log_handleSizeChange(val) {
        // val is the number per page

      },
      log_handleCurrentChange(val) {
        // console.log('log_handleCurrentChange')
        if (val === 0) {
          val = 1
        }
        this.logForm.pageIndex = val
        this.log_fetchData()
      },
      log_handle_prev_click() {
        if (this.logForm.pageIndex > 1) {
          this.logForm.pageIndex--
        } else {
          this.logForm.pageIndex = 1
        }
        this.log_fetchData()
      },
      log_handle_next_click() {
        if (this.logForm.pageIndex < this.pageCount) {
          this.logForm.pageIndex++
          this.log_fetchData()
        }
      },
      log_handlelogUpdateClose() {
        // console.log('detail dialog closed')
        this.editorVisible = false
      }
    }
  }
</script>

<style scoped>
  .log-manager-container {
    background-color: lightcyan;
    text-content: center;
  }
  .log_form {

  }

  .log-table-expand {
    font-size: 0;
  }
  .log-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .log-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

