<template>
  <div class="app-container">
    <div>
      <el-button v-if="hasEditPermission" type="primary" icon="el-icon-edit" @click="handleCreate">
        新建公告
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="bulletinList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公告标题" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公告位置" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.position === 'top' ? '顶部': '底部' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品供应商" align="center">
        <template slot-scope="scope">
          <span>{{ getVendorName(scope.row.merchantCode) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.state ? '是' : '否' }}</span>
          <el-switch
            v-if="hasEditPermission"
            :value="scope.row.state"
            style="margin-left: 10px"
            @change="value => handleSetState(value, scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleView(scope.$index)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasEditPermission"
            :disabled="scope.row.state"
            type="warning"
            size="mini"
            @click="handleEdit(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission"
            type="danger"
            size="mini"
            :disabled="scope.row.state"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="bulletinTotal"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getBulletinList"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="bulletinDialogVisible"
      title="商品公告"
    >
      <el-form
        ref="bulletinForm"
        :model="bulletinForm"
        :rules="bulletinRules"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="bulletinForm.title" maxlength="20" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="bulletinForm.state" />
        </el-form-item>
        <el-form-item label="公告位置">
          <el-radio-group v-model="bulletinForm.position">
            <el-radio label="top">顶部</el-radio>
            <el-radio label="bottom">底部</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="公告商户">
          <span>{{ bulletinForm.codeName }}</span>
          <el-button type="info" size="mini" style="margin-left: 10px" @click="vendorSelectionVisible = true">
            修改商户
          </el-button>
        </el-form-item>
        <el-form-item label="公告图片" prop="imageUrl">
          <image-upload
            :image-url="bulletinForm.imageUrl"
            path-name="bulletins"
            image-width="200px"
            tip="请选择对应的公告图片文件，文件格式为JPEG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateBulletin">取消</el-button>
        <el-button type="primary" @click="confirmCreateBulletin">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="imageDialogVisible"
      title="商品公告"
    >
      <el-image :src="dialogImageUrl" fit="contain" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="imageDialogVisible = false">确定</el-button>
      </div>
    </el-dialog>
    <vendor-code-selection
      :dialog-visible="vendorSelectionVisible"
      :vendor-list="vendorList"
      :vendor-loading="vendorLoading"
      @cancelled="vendorSelectionVisible = false"
      @confirmed="handleVendorSelected"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import ImageUpload from '@/components/ImageUpload'
import { getMerchantCodeListApi } from '@/api/products'
import {
  getBulletinListApi,
  createBulletinApi,
  updateBulletinApi,
  deleteBulletinApi,
  updateBulletinStateApi
} from '@/api/bulletins'
import VendorCodeSelection from './VendorCodeSelection'
import { BulletinPermissions } from '@/utils/role-permissions'

