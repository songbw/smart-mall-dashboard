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
          <el-tag>{{ scope.row.phone }}</el-tag>
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
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleViewUserInfo(scope.row.id)">
            查看
          </el-button>
          <el-button
            type="warning"
            size="mini"
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
      :page-sizes="[20, 40, 80, 100]"
      @pagination="getUsersData"
    />
    <vendor-detail
      :dialog-visible="vendorDialogVisible"
      :company="currentVendor"
      @onConfirmed="vendorDialogVisible = false"
    />
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import VendorDetail from './detail'
import {
  getVendorUserListApi
} from '@/api/vendor'

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
      }
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
    handleViewUserInfo(id) {
    }
  }
}
</script>

<style scoped>

</style>
