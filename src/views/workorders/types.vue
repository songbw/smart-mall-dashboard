<template>
  <div class="app-container">
    <div v-if="isAdminUser" class="filter-container">
      <el-button type="primary" @click="handleCreate">新建类型</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="workOrderTypes"
      border
      fit
      stripe
      highlight-current-row
      style="width: 60%;"
    >
      <el-table-column label="类型编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isAdminUser"
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      :page-sizes="[20, 40, 80, 100]"
      @pagination="getworkOrderTypes"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import {
  getWorkOrderTypesApi,
  createWorkOrderApi,
  updateWorkOrderApi,
  deleteWorkOrderApi
} from '@/api/workOrders'

export default {
  name: 'WorkOrderTypes',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      queryOffset: 1,
      queryLimit: 20,
      total: 0,
      workOrderTypes: []
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    })
  },
  created() {
    this.getworkOrderTypes()
  },
  methods: {
    async getworkOrderTypes() {
      this.listLoading = true
      try {
        const data = await getWorkOrderTypesApi({ offset: this.queryOffset, limit: this.queryLimit })
        this.workOrderTypes = data.rows
        this.total = data.total
      } catch (e) {
        console.warn('Get work order types error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    async handleCreate() {
      try {
        const { value } = await this.$prompt('请输入优惠券标签名称', '创建标签', {
          confirmButtonText: '创建',
          cancelButtonText: '取消'
        })
        await createWorkOrderApi({ name: value })
        this.getworkOrderTypes()
      } catch (e) {
        console.warn('WorkOrder: create ' + e)
      }
    },
    async handleEdit(row) {
      try {
        const { value } = await this.$prompt('请输入优惠券标签名称', '修改标签', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await updateWorkOrderApi({ id: row.id, name: value })
        this.getworkOrderTypes()
      } catch (e) {
        console.warn('WorkOrder: create ' + e)
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('是否确定删除此标签？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteWorkOrderApi({ id: row.id })
        this.getworkOrderTypes()
      } catch (e) {
        console.warn('WorkOrder: delete ' + e)
      }
    }
  }
}
</script>
