<template>
  <el-card :body-style="{ padding: '0px' }">
    <el-image :src="imageUrl" class="image" fit="contain" lazy />
    <div style="padding: 14px;">
      <el-upload
        ref="thumbnailUpload"
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
        <el-button slot="trigger"
                   type="primary" icon="el-icon-edit">
          {{ $t('product_detail_thumbnail_select_title', {index: index + 1}) }}
        </el-button>
      </el-upload>
      <el-button-group>
        <el-button size="mini" type="danger" icon="el-icon-delete"
                   @click="handleDeleteThumbnail(index)" />
        <el-button :disabled="index === 0"
                   size="mini" type="primary" icon="el-icon-arrow-left"
                   @click="handleSortThumbnail(index, true)" />
        <el-button :disabled="index === length - 1"
                   size="mini" type="primary"
                   icon="el-icon-arrow-right" @click="handleSortThumbnail(index, false)" />
      </el-button-group>
    </div>
  </el-card>
</template>

<script>
  export default {
    name: 'CustomThumbnail',
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
      handleSortThumbnail(index, left) {
        this.$emit('sortThumbnail', { index: index, left: left })
      },
      handleDeleteThumbnail(index) {
        this.$confirm(this.$t('product_thumbnail_delete_message'),
          this.$t('confirm_dialog_warning_title'),
          {
            confirmButtonText: this.$t('confirm_button_del_title'),
            cancelButtonText: this.$t('confirm_button_cancel_title'),
            type: 'warning'
          }).then(() => {
          this.$emit('deleteThumbnail', this.index)
        }).catch(() => {
        })
      },
      handleUploadSuccess(res) {
        console.log('handleUploadThumbnailSuccess:' + res.data.url)
        this.$refs.thumbnailUpload.clearFiles()
        this.$emit('uploadSuccess', { index: this.index, url: res.data.url })
      },
      handleBeforeUpload(file) {
        this.$emit('beforeUpload', file)
      },
      handleUploadError(err) {
        this.$refs.thumbnailUpload.clearFiles()
        this.$emit('uploadError', err)
      },
      handleUploadProgress(event) {
        this.$emit('uploadProgress', event)
      }
    }
  }
</script>

<style scoped>
  .image {
    width: 100%;
  }
</style>
