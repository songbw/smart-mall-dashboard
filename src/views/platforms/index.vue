<template>
  <div class="app-container">
    <div v-if="hasEditPermission" style="margin-bottom: 10px">
      <el-button type="primary" @click="handleCreate">创建运营平台</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="appPlatformList"
      border
      fit
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台名称" align="center" width="240">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台编码" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.appId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="网关地址" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gatewayUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getAppPlatformList"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="platformDialogVisible"
      title="运营平台"
    >
      <el-form
        ref="platformForm"
        :model="platformForm"
        :rules="platformRules"
        label-width="6rem"
      >
        <el-form-item label="平台名称" prop="name">
          <el-input
            v-model.trim="platformForm.name"
            placeholder="请输入平台名称"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="平台编码" prop="appId">
          <el-input
            v-model.trim="platformForm.appId"
            :readonly="editId > -1"
            placeholder="请输入AppID"
            maxlength="3"
          />
        </el-form-item>
        <el-form-item label="网关地址" prop="gatewayUrl">
          <el-input
            v-model="platformForm.gatewayUrl"
            placeholder="请输入网关地址"
            maxlength="50"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogCancel">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import { AppPlatformPermissions } from '@/utils/role-permissions'
import {
  getAppPlatformListApi,
  createAppPlatformApi,
  updateAppPlatformApi
} from '@/api/products'
import { validateURL } from '@/utils/validate'

export default {
  name: 'AppPlatformManagement',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      queryOffset: 1,
      queryLimit: 20,
      total: 0,
      appPlatformList: [],
      editId: -1,
      platformDialogVisible: false,
      platformForm: {
        name: '',
        appId: '',
        gatewayUrl: ''
      },
      platformRules: {
        name: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入平台名称'))
            } else {
              callback()
            }
          }
        }],
        appId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入平台编码'))
            } else {
              callback()
            }
          }
        }],
        gatewayUrl: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (validateURL(value)) {
              callback()
            } else {
              callback(new Error('请输入有效网关地址'))
            }
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasEditPermission() {
      return this.userPermissions.includes(AppPlatformPermissions.update)
    }
  },
  created() {
    this.getAppPlatformList()
  },
  methods: {
    async getAppPlatformList() {
      this.listLoading = true
      try {
        const { code, data } = await getAppPlatformListApi({ pageNo: this.queryOffset, pageSize: this.queryLimit })
        if (code === 200) {
          this.appPlatformList = data.list
          this.total = data.total
        }
      } catch (e) {
        console.warn('Get app platform list error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleCreate() {
      this.editId = -1
      this.platformDialogVisible = true
    },
    handleEdit(row) {
      this.editId = row.id
      this.platformForm.name = row.name
      this.platformForm.appId = row.appId
      this.platformForm.gatewayUrl = row.gatewayUrl
      this.platformDialogVisible = true
    },
    handleDialogCancel() {
      this.$refs.platformForm.resetFields()
      this.platformDialogVisible = false
    },
    handleDialogConfirm() {
      this.$refs.platformForm.validate(async valid => {
        if (valid) {
          try {
            let data = null
            if (this.editId === -1) {
              data = await createAppPlatformApi(this.platformForm)
            } else {
              data = await updateAppPlatformApi({ id: this.editId, ...this.platformForm })
            }
            const { code, msg } = data
            if (code === 200) {
              this.platformDialogVisible = false
              this.getAppPlatformList()
              this.$refs.platformForm.resetFields()
            } else {
              this.$message.warning(msg)
            }
          } catch (e) {
            console.warn('Create app platform error:' + e)
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
