<template>
  <el-card :body-style="{ padding: '0px' }" style="min-width: 180px">
    <el-image :src="imageUrl" class="image" fit="contain" />
    <div v-if="couldEdit" style="display: flex;flex-direction: column;align-items: center">
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
        accept="image/png, image/jpeg, image/jpg"
        list-type="picture"
        name="file"
      >
        <el-button
          slot="trigger"
          type="primary"
          icon="el-icon-edit"
        >
          {{ `修改主图 ${index + 1}` }}
        </el-button>
      </el-upload>
      <el-button-group style="margin: 3px 0">
        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click="handleDeleteThumbnail(index)"
        />
        <el-button
          :disabled="index === 0"
          size="mini"
          type="primary"
          icon="el-icon-arrow-left"
          @click="handleSortThumbnail(index, true)"
        />
        <el-button
          :disabled="index === length - 1"
          size="mini"
          type="primary"
          icon="el-icon-arrow-right"
          @click="handleSortThumbnail(index, false)"
        />
      </el-button-group>
    </div>
  </el-card>
</template>

<script>
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'CustomThumbnail',
  props: {
    couldEdit: {
      type: Boolean,
      default: false
    },
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
      uploadUrl: app_upload_url,
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
      this.$confirm('将会删除此产品主图！请确认是否继续此操作？', '警告', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
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
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        this.$message.warning('上传的图片大小超过1M，请裁剪或者优化图片，重新上传！')
        return false
      }
      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (imageTypes.includes(file.type) === false) {
        this.$message.warning('请选择正确的文件类型！')
        return false
      }
      return true
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
