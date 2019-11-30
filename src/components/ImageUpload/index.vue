<template>
  <div>
    <el-image v-if="imageUrl" :src="imageUrl" :style="imageClass" fit="contain" />
    <div>
      <input
        :ref="refName"
        class="image-upload-input"
        type="file"
        accept=".png, .jpeg, .jpg"
        @change="handleFileChange"
      >
      <el-button
        :size="buttonSize"
        :loading="uploadingImage"
        type="primary"
        icon="el-icon-picture"
        @click="handleSelect"
      >
        {{ buttonName }}
      </el-button>
    </div>
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
import moment from 'moment'
import { cosUploadFile } from '@/utils/cos'

const generate = require('nanoid/generate')

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
    buttonSize: {
      type: String,
      default: 'small'
    },
    tip: {
      type: String,
      default() {
        return '建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片'
      }
    },
    buttonName: {
      type: String,
      default: '选择图片'
    }
  },
  data() {
    return {
      refName: '',
      uploadingImage: false,
      imageUploadPercent: 0
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
  created() {
    const noLookalikes = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    this.refName = 'image-input-' + generate(noLookalikes, 8)
  },
  methods: {
    handleFileChange(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      if (rawFile.size >= 1024 * 1024) {
        this.$message.warning('上传的图片大小超过1M，请裁剪或者优化图片，重新上传！')
        return
      }
      const mimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (mimeTypes.includes(rawFile.type) === false) {
        this.$message.warning('请选择正确的文件格式')
        return
      }
      this.uploadingImage = true
      this.$refs[this.refName].value = null // fix can't select the same excel
      const type = rawFile.type === 'image/png' ? '.png' : '.jpg'
      const filename = moment().valueOf() + type
      cosUploadFile(
        this.pathName + '/' + filename,
        rawFile,
        info => this.handleUploadImageProgress(info),
        (err, data, options) => this.handleUploadImageFinish(err, data, options)
      )
    },
    handleSelect() {
      this.$refs[this.refName].click()
    },
    handleUploadImageSuccess(key) {
      const imageUrl = this.$store.getters.cosUrl + '/' + key
      this.$emit('success', imageUrl)
    },
    handleUploadImageError() {
      this.$message.error('上传图片文件失败，请联系管理员')
      this.$emit('failed')
    },
    handleUploadImageFinish(err, data, options) {
      this.uploadingImage = false
      if (err) {
        this.handleUploadImageError()
      } else {
        this.handleUploadImageSuccess(options.Key)
      }
    },
    handleUploadImageProgress(info) {
      this.imageUploadPercent = info.percent
    }
  }
}
</script>

<style scoped>
  .image-upload-input {
    display: none;
    z-index: -9999;
  }
</style>
