<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item label="用户名">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="电话号码">
        <el-input v-model="queryPhone" placeholder="输入电话号码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsersData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="vendorTable"
      v-loading="dataLoading"
      :data="userData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录名" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话号码" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户角色" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.role | roleFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公司名称" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleViewVendorInfo(scope.$index)">
            {{ scope.row.company ? scope.row.company.name: '未填写公司' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEditUser(scope.row.id)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="userTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getUsersData"
    />
    <vendor-detail
      :dialog-visible="vendorDialogVisible"
      :company="currentVendor"
      @onConfirmed="vendorDialogVisible = false"
    />
    <el-dialog title="修改用户" :visible.sync="userDialogVisible" width="30%">
      <el-form v-loading="vendorLoading" :model="userForm">
        <el-form-item label="企业列表">
          <el-select :value="userForm.companyId" placeholder="请选择企业名称" @change="onVendorSelected">
            <el-option
              v-for="item in vendorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSetUser">取消</el-button>
        <el-button type="primary" @click="handleSetUserCompany">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import VendorDetail from './detail'
import {
  getVendorUserListApi,
  getVendorListApi,
  setUserVendorApi
} from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'

export default {
  name: 'UserManager',
  filters: {
    roleFormat: role => {
      if (role === 'admin') {
        return '平台管理员'
      } else {
        return '商户管理员'
      }
    },
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  components: { Pagination, VendorDetail },
  data() {
    return {
      dataLoading: false,
      queryName: '',
      queryPhone: '',
      queryOffset: 1,
      queryLimit: 20,
      userData: [],
      userTotal: 0,
      vendorDialogVisible: false,
      currentVendor: {
        name: '',
        licenceUrl: null,
        address: '',
        industry: '',
        createTime: null,
        updateTime: null,
        comments: '',
        status: 0
      },
      userDialogVisible: false,
      vendorLoading: false,
      userForm: {
        userId: null,
        companyId: null
      },
      vendorOptions: []
    }
  },
  created() {
    this.getUsersData()
  },
  methods: {
    async getUsersData() {
      try {
        const params = {
          page: this.queryOffset,
          limit: this.queryLimit
        }
        if (!isEmpty(this.queryPhone)) {
          params.phone = this.queryPhone
        }
        if (!isEmpty(this.queryName)) {
          params.name = this.queryName
        }
        this.dataLoading = true
        const data = await getVendorUserListApi(params)
        this.userData = data.rows
        this.userTotal = data.total
      } catch (e) {
        console.warn('Get vendor user list error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    handleViewVendorInfo(index) {
      if (this.userData[index].company) {
        this.currentVendor = this.userData[index].company
        this.vendorDialogVisible = true
      }
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        this.vendorOptions = data.rows.map(row => {
          return {
            value: row.company.id,
            label: row.company.name
          }
        })
      } catch (e) {
        console.warn('Vendor user manager get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
      }
    },
    handleEditUser(id) {
      this.userDialogVisible = true
      this.userForm.userId = id
      this.getVendorList()
    },
    onVendorSelected(value) {
      this.userForm.companyId = value
    },
    handleCancelSetUser() {
      this.userDialogVisible = false
      this.userForm.userId = null
      this.userForm.companyId = null
    },
    async handleSetUserCompany() {
      this.userDialogVisible = false
      if (this.userForm.companyId !== null && this.userForm.userId !== null) {
        try {
          const name = this.vendorOptions.find(item => item.value === this.userForm.companyId).label
          await this.$confirm(`将此用户添加为公司${name}的管理员, 是否继续?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          await setUserVendorApi(this.userForm)
          this.getUsersData()
          this.$message.success('修改用户企业成功！')
        } catch (e) {
          console.warn('Vendor user manager set company error:' + e)
        } finally {
          this.userForm.userId = null
          this.userForm.companyId = null
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
