<template>
  <el-row :gutter="20" style="border: 1px solid #99a9bf;">
    <el-col :span="14">
      <el-image :src="imageUrl" width="100%" style="margin: 10px" fit="contain" lazy />
    </el-col>
    <el-col :span="10">
      <div style="padding: 14px;">
        <el-upload
          ref="introductionUpload"
          :action="uploadUrl"
          :data="uploadData"
          :auto-upload="true"
          :limit="1"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-progress="handleUploadProgress"
          list-type="picture"
          name="file">
          <el-button slot="trigger" size="small" type="primary">
            {{ $t('product_detail_introduction_select_title', {index: index + 1}) }}
          </el-button>
        </el-upload>
        <el-button-group>
          <el-button size="mini" type="danger" icon="el-icon-delete"
                     @click="handleDeleteIntroduction(index)" />
          <el-button :disabled="index === 0"
                     size="mini" type="primary" icon="el-icon-arrow-up"
                     @click="handleSortIntroduction(index, true)" />
          <el-button :disabled="index === length - 1"
                     size="mini" type="primary"
                     icon="el-icon-arrow-down" @click="handleSortIntroduction(index, false)" />
        </el-button-group>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    name: 'CustomIntroduction',
    props: {
      imageUrl: {
        type: String,
        default: ''
      },
      bucket: {
        type: String,
        default: ''
      },
      index: {
        type: Number,
        default: -1
      },
      length: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: this.bucket
        }
      }
    },
    methods: {
      handleSortIntroduction(index, up) {
        this.$emit('sortIntroduction', { index: index, up: up })
      },
      handleDeleteIntroduction(index) {
        this.$confirm(this.$t('product_introduction_delete_message'),
          this.$t('confirm_dialog_warning_title'),
          {
            confirmButtonText: this.$t('confirm_button_del_title'),
            cancelButtonText: this.$t('confirm_button_cancel_title'),
            type: 'warning'
          }).then(() => {
          this.$emit('deleteIntroduction', this.index)
        }).catch(() => {
        })
      },
      handleUploadSuccess(res) {
        this.$refs.introductionUpload.clearFiles()
        this.$emit('uploadSuccess', { index: this.index, url: res.data.url })
      },
      handleBeforeUpload(file) {
        this.$emit('beforeUpload', file)
      },
      handleUploadError(err) {
        this.$refs.introductionUpload.clearFiles()
        this.$emit('uploadError', err)
      },
      handleUploadProgress(event) {
        this.$emit('uploadProgress', event)
      }
    }
  }
</script>

<style scoped>

</style>
