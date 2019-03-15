<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('brand_search_input_placeholder')"
                v-model="filterTitle" style="max-width: 400px;" class="filter-item"
                @keyup.enter.native="handleFilter" @change="onTitleChanged"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('brand_search_title') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="listData"
      border fit stripe highlight-current-row
      style="width: 100%;"
      @cell-mouse-enter="handleTableCellMouseEnter"
    >
      <el-table-column :label="$t('brand_table_id_title')" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.brandId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brand_table_name_title')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.brandName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brand_table_logo_title')" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.brandLogo" :src="scope.row.brandLogo" class="logo-container">
          <el-upload v-else
                     :action="uploadUrl"
                     :data="uploadData"
                     :auto-upload="true"
                     :limit="1"
                     :show-file-list="false"
                     :before-upload="handleBeforeUploadImage"
                     :on-success="handleUploadImageSuccess"
                     :on-error="handleUploadImageError"
                     list-type="picture"
                     name="file">
            <el-popover :open-delay="1000" :content="$t('brand_button_upload_tip')" trigger="hover"
                        placement="top">
              <el-button slot="reference" size="mini" type="primary" icon="el-icon-upload" plain/>
            </el-popover>
          </el-upload>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brand_table_ops_title')" align="center" width="230"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="warning" size="mini"
                     @click="handleEdit(scope.row)">
            {{ $t('brand_table_ops_edit_title') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.offset" :limit.sync="listQuery.limit"
                @pagination="getListData"/>

    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="dialogValue" label-position="left">
        <el-form-item :label="$t('brand_table_name_title')">
          <el-input v-model="dialogValue.brandName" :disabled="true"/>
        </el-form-item>
        <el-form-item :label="$t('brand_table_cname_title')">
          <el-input v-model="dialogValue.brandCname" :disabled="true"/>
        </el-form-item>
        <el-form-item :label="$t('brand_table_ename_title')">
          <el-input v-model="dialogValue.brandEname" :disabled="true"/>
        </el-form-item>
        <el-form-item :label="$t('brand_table_logo_title')">
          <img v-if="dialogValue.brandLogo" :src="dialogValue.brandLogo" width="100px">
          <el-upload
            ref="upload"
            :action="uploadUrl"
            :data="uploadData"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUploadImage"
            :on-success="handleUploadImageSuccess"
            :on-error="handleUploadImageError"
            :on-progress="handleUploadImageProgress"
            list-type="picture"
            name="file">
            <el-button slot="trigger" size="small" type="primary">{{ $t('brand_button_select_title') }}</el-button>
            <div slot="tip" class="el-upload__tip">{{ $t('brand_button_select_tip') }}</div>
          </el-upload>
          <el-progress :text-inside="true" :stroke-width="18" :percentage="imageUploadPercent"
                       status="success"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('confirm_button_cancel_title') }}</el-button>
        <el-button type="primary" @click="handleBtnUpdateBrand">
          {{ $t('confirm_button_ok_title') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { parseTime } from '@/utils'
  import { mapGetters } from 'vuex'
  import pagination from '@/components/Pagination'

  export default {
    name: 'Brand',
    components: { pagination },
    filters: {
      timeFilter(time, cFormat) {
        return parseTime(time, cFormat)
      }
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: 'brands'
        },
        dialogFormTitle: '',
        dialogFormVisible: false,
        dialogValue: {
          brandId: 0,
          brandName: undefined,
          brandCname: undefined,
          brandEname: undefined,
          brandLogo: undefined
        },
        listQuery: {
          offset: 1,
          limit: 20,
          header: undefined
        },
        listLoading: false,
        filterTitle: null,
        uploadingImage: false,
        updateValue: {
          brandId: 0,
          brandLogo: null
        },
        imageUploadPercent: 0
      }
    },
    computed: {
      ...mapGetters({
        total: 'brandsNum',
        listData: 'brandsData'
      })
    },
    created() {
      this.getListData()
    },
    methods: {
      getListData() {
        this.listLoading = true
        this.$store.dispatch('GetBrandsData', this.listQuery).then(() => {
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 500)
        }).catch(() => {
          this.listLoading = false
        })
      },
      onTitleChanged(title) {
        if (title.trim() !== '') {
          this.listQuery.query = title
        } else {
          this.listQuery.query = undefined
        }
      },
      handleTableCellMouseEnter(row, column, cell, event) {
        if (row.brandId !== this.updateValue.brandId && this.uploadingImage === false) {
          this.updateValue.brandId = row.brandId
        }
      },
      handleFilter() {
        this.listQuery.offset = 1
        this.listLoading = true
        this.$store.dispatch('SearchBrandsData', this.listQuery).then(() => {
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 500)
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleEdit(row) {
        this.dialogValue = row
        this.imageUploadPercent = 0
        this.dialogFormTitle = this.$t('brand_edit_title', { brand: row.brandName })
        this.dialogFormVisible = true
      },
      handleBeforeUploadImage(file) {
        this.uploadingImage = true
        return true
      },
      handleUploadImageSuccess(res) {
        this.updateValue.brandLogo = this.$store.getters.cosUrl + res.data.url
        this.$store.dispatch('UpdateBrandsData', this.updateValue).then(() => {
          if (this.dialogFormVisible) {
            setTimeout(() => {
              this.dialogFormVisible = false
            }, 500)
            this.$refs.upload.clearFiles()
          }
          this.uploadingImage = false
        }).catch((err) => {
          console.log('handleUploadImageSuccess:' + err)
        })
      },
      handleUploadImageError(res) {
        if (this.dialogFormVisible) {
          setTimeout(() => {
            this.dialogFormVisible = false
          }, 500)
          this.$refs.upload.clearFiles()
        }
        this.uploadingImage = false
      },
      handleUploadImageProgress(event) {
        this.imageUploadPercent = event.percent
      },
      handleBtnUpdateBrand() {
        this.$refs.upload.submit()
      }
    }
  }
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }

  .logo-container {
    height: 50px;
  }
</style>
