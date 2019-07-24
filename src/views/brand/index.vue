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
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          搜索
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
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="brandTotal"
      :page.sync="listQuery.offset"
      :limit.sync="listQuery.limit"
      @pagination="getListData"
    />

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="dialogValue" label-position="right" label-width="120">
        <el-form-item label="品牌全称">
          <el-input v-model="dialogValue.brandName" readonly class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="中文名称">
          <el-input v-model="dialogValue.brandCname" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="英文名称">
          <el-input v-model="dialogValue.brandEname" :readonly="noEditPermission" class="dialog-form-item" />
        </el-form-item>
        <el-form-item label="品牌图标">
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
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBtnUpdateBrand">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import ImageUpload from '@/components/ImageUpload'
import {
  getBrandListApi,
  searchBrandsApi,
  updateBrandApi
} from '@/api/brands'
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'Brand',
  components: { Pagination, ImageUpload },
  data() {
    return {
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: 'brands'
      },
      dialogFormTitle: '',
      dialogFormVisible: false,
      dialogValue: {
        brandId: 0,
        brandName: null,
        brandCname: null,
        brandEname: null,
        brandLogo: null
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
      updateValue: {
        brandId: 0,
        brandLogo: null
      }
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
    handleSearch() {
      if (this.listQuery.query) {
        this.handleFilter()
      } else {
        this.getListData()
      }
    },
    handleEdit(row) {
      this.dialogValue = row
      this.dialogFormTitle = `编辑 ${row.brandName}`
      this.dialogFormVisible = true
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.brandLogo = url
      this.updateValue.brandLogo = url
    },
    handleBtnUpdateBrand() {
      if (this.dialogFormVisible) {
        this.dialogFormVisible = false
      }
      if (this.updateValue.brandLogo) {
        this.updateValue.brandId = this.dialogValue.brandId
        updateBrandApi(this.updateValue).then(() => {
          this.$message.success('更新品牌信息成功！')
        }).catch((err) => {
          console.log('handleBtnUpdateBrand:' + err)
          this.$message.error('更新品牌信息失败，请稍后重试!')
        })
      }
    }
  }
}
</script>

<style scoped>
  .dialog-form-item {
    width: 80%;
  }
</style>