export default {
  name: 'Bulletins',
  components: { Pagination, ImageUpload, VendorCodeSelection },
  data() {
    return {
      listLoading: false,
      vendorLoading: false,
      vendorList: [],
      bulletinTotal: 0,
      bulletinList: [],
      pageNo: 1,
      pageSize: 20,
      imageDialogVisible: false,
      dialogImageUrl: null,
      bulletinDialogVisible: false,
      vendorSelectionVisible: false,
      bulletinForm: {
        id: -1,
        title: '',
        state: true,
        merchantId: 0,
        merchantCode: 0,
        codeName: '',
        position: 'top',
        imageUrl: null
      },
      bulletinRules: {
        title: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value.trim())) {
              callback(new Error('请输入公告标题内容'))
            } else {
              callback()
            }
          }
        }],
        imageUrl: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择公告内容图片'))
            } else {
              callback()
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
    hasViewPermission() {
      return this.userPermissions.includes(BulletinPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(BulletinPermissions.update)
    }
  },
  created() {
    this.prepareList()
  },
  methods: {
    async prepareList() {
      await this.getVendorList()
      this.getBulletinList()
    },
    async getVendorList() {
      try {
        this.vendorLoading = true
        const { code, data } = await getMerchantCodeListApi()
        if (code === 200) {
          this.vendorList = data.result
        }
      } catch (e) {
        console.warn('Product get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
      }
    },
    getVendorName(vendorCode) {
      if (this.vendorList.length > 0 && vendorCode != null) {
        const vendor = this.vendorList.find(option => option.merchantCode === vendorCode)
        if (vendor) {
          return vendor.merchantName
        } else {
          return ''
        }
      }
    },
    async getBulletinList() {
      if (this.hasViewPermission) {
        try {
          this.listLoading = true
          const { code, data } = await getBulletinListApi({ pageNo: this.pageNo, pageSize: this.pageSize })
          if (code === 200 && data.result) {
            this.bulletinList = data.result.list
            this.bulletinTotal = data.result.pageInfo.totalCount
          }
        } catch (e) {
          console.warn('Get bulletin list error:' + e)
        } finally {
          this.listLoading = false
        }
      } else {
        this.$message.warning('没有查看公告权限，请联系管理员！')
      }
    },
    resetFormData() {
      this.bulletinForm.id = -1
      this.bulletinForm.title = ''
      this.bulletinForm.state = true
      this.bulletinForm.merchantId = 0
      this.bulletinForm.merchantCode = 0
      this.bulletinForm.codeName = ''
      this.bulletinForm.position = 'top'
      this.bulletinForm.imageUrl = null
    },
    handleCreate() {
      this.resetFormData()
      if (this.vendorList.length === 0) {
        this.getVendorList()
      }
      this.bulletinDialogVisible = true
    },
    handleView(index) {
      const bulletin = this.bulletinList[index]
      this.dialogImageUrl = bulletin.imageUrl
      this.imageDialogVisible = true
    },
    handleEdit(index) {
      const bulletin = this.bulletinList[index]
      Object.keys(this.bulletinForm).forEach(key => {
        this.bulletinForm[key] = bulletin[key]
      })
      if (this.vendorList.length === 0) {
        this.getVendorList()
      }
      this.bulletinDialogVisible = true
    },
    handleSetState(state, id) {
      this.$confirm(state ? '是否启用此商品公告？' : '是否禁用此商品公告？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const { code, msg } = await updateBulletinStateApi({ id, state })
          if (code === 200) {
            this.getBulletinList()
          } else {
            this.$message.warning(msg)
          }
        } catch (e) {
          console.warn('Update bulletin state error: ' + e)
        }
      }).catch(() => {
      })
    },
    handleDelete(index) {
      this.$confirm('是否删除此商品公告？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const id = this.bulletinList[index].id
          const { code, msg } = await deleteBulletinApi({ id })
          if (code === 200) {
            this.getBulletinList()
          } else {
            this.$message.warning(msg)
          }
        } catch (e) {
          console.warn('Delete bulletin state error: ' + e)
        }
      }).catch(() => {
      })
    },
    handleVendorSelected(vendor) {
      this.bulletinForm.merchantId = vendor.merchantId
      this.bulletinForm.merchantCode = vendor.merchantCode
      this.bulletinForm.codeName = vendor.merchantName
      this.vendorSelectionVisible = false
    },
    handleUploadImageSuccess(url) {
      this.bulletinForm.imageUrl = url
    },
    async createBulletin(data) {
      try {
        this.listLoading = true
        const { code, msg } = await createBulletinApi(data)
        if (code === 200) {
          this.getBulletinList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create bulletin error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    async updateBulletin() {
      try {
        const { id, ...data } = this.bulletinForm
        const bulletin = this.bulletinList.find(item => item.id === id)
        const params = {}
        Object.keys(data).forEach(key => {
          if (data[key] !== bulletin[key]) {
            params[key] = data[key]
          }
        })
        if (!isEmpty(params)) {
          this.listLoading = true
          const { code, msg } = await updateBulletinApi({ id, ...params })
          if (code === 200) {
            this.getBulletinList()
          } else {
            this.$message.warning(msg)
          }
        }
      } catch (e) {
        console.warn('Update bulletin error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    cancelCreateBulletin() {
      this.$refs.bulletinForm.clearValidate()
      this.bulletinDialogVisible = false
      this.resetFormData()
    },
    confirmCreateBulletin() {
      this.$refs.bulletinForm.validate(valid => {
        if (valid) {
          this.bulletinDialogVisible = false
          const { id, ...data } = this.bulletinForm
          if (id < 0) {
            this.createBulletin(data)
          } else {
            this.updateBulletin()
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
