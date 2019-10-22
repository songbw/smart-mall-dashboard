<template>
  <el-row :gutter="20" style="border: 1px solid #99a9bf;">
    <el-col :span="18">
      <el-image :src="imageUrl" width="100%" style="margin: 10px" fit="contain" />
    </el-col>
    <el-col :span="6">
      <div v-if="couldEdit" style="padding: 14px;">
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
          accept="image/png, image/jpeg, image/jpg"
          list-type="picture"
          name="file"
        >
          <el-button slot="trigger" size="small" type="primary">
            {{ `修改详情图 ${index + 1}` }}
          </el-button>
        </el-upload>
        <el-button-group>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDeleteIntroduction(index)"
          />
          <el-button
            :disabled="index === 0"
            size="mini"
            type="primary"
            icon="el-icon-arrow-up"
            @click="handleSortIntroduction(index, true)"
          />
          <el-button
            :disabled="index === length - 1"
            size="mini"
            type="primary"
            icon="el-icon-arrow-down"
            @click="handleSortIntroduction(index, false)"
          />
        </el-button-group>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'CustomIntroduction',
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
    handleSortIntroduction(index, up) {
      this.$emit('sortIntroduction', { index: index, up: up })
    },
    handleDeleteIntroduction(index) {
      this.$confirm('将会删除此产品详情图！请确认是否继续此操作？', '警告', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
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
      this.$refs.introductionUpload.clearFiles()
      this.$emit('uploadError', err)
    },
    handleUploadProgress(event) {
      this.$emit('uploadProgress', event)
    }
  }
}
</script>
