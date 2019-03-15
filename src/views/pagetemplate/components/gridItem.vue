<template>
  <div style="width: 100%;height: 100%">
    <el-row :gutter="0" class="show-border">
      <el-col v-for="(item, index) in gridInfo.grids" :key="index" :span="colSpan">
        <el-card shadow="hover" class="box-card" body-style="{ padding: '0px' }">
          <img v-if="item.imageUrl" :src="item.imageUrl" class="card-image">
          <img v-else :src="placeholderUrl" class="card-image">
          <el-button icon="el-icon-upload" size="mini" class="bottom-button"
                     @click="handleUploadImage(index)">
            {{ item.imageUrl ? $t('confirm_button_edit_title') : $t('confirm_button_upload_image_title') }}
          </el-button>
        </el-card>
      </el-col>
      <el-col v-if="gridCount === 3" :span="2">
        <span>&nbsp;</span>
      </el-col>
      <el-col :span="4">
        <div class="ops-container">
          <el-select v-model="gridCount">
            <el-option
              v-for="o in gridOptions"
              :key="o.label"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
          <el-button style="margin-top: 10px" @click.prevent="$emit('onRemove', gridIndex)">
            {{ $t('confirm_button_delete_line_title') }}
          </el-button>
        </div>
      </el-col>
    </el-row>
    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm" :model="dialogValue" label-position="left" label-width="80px">
        <el-form-item :label="$t('aggregation_customization_banner_table_image_title')">
          <img v-if="dialogValue.imageUrl" :src="dialogValue.imageUrl" width="100px">
          <el-upload
            ref="upload"
            :action="uploadUrl"
            :data="uploadData"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUploadImage"
            :on-success="handleUploadImageSuccess"
            :on-error="handleUploadImageError"
            :on-change="handleUploadImageChanged"
            list-type="picture"
            name="file"
          >
            <el-button slot="trigger" size="small" type="primary">{{ $t('category_button_select_title') }}</el-button>
            <div slot="tip" class="el-upload__tip">{{ uploadTips }}</div>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('aggregation_customization_banner_table_url_title')"
                      :rules="[
                        { required: true, message: this.$t('aggregation_customization_banner_table_url_validation'), trigger: 'change' }
                      ]"
                      prop="targetUrl">
          <image-target-link :target-index="currentEditIndex"
                             :target-type="dialogValue.targetType"
                             :target-url="dialogValue.targetUrl"
                             :target-name="dialogValue.targetName"
                             @targetChanges="handleImageTargetChanges" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('confirm_button_cancel_title') }}</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ $t('confirm_button_ok_title') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import ImageTargetLink from './imageTargetLink'

  const placeholder = require('@/assets/images/placeholder-150x150.png')
  export default {
    name: 'GridItem',
    components: { ImageTargetLink },
    props: {
      gridInfo: {
        type: Object,
        default: function () {
          return {
            count: 1,
            grids: [
              { imageUrl: null, targetUrl: null, targetName: null, targetType: null }
            ]
          }
        }
      },
      gridIndex: {
        type: Number,
        default: -1
      }
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: 'aggregations'
        },
        uploadingImage: false,
        dialogFormTitle: '',
        dialogFormVisible: false,
        dialogValue: {
          imageUrl: null,
          targetType: null,
          targetUrl: null,
          targetName: null
        },
        dialogImageFileList: [],
        currentEditIndex: -1,
        placeholderUrl: placeholder,
        gridOptions: [
          {
            value: 1,
            label: this.$t('aggregation_customization_grid_list_count', { count: 1 })
          },
          {
            value: 2,
            label: this.$t('aggregation_customization_grid_list_count', { count: 2 })
          },
          {
            value: 3,
            label: this.$t('aggregation_customization_grid_list_count', { count: 3 })
          },
          {
            value: 4,
            label: this.$t('aggregation_customization_grid_list_count', { count: 4 })
          },
          {
            value: 5,
            label: this.$t('aggregation_customization_grid_list_count', { count: 5 })
          }
        ]
      }
    },
    computed: {
      uploadTips: {
        get() {
          switch (this.gridInfo.count) {
            case 1:
              return '建议上传宽1095px，不超过500k，格式为jpg、png的图片'
            case 2:
              return '建议上传宽540px，不超过500k，格式为jpg、png的图片'
            case 3:
              return '建议上传宽360px，不超过500k，格式为jpg、png的图片'
            case 4:
              return '建议上传宽272px，不超过500k，格式为jpg、png的图片'
            case 5:
              return '建议上传宽219px，不超过500k，格式为jpg、png的图片'
            default:
              return ''
          }
        }
      },
      gridCount: {
        get() {
          return this.gridInfo.count
        },
        set(newValue) {
          this.$emit('gridCountChanged', this.gridIndex, newValue)
        }
      },
      colSpan: {
        get() {
          return Math.floor(20 / this.gridCount)
        }
      }
    },
    methods: {
      handleUploadImage(index) {
        this.currentEditIndex = index
        this.dialogValue.imageUrl = this.gridInfo.grids[index].imageUrl
        this.dialogValue.targetUrl = this.gridInfo.grids[index].targetUrl
        this.dialogValue.targetName = this.gridInfo.grids[index].targetName
        this.dialogValue.targetType = this.gridInfo.grids[index].targetType
        this.dialogImageFileList = []
        this.dialogFormVisible = true
        this.dialogFormTitle =
          this.gridInfo.grids[index].imageUrl
            ? this.$t('aggregation_customization_grid_edit_image_title') : this.$t('aggregation_customization_grid_add_image_title')
      },
      handleSubmit() {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            if (this.dialogImageFileList.length > 0) {
              this.$refs.upload.submit()
            } else {
              this.dialogFormVisible = false
              this.saveGridItemContent()
            }
          }
        })
      },
      handleBeforeUploadImage(file) {
        this.uploadingImage = true
        return true
      },
      handleUploadImageSuccess(res) {
        this.dialogValue.imageUrl = this.$store.getters.cosUrl + res.data.url
        if (this.dialogFormVisible) {
          setTimeout(() => {
            this.dialogFormVisible = false
          }, 500)
          this.$refs.upload.clearFiles()
        }

        this.saveGridItemContent()
      },
      saveGridItemContent() {
        this.$emit('gridImageChanged', this.gridIndex, { index: this.currentEditIndex, value: this.dialogValue })
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
        this.saveGridItemContent()
      }
    }
  }
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
  }

  .box-card {
    width: 130px;
    max-width: 100%;
    height: 150px;
    max-height: 150px;
    margin: 10px auto;
    padding: 0;
    position: relative;
  }

  .card-image {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
  }

  .bottom-button {
    position: absolute;
    bottom: 0;
    margin: 5px auto;
  }

  .ops-container {
    height: 150px;
    margin: auto 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

</style>
