<template>
  <div>
    <el-image v-if="imageUrl" :src="imageUrl" :style="imageClass" fit="contain" lazy />
    <el-upload
      v-if="!viewOnly"
      ref="imageUpload"
      :action="uploadUrl"
      :data="uploadData"
      :auto-upload="autoUpload"
      :multiple="false"
      :limit="1"
      :before-upload="handleBeforeUploadImage"
      :on-success="handleUploadImageSuccess"
      :on-error="handleUploadImageError"
      :on-progress="handleUploadImageProgress"
      :on-change="handleUploadImageChanged"
      accept="image/png, image/jpeg, image/jpg"
      list-type="picture"
      name="file"
    >
      <el-button
        slot="trigger"
        size="small"
        type="primary"
        icon="el-icon-picture"
      >
        选择图片
      </el-button>
      <el-button
        v-if="!autoUpload"
        style="margin-left: 10px;"
        size="small"
        type="success"
        icon="el-icon-upload"
        @click="submitUpload"
      >
        开始上传
      </el-button>
      <div slot="tip" class="el-upload__tip">{{ tip }}</div>
    </el-upload>
    <el-progress
      v-if="uploadingImage"
      :text-inside="true"
      :stroke-width="18"
      :percentage="imageUploadPercent"
      status="success"
    />
  </div>
</template>

<script>
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'ImageUpload',
  props: {
    pathName: {
      type: String,
      default: 'goods'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageWidth: {
      type: String,
      default: '100%'
    },
    viewOnly: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    tip: {
      type: String,
      default() {
        return '建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片'
      }
    }
  },
  data() {
    return {
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: this.pathName
      },
      uploadingImage: false,
      imageUploadPercent: 0,
      imageFileList: []
    }
  },
  computed: {
    imageClass: {
      get() {
        return {
          width: this.imageWidth
        }
      }
    }
  },
  methods: {
    handleBeforeUploadImage(file) {
      this.uploadingImage = true
      return true
    },
    handleUploadImageSuccess(res) {
      const imageUrl = this.$store.getters.cosUrl + res.data.url
      this.uploadingImage = false
      this.$refs.imageUpload.clearFiles()
      this.$emit('success', imageUrl)
    },
    handleUploadImageError(res) {
      this.$message.error('上传图片文件失败，请联系管理员')
      this.$refs.imageUpload.clearFiles()
      this.uploadingImage = false
      this.$emit('failed')
    },
    handleUploadImageProgress(event) {
      this.imageUploadPercent = event.percent
    },
    handleUploadImageChanged(file, fileList) {
      this.imageFileList = fileList
    },
    submitUpload() {
      if (this.imageFileList.length > 0) {
        this.$refs.imageUpload.submit()
      } else {
        this.$message.warning('请选择对应的图片文件！')
      }
    }
  }
}
</script>
