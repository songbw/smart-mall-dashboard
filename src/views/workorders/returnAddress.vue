<template>
  <div class="app-container">
    <div v-if="hasEditPermission">
      <el-button type="primary" @click="handleShowDialog">
        新增退货地址
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="returnAddressList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系地址" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.provinceName + ' ' + scope.row.cityName + ' ' + scope.row.countyName }}</div>
          <div>{{ scope.row.address }}</div>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.isDefault ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <receiver-dialog
      :dialog-visible="dialogFormVisible"
      :is-return-address="true"
      :return-address-id="editId"
      @cancelled="handleCancel"
      @confirmed="handleSubmit"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getReturnAddressListApi,
  createReturnAddressApi,
  updateReturnAddressApi,
  deleteReturnAddressApi
} from '@/api/workOrders'
import { WorkOrderPermissions } from '@/utils/role-permissions'
import ReceiverDialog from './receiverDialog'

export default {
  name: 'ReturnAddress',
  components: { ReceiverDialog },
  data() {
    return {
      listLoading: false,
      returnAddressList: [],
      editId: -1,
      dialogFormVisible: false
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(WorkOrderPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(WorkOrderPermissions.update)
    }
  },
  created() {
    this.getReturnAddressList()
  },
  methods: {
    async getReturnAddressList() {
      if (this.hasViewPermission) {
        try {
          const data = await getReturnAddressListApi()
          if (Array.isArray(data)) {
            this.returnAddressList = data.map(item => ({
              id: item.id,
              isDefault: item.isDefault,
              ...JSON.parse(item.content)
            }))
          }
        } catch (e) {
          console.warn('Get return address list error:' + e)
        }
      } else {
        this.$message.warning('没有查看退货地址的权限，请联系管理员！')
      }
    },
    async handleEdit(index) {
      this.dialogFormVisible = true
      this.editId = this.returnAddressList[index].id
    },
    async handleDelete(index) {
      const id = this.returnAddressList[index].id
      try {
        await this.$confirm(`删除此退货地址, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteReturnAddressApi({ id })
        this.getReturnAddressList()
      } catch (e) {
        console.warn('Delete return address :' + e)
      }
    },
    handleShowDialog() {
      this.dialogFormVisible = true
      this.editId = -1
    },
    async createReturnAddress(params) {
      try {
        const res = await createReturnAddressApi(params)
        if (res.id >= 0) {
          this.$message.success('创建退货地址成功！')
          this.getReturnAddressList()
        }
      } catch (e) {
        console.warn('Create return address error:' + e)
      }
    },
    async updateReturnAddress(params) {
      try {
        await updateReturnAddressApi(params)
        this.getReturnAddressList()
        this.$message.success('更新退货地址成功！')
      } catch (e) {
        console.warn('Update return address error:' + e)
      }
    },
    handleCancel() {
      this.dialogFormVisible = false
      this.editId = -1
    },
    handleSubmit(params) {
      const id = this.editId
      this.dialogFormVisible = false
      this.editId = -1
      const { isDefault, ...content } = params
      if (id < 0) {
        this.createReturnAddress({ isDefault, content: JSON.stringify(content) })
      } else {
        this.updateReturnAddress({ id, isDefault, content: JSON.stringify(content) })
      }
    }
  }
}
</script>

<style scoped>
  .dialog-form-item {
    width: 400px;
  }
</style>
