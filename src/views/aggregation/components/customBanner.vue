<template>
  <el-container>
    <el-header height="40px">
      <div style="float: right">
        <span>最多可添加10张</span>
        <el-button
          :disable="bannerListLength >= 10"
          type="primary"
          size="mini"
          @click="showImageDialog(true)"
        >
          添加轮播图
        </el-button>
      </div>
    </el-header>
    <el-main>
      <el-table :data="bannerInfo.list" style="width: 100%" border>
        <el-table-column
          :index="bannerIndex"
          type="index"
        />
        <el-table-column label="名称">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="缩略图">
          <template slot-scope="scope">
            <el-image v-if="scope.row.imageUrl" :src="scope.row.imageUrl" fit="contain" style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.$index === 0"
              type="warning"
              icon="el-icon-caret-top"
              size="mini"
              circle
              @click="handleSortUp(scope.$index)"
            />
            <el-button
              :disabled="scope.$index === bannerInfo.list.length - 1"
              type="warning"
              icon="el-icon-caret-bottom"
              size="mini"
              circle
              @click="handleSortDown(scope.$index)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              circle
              @click="handleEdit(scope.$index)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleDelete(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-form :model="formValue" label-width="80px" style="margin: 10px">
        <el-form-item label="下边距" prop="marginBottom">
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
        <el-form-item label="名称">
          <el-input v-model="dialogValue.name" />
        </el-form-item>
        <el-form-item label="缩略图" prop="imageUrl">
          <el-image v-if="dialogValue.imageUrl" :src="dialogValue.imageUrl" fit="contain" style="width: 100px" />
          <el-upload
            ref="upload"
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
            <el-button slot="trigger" size="small" type="primary">选择图标文件</el-button>
            <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
          </el-upload>
          <el-progress
            :text-inside="true"
            :stroke-width="18"
            :percentage="imageUploadPercent"
            status="success"
          />
        </el-form-item>
        <el-form-item
          label="图片链接"
          prop="targetUrl"
        >
          <image-target-link
            :target-index="currentEditIndex"
            :target-type="dialogValue.targetType"
            :target-url="dialogValue.targetUrl"
            :target-name="dialogValue.targetName"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { bannerType } from './templateType'
import ImageTargetLink from './imageTargetLink'
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'CustomBanner',
  components: { ImageTargetLink },
  data() {
    return {
      uploadUrl: app_upload_url,
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
          message: '请输入对应图片链接',
          trigger: 'changed'
        }]
      },
      dialogImageFileList: [],
      formValue: {
        marginBottom: this.bannerInfo ? this.bannerInfo.settings.marginBottom : '0'
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
    bannerInfo: {
      get() {
        if (this.pageTemplateList[this.currentTemplateIndex].type === bannerType) {
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
    bannerListLength: {
      get() {
        return this.bannerInfo.list.length
      }
    }
  },
  methods: {
    bannerIndex(index) {
      return index + 1
    },
    onMarginChanged(value) {
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', { marginBottom: value })
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
        this.dialogFormTitle = '添加轮播图'
      } else {
        this.isNewItem = false
        this.dialogFormTitle = '编辑轮播图'
      }
      this.imageUploadPercent = 0
      this.dialogFormVisible = true
    },
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (this.dialogImageFileList.length > 0) {
            this.$refs.upload.submit()
          } else {
            this.dialogFormVisible = false
            this.saveBannerContent()
          }
        } else {
          console.log('handleSubmit: validate failed')
        }
      })
    },
    handleSortUp(index) {
      this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: true, index: index })
    },
    handleSortDown(index) {
      this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: false, index: index })
    },
    handleEdit(index) {
      this.currentEditIndex = index
      this.dialogValue.name = this.bannerInfo.list[index].name
      this.dialogValue.imageUrl = this.bannerInfo.list[index].imageUrl
      this.dialogValue.targetType = this.bannerInfo.list[index].targetType
      this.dialogValue.targetUrl = this.bannerInfo.list[index].targetUrl
      this.dialogValue.targetName = this.bannerInfo.list[index].targetName
      this.dialogImageFileList = []
      this.showImageDialog(false)
    },
    handleDelete(index) {
      this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
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
      this.saveBannerContent()
    },
    saveBannerContent() {
      if (this.isNewItem) {
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT',
          { index: -1, value: this.dialogValue })
      } else {
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT',
          { index: this.currentEditIndex, value: this.dialogValue })
      }
    },
    handleUploadImageError(res) {
      if (this.dialogFormVisible) {
        setTimeout(() => {
          this.dialogFormVisible = false
        }, 500)
        this.$refs.upload.clearFiles()
      }
      this.$message.error('上传图片文件失败，请联系管理员')
      this.uploadingImage = false
    },
    handleUploadImageProgress(event) {
      this.imageUploadPercent = event.percent
    },
    handleUploadImageChanged(file, fileList) {
      this.dialogImageFileList = fileList
    },
    handleImageTargetChanges(target) {
      if ('type' in target) {
        this.dialogValue.targetType = target.type
      }
      if ('name' in target) {
        this.dialogValue.targetName = target.name
      }
      if ('url' in target) {
        this.dialogValue.targetUrl = target.url
      }
    }
  }
}
</script>

