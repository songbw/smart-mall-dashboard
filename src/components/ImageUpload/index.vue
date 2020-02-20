<template>
  <div>
    <img v-if="imageUrl" :src="imageUrl" class="thumb-image" :style="imageClass">
    <div v-if="!viewOnly">
      <input
        :ref="refName"
        type="file"
        accept=".png, .jpeg, .jpg"
        style="z-index: -9999;display: none"
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
      <span v-if="tip && tip.length > 0" style="margin-left: 10px;font-size: 12px">
        <i class="el-icon-warning-outline">{{ tip }}</i>
      </span>
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
import { max_upload_image_size } from '@/utils/constants'

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
      if (rawFile.size >= max_upload_image_size) {
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
  .thumb-image {
    object-fit: contain;
    width: 100%;
    height: 100%
  }
</style>
