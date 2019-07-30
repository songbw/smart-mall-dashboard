<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item>
        <el-input
          v-model="queryName"
          placeholder="输入品牌名"
          style="max-width: 400px;"
          class="filter-item"
          clearable
          maxlength="10"
          @keyup.enter.native="getBrandData"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getBrandData">
          搜索
        </el-button>
        <el-button type="info" icon="el-icon-edit" @click="handleCreate">
          新建品牌
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="listData"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="品牌编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.brandId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌全称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.brandName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌图标" align="center" width="200">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.brandLogo"
            :src="scope.row.brandLogo"
            fit="contain"
            style="width: 100px"
            lazy
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
            type="warning"
            size="mini"
            @click="handleEdit(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            :disabled="scope.row.addTime === null"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="brandTotal"
      :page.sync="listQuery.offset"
      :limit.sync="listQuery.limit"
      @pagination="getBrandData"
    />

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="brandForm" :model="dialogValue" :rules="dialogRules" label-width="120">
        <el-form-item label="品牌全称" prop="brandName">
          <el-input v-model="dialogValue.brandName" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="中文名称" prop="brandCname">
          <el-input v-model="dialogValue.brandCname" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="英文名称">
          <el-input v-model="dialogValue.brandEname" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="品牌图标" prop="brandLogo">
          <image-upload
            :image-url="dialogValue.brandLogo"
            :view-only="noEditPermission"
            path-name="brands"
            image-width="150px"
            tip="请选择对应的类别文件，类型位JPG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import ImageUpload from '@/components/ImageUpload'
import {
  getBrandListApi,
  searchBrandsApi,
  updateBrandApi,
  createBrandApi,
  deleteBrandApi
} from '@/api/brands'
import { app_upload_url } from '@/utils/constants'
import { validateURL } from '@/utils/validate'

export default {
  name: 'Brand',
  components: { Pagination, ImageUpload },
  data() {
    const validateName = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入品牌名称'))
      } else {
        callback()
      }
    }
    const validateLogo = (rule, value, callback) => {
      if (validateURL(value)) {
        callback()
      } else {
        callback(new Error('请选择品牌图标文件'))
      }
    }
    return {
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: 'brands'
      },
      dialogFormTitle: '',
      dialogFormVisible: false,
      dialogValue: {
        brandId: 0,
        brandName: '',
        brandCname: '',
        brandEname: '',
        brandLogo: ''
      },
      dialogRules: {
        brandName: [{ required: true, trigger: 'blur', validator: validateName }],
        brandLogo: [{ required: true, trigger: 'blur', validator: validateLogo }]
      },
      listQuery: {
        offset: 1,
        limit: 20,
        query: ''
      },
      listLoading: false,
      brandTotal: 0,
      listData: [],
      filterTitle: null,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    }),
    noEditPermission() {
      return !this.isAdminUser
    },
    queryName: {
      get() {
        return this.listQuery.query
      },
      set(value) {
        this.listQuery.query = trim(value)
      }
    }
  },
  created() {
    this.getListData()
  },
  methods: {
    async getListData() {
      this.listLoading = true
      try {
        const { data } = await getBrandListApi({
          offset: this.listQuery.offset,
          limit: this.listQuery.limit
        })
        this.listData = data.result.list
        this.brandTotal = data.result.total
      } catch (e) {
        console.warn('Get brand list error: ' + e)
      } finally {
        this.listLoading = false
      }
    },
    async handleFilter() {
      this.listQuery.offset = 1
      this.listLoading = true
      try {
        const { data } = await searchBrandsApi(this.listQuery)
        this.listData = data.result.list
        this.brandTotal = data.result.total
      } catch (e) {
        console.warn('Brand filter:' + e)
      } finally {
        this.listLoading = false
      }
    },
    getBrandData() {
      if (isEmpty(this.listQuery.query)) {
        this.getListData()
      } else {
        this.handleFilter()
      }
    },
    handleDelete(index) {
      const that = this
      this.$confirm('是否继续删除此品牌？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const id = that.listData[index].brandId
          const params = {
            id
          }
          await deleteBrandApi(params)
          this.$message({ message: '品牌删除成功！', type: 'success' })
          if (this.listData.length === 1 && this.listQuery.offset > 1) {
            this.listQuery.offset = this.listQuery.offset - 1
          }
          that.getBrandData()
        } catch (e) {
          console.warn(`Delete Brand error: ${e}`)
        }
      }).catch(() => {
      })
    },
    handleEdit(index) {
      this.editIndex = index
      const row = this.listData[index]
      Object.keys(this.dialogValue).forEach(key => {
        this.dialogValue[key] = row[key]
      })
      this.dialogFormTitle = `编辑 ${row.brandName}`
      this.dialogFormVisible = true
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.brandLogo = url
    },
    handleCancel() {
      this.dialogFormVisible = false
      this.$refs.brandForm.clearValidate()
    },
    handleSubmit() {
      this.$refs.brandForm.validate(valid => {
        if (valid) {
          if (this.dialogFormVisible) {
            this.dialogFormVisible = false
          }
          if (this.editIndex >= 0) {
            this.handleUpdateBrand()
          } else {
            this.handleCreateBrand()
          }
        }
      })
    },
    handleUpdateBrand() {
      let changed = false
      const brand = this.listData[this.editIndex]
      const params = {
        brandId: brand.brandId
      }
      Object.keys(this.dialogValue).forEach(key => {
        if (brand[key] !== this.dialogValue[key]) {
          params[key] = this.dialogValue[key]
          changed = true
        }
      })
      if (changed) {
        updateBrandApi(params).then(() => {
          this.$message.success('更新品牌信息成功！')
        }).catch((err) => {
          console.log('Brand update error:' + err)
          this.$message.error('更新品牌信息失败，请稍后重试!')
        })
      }
    },
    handleCreateBrand() {
      const params = {}
      Object.keys(this.dialogValue).forEach(key => {
        if (!isEmpty(this.dialogValue[key])) {
          params[key] = this.dialogValue[key]
        }
      })
      createBrandApi(params).then(() => {
        this.$message.success('品牌创建成功！')
      }).catch((err) => {
        console.log('Brand create error:' + err)
        this.$message.error('品牌创建成功失败，请稍后重试!')
      })
    },
    handleCreate() {
      Object.keys(this.dialogValue).forEach(key => {
        this.dialogValue[key] = ''
      })
      this.editIndex = -1
      this.dialogValue.brandId = 0
      this.dialogFormTitle = `新建品牌`
      this.dialogFormVisible = true
    }
  }
}
</script>

<style scoped>
  .dialog-form-item {
    width: 80%;
  }
</style>

