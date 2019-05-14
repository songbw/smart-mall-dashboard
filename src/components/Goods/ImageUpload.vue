<template>
  <div>
    <el-image v-if="imageUrl" :src="imageUrl" :style="imageClass" fit="contain" lazy />
    <el-upload
      ref="imageUpload"
      v-if="!viewOnly"
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
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传图片</el-button>
      <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
    </el-upload>
    <el-progress v-if="uploadingImage" :text-inside="true" :stroke-width="18" :percentage="imageUploadPercent"
                 status="success" />
  </div>
</template>

<script>
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
      }
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
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
        this.$emit('urlChanged', imageUrl)
      },
      handleUploadImageError(res) {
        this.$message.error('上传图片文件失败，请联系管理员')
        this.$refs.imageUpload.clearFiles()
        this.uploadingImage = false
      },
      handleUploadImageProgress(event) {
        this.imageUploadPercent = event.percent
      },
      handleUploadImageChanged(file, fileList) {
        this.imageFileList = fileList
      },
      submitUpload() {
        this.$refs.imageUpload.submit()
      }
    }
  }
</script>

<style scoped>

</style>
