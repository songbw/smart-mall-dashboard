<template>
  <el-container>
    <el-header height="40px">
      <div style="float: right">
        <span>{{ $t('aggregation_customization_service_tip_title') }}</span>
        <el-button :disable="serviceListLength >= 20" type="primary" size="mini"
                   @click="showImageDialog(true)">
          {{ $t('aggregation_customization_btn_add_title') }}
        </el-button>
      </div>
    </el-header>
    <el-main>
      <el-table :data="serviceInfo.list" style="width: 100%" border>
        <el-table-column
          :index="serviceIndex"
          type="index"
        />
        <el-table-column :label="$t('aggregation_customization_service_table_name_title')">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('aggregation_customization_service_table_image_title')">
          <template slot-scope="scope">
            <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" width="50px">
          </template>
        </el-table-column>
        <el-table-column :label="$t('aggregation_customization_service_table_sort_title')">
          <template slot-scope="scope">
            <el-button :disabled="scope.$index === 0"
                       type="warning" icon="el-icon-caret-top" size="mini" circle
                       @click="handleSortUp(scope.$index)" />
            <el-button :disabled="scope.$index === serviceInfo.list.length - 1"
                       type="warning" icon="el-icon-caret-bottom" size="mini" circle
                       @click="handleSortDown(scope.$index)" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('aggregation_table_ops_title')">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" circle
                       @click="handleEdit(scope.$index)" />
            <el-button type="danger" icon="el-icon-delete" size="mini" circle
                       @click="handleDelete(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>
      <el-form :model="formValue" label-width="80px" style="margin: 10px">
        <el-form-item :label="$t('aggregation_customization_service_margin_title')" prop="marginBottom">
          <el-select v-model="formValue.marginBottom" @change="onMarginChanged">
            <el-option label="0px" value="0" />
            <el-option label="10px" value="10" />
            <el-option label="20px" value="20" />
            <el-option label="30px" value="30" />
            <el-option label="40px" value="40" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-main>
    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm" :model="dialogValue" :rules="dialogRules" label-position="left" label-width="80px">
        <el-form-item :label="$t('aggregation_customization_service_table_name_title')">
          <el-input v-model="dialogValue.name" />
        </el-form-item>
        <el-form-item :label="$t('aggregation_customization_service_table_image_title')" prop="imageUrl">
          <img v-if="dialogValue.imageUrl" :src="dialogValue.imageUrl" width="100px">
          <el-upload
            ref="uploadServiceIcon"
            :action="uploadUrl"
            :data="uploadData"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUploadImage"
            :on-success="handleUploadImageSuccess"
            :on-error="handleUploadImageError"
            :on-progress="handleUploadImageProgress"
            :on-change="handleUploadImageChanged"
            list-type="picture"
            name="file"
          >
            <el-button slot="trigger" size="small" type="primary">{{ $t('category_button_select_title') }}</el-button>
            <div slot="tip" class="el-upload__tip">{{ $t('category_button_select_tip') }}</div>
          </el-upload>
          <el-progress :text-inside="true" :stroke-width="18" :percentage="imageUploadPercent"
                       status="success" />
        </el-form-item>
        <el-form-item :label="$t('aggregation_customization_service_table_url_title')"
                      prop="targetUrl">
          <image-target-link :target-index="currentEditIndex"
                             :target-type="dialogValue.targetType"
                             :target-url="dialogValue.targetUrl"
                             :target-name="dialogValue.targetName"
                             @targetChanges="handleImageTargetChanges" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t('confirm_button_cancel_title') }}</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ $t('confirm_button_ok_title') }}
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { serviceType } from '@/utils/templateType'
  import ImageTargetLink from './imageTargetLink'

  export default {
    name: 'CustomService',
    components: { ImageTargetLink },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: 'aggregations'
        },
        dialogFormTitle: '',
        dialogFormVisible: false,
        dialogValue: {
          name: null,
          imageUrl: null,
          targetType: null,
          targetUrl: null,
          targetName: null
        },
        dialogRules: {
          targetUrl: [{
            required: true,
            message: this.$t('aggregation_customization_service_table_url_validation'),
            trigger: 'changed'
          }]
        },
        dialogImageFileList: [],
        formValue: {
          marginBottom: this.serviceInfo ? this.serviceInfo.settings.marginBottom : '0'
        },
        uploadingImage: false,
        imageUploadPercent: 0,
        isNewItem: false,
        currentEditIndex: -1
      }
    },
    computed: {
      ...mapGetters({
        pageTemplateList: 'currentAggregationContent',
        currentTemplateIndex: 'currentAggregationContentIndex'
      }),
      serviceInfo: {
        get() {
          if (this.pageTemplateList[this.currentTemplateIndex].type === serviceType) {
            return this.pageTemplateList[this.currentTemplateIndex].data
          } else {
            return {
              list: [],
              settings:
                {
                  marginBottom: '0'
                }
            }
          }
        }
      },
      serviceListLength: {
        get() {
          return this.serviceInfo.list.length
        }
      }
    },
    methods: {
      serviceIndex(index) {
        return index + 1
      },
      onMarginChanged(value) {
        this.$store.commit('setTemplateServiceSettings', value)
      },
      showImageDialog(add) {
        if (add) {
          this.isNewItem = true
          this.currentEditIndex = -1
          this.dialogValue.targetType = 'aggregation'
          this.dialogValue.targetName = null
          this.dialogValue.targetUrl = null
          this.dialogValue.imageUrl = null
          this.dialogValue.name = null
          this.dialogImageFileList = []
          this.dialogFormTitle = this.$t('aggregation_customization_service_add_title')
        } else {
          this.isNewItem = false
          this.dialogFormTitle = this.$t('aggregation_customization_service_edit_title')
        }
        this.imageUploadPercent = 0
        this.dialogFormVisible = true
      },
      handleCancel() {
        if (this.dialogImageFileList.length > 0) {
          this.$refs.uploadServiceIcon.clearFiles()
        }
        this.dialogFormVisible = false
      },
      handleSubmit() {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            if (this.dialogImageFileList.length > 0) {
              this.$refs.uploadServiceIcon.submit()
            } else {
              this.dialogFormVisible = false
              this.saveServiceContent()
            }
          } else {
            console.log('handleSubmit: validate failed')
          }
        })
      },
      handleSortUp(index) {
        this.$store.dispatch('sortAggregationServiceTemplate', { up: true, index: index }).then((newIndex) => {
          console.log('sortUpServiceTemplate' + newIndex)
        })
      },
      handleSortDown(index) {
        this.$store.dispatch('sortAggregationServiceTemplate', { up: false, index: index }).then((newIndex) => {
          console.log('sortDownServiceTemplate' + newIndex)
        })
      },
      handleEdit(index) {
        this.currentEditIndex = index
        this.dialogValue.name = this.serviceInfo.list[index].name
        this.dialogValue.imageUrl = this.serviceInfo.list[index].imageUrl
        this.dialogValue.targetType = this.serviceInfo.list[index].targetType
        this.dialogValue.targetUrl = this.serviceInfo.list[index].targetUrl
        this.dialogValue.targetName = this.serviceInfo.list[index].targetName
        this.dialogImageFileList = []
        this.showImageDialog(false)
      },
      handleDelete(index) {
        this.$store.commit('deleteItemInTemplateContent', index)
      },
      handleBeforeUploadImage(file) {
        this.uploadingImage = true
        return true
      },
      handleUploadImageSuccess(res) {
        this.dialogValue.imageUrl = this.$store.getters.cosUrl + res.data.url
        this.$refs.uploadServiceIcon.clearFiles()
        if (this.dialogFormVisible) {
          setTimeout(() => {
            this.dialogFormVisible = false
          }, 500)
        }
        this.saveServiceContent()
      },
      saveServiceContent() {
        if (this.isNewItem) {
          this.$store.commit('setListInTemplateContent', { index: -1, value: this.dialogValue })
        } else {
          this.$store.commit('setListInTemplateContent', { index: this.currentEditIndex, value: this.dialogValue })
        }
      },
      handleUploadImageError(res) {
        this.$refs.uploadServiceIcon.clearFiles()
        if (this.dialogFormVisible) {
          setTimeout(() => {
            this.dialogFormVisible = false
          }, 500)
        }
        this.uploadingImage = false
      },
      handleUploadImageProgress(event) {
        this.imageUploadPercent = event.percent
      },
      handleUploadImageChanged(file, fileList) {
        this.dialogImageFileList = fileList
      },
      handleImageTargetChanges(target) {
        if (target.hasOwnProperty('type')) {
          this.dialogValue.targetType = target.type
        }
        if (target.hasOwnProperty('name')) {
          this.dialogValue.targetName = target.name
        }
        if (target.hasOwnProperty('url')) {
          this.dialogValue.targetUrl = target.url
        }
      }
    }
  }
</script>

<style scoped>

</style>
