<template>
  <div class="app-container">
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="gotoCreateFreeShipping">新建包邮模板</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="freeShippingList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="模板编号" align="center" width="80">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ViewFreeShipping', params: { id: scope.row.id }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="模板名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板模式" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.mode | modeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleView(scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasEditPermission"
            type="warning"
            size="mini"
            @click="handleEdit(scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="freeShippingTotal"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getFreeShippingList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getFreeShippingListApi,
  deleteFreeShippingApi
} from '@/api/freight'
import { FreeShippingModeOptions } from './constants'

export default {
  name: 'FreeShipping',
  components: { Pagination },
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return date && momentDate.isValid() ? momentDate.format(format) : ''
    },
    modeFilter: mode => {
      const find = FreeShippingModeOptions.find(item => item.value === mode)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      listLoading: false,
      freeShippingTotal: 0,
      freeShippingList: [],
      pageNo: 1,
      pageSize: 20
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    }),
    hasEditPermission() {
      return this.isAdminUser
    }
  },
  created() {
    this.getFreeShippingList()
  },
  methods: {
    async getFreeShippingList() {
      try {
        this.listLoading = true
        const params = { pageNo: this.pageNo, pageSize: this.pageSize }
        const { data } = await getFreeShippingListApi(params)
        if (data && data.result) {
          const res = data.result
          if (Array.isArray(res.list)) {
            this.freeShippingList = res.list
          }
          if (res.pageInfo) {
            this.freeShippingTotal = res.pageInfo.totalCount
          }
        }
      } catch (e) {
        console.warn('Get free shipping list error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleView(id) {
      this.$router.push({
        name: 'ViewFreeShipping',
        params: { id }
      })
    },
    handleEdit(id) {
      this.$router.push({
        name: 'EditFreeShipping',
        params: { id }
      })
    },
    handleDelete(id) {
      this.$confirm('是否继续删除此模板？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteFreeShippingApi({ id })
          this.$message({ message: '包邮模板删除成功！', type: 'success' })
          this.getFreeShippingList()
        } catch (e) {
          console.warn(`Delete free shipping error: ${e}`)
          this.$message.error('包邮模板删除失败，请联系管理员！')
        }
      }).catch(() => {
      })
    },
    gotoCreateFreeShipping() {
      this.$router.push({ name: 'CreateFreeShipping' })
    }
  }
}
</script>

<style scoped>

</style>
