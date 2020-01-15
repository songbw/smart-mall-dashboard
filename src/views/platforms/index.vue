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
      <el-table-column label="支付方式" align="center">
        <template slot-scope="scope">
          <el-tag
            v-for="pay in scope.row.payTypes"
            :key="pay.value"
            style="margin: 0 3px"
          >
            {{ pay.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="240"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑平台
          </el-button>
          <el-button
            type="info"
            size="mini"
            @click="handleEditPayment(scope.row)"
          >
            修改支付
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
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogPaymentVisible"
      title="修改支付方式"
      width="850px"
    >
      <el-form ref="paymentForm" :model="paymentForm" label-width="120px">
        <el-form-item label="运营平台">
          <span>{{ paymentForm.name }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-transfer
            v-model="paymentForm.payTypes"
            :titles="['未添加', '已添加']"
            :button-texts="['删除', '添加']"
            :props="{key: 'value', label: 'label'}"
            :data="payTypeOptions"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPaymentVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmPayment">确定</el-button>
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
import {
  getPayTypeListByAppIdApi,
  bindPayTypeWithPlatformApi,
  deletePayTypeFromAppIdApi
} from '@/api/payments'
import { validateURL } from '@/utils/validate'
import { PayTypeOptions } from '@/utils/constants'

export default {
  name: 'AppPlatformManagement',
  components: { Pagination },
  data() {
    return {
      payTypeOptions: PayTypeOptions,
      listLoading: false,
      queryOffset: 1,
      queryLimit: 20,
      total: 0,
      appPlatformList: [],
      editId: -1,
      dialogPaymentVisible: false,
      paymentForm: {
        name: '',
        appId: null,
        payTypes: []
      },
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
    this.prepareData()
  },
  methods: {
    async prepareData() {
      await this.getAppPlatformList()
    },
    async getPayTypeListByAppId(appId) {
      try {
        const { code, data } = await getPayTypeListByAppIdApi({ appid: appId })
        if (code === 200) {
          return data.map(item => {
            const find = PayTypeOptions.find(type => type.value === item.name)
            return {
              id: item.id,
              value: item.name,
              label: find ? find.label : item.desc
            }
          })
        }
      } catch (e) {
        console.warn('Get pay type list error:' + e)
      }
      return []
    },
    async getAppPlatformList() {
      this.listLoading = true
      try {
        const { code, data } = await getAppPlatformListApi({ pageNo: this.queryOffset, pageSize: this.queryLimit })
        if (code === 200) {
          for (const item of data.list) {
            const payTypes = await this.getPayTypeListByAppId(item.appId)
            this.appPlatformList.push({ payTypes, ...item })
          }
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
    handleEditPayment(row) {
      this.paymentForm.appId = row.appId
      this.paymentForm.name = row.name
      this.paymentForm.payTypes = row.payTypes.map(item => item.value)
      this.dialogPaymentVisible = true
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
    },
    async handleConfirmPayment() {
      this.dialogPaymentVisible = false
      try {
        this.listLoading = true
        const platform = this.appPlatformList.find(item => item.appId === this.paymentForm.appId)
        const toDelIds = platform.payTypes
          .filter(item => !this.paymentForm.payTypes.includes(item.value))
          .map(item => item.id)
        const appTypes = platform.payTypes.map(item => item.value)
        const toAddTypes = this.paymentForm.payTypes.filter(item => !appTypes.includes(item))
        const params = toAddTypes.map(item => ({ appid: this.paymentForm.appId, name: item, desc: '' }))
        if (toAddTypes.length > 0) {
          await bindPayTypeWithPlatformApi({ mutilPayTypes: params })
        }
        if (toDelIds.length > 0) {
          await deletePayTypeFromAppIdApi({ ids: toDelIds.join(',') })
        }
        platform.payTypes = await this.getPayTypeListByAppId(this.paymentForm.appId)
      } catch (e) {
        console.warn('Bind payment with app id error:' + e)
      } finally {
        this.listLoading = false
      }
    }
  }
}
</script>

<style scoped>

</style>
