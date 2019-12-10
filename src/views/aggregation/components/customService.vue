<template>
  <el-container>
    <el-header height="40px">
      <div style="float: right">
        <span>最多可添加20种服务类型入口</span>
        <el-button
          :disable="serviceListLength >= 20"
          type="primary"
          size="mini"
          @click="showImageDialog(true)"
        >
          添加模块
        </el-button>
      </div>
    </el-header>
    <el-main>
      <el-table :data="serviceInfo.list" style="width: 100%" border>
        <el-table-column
          :index="serviceIndex"
          type="index"
        />
        <el-table-column label="名称">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="缩略图">
          <template slot-scope="scope">
            <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" width="50px">
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
              :disabled="scope.$index === serviceInfo.list.length - 1"
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
      <el-form label-width="80px" style="margin: 10px">
        <el-form-item label="下边距">
          <el-select :value="serviceMarginBottom" @change="onMarginChanged">
            <el-option label="0px" value="0" />
            <el-option label="10px" value="10" />
            <el-option label="20px" value="20" />
            <el-option label="30px" value="30" />
            <el-option label="40px" value="40" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-main>
    <el-dialog
      :title="dialogFormTitle"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form ref="ruleForm" :model="dialogValue" :rules="dialogRules" label-width="6rem">
        <el-form-item label="名称">
          <el-input v-model="dialogValue.name" />
        </el-form-item>
        <el-form-item label="缩略图" prop="imageUrl">
          <image-upload
            :image-url="dialogValue.imageUrl"
            path-name="aggregations"
            image-width="100px"
            @success="handleUploadImageSuccess"
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
            :app-id="pageAppId"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import ImageUpload from '@/components/ImageUpload'
import { serviceType } from './templateType'
import ImageTargetLink from './imageTargetLink'

export default {
  name: 'CustomService',
  components: { ImageUpload, ImageTargetLink },
  data() {
    return {
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
      isNewItem: false,
      currentEditIndex: -1
    }
  },
  computed: {
    ...mapGetters({
      pageInfo: 'currentAggregation',
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    pageAppId() {
      return this.pageInfo.appId
    },
    serviceInfo: {
      get() {
        if (this.pageTemplateList[this.currentTemplateIndex].type === serviceType) {
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
    serviceListLength: {
      get() {
        return this.serviceInfo.list.length
      }
    },
    serviceMarginBottom() {
      return this.serviceInfo ? this.serviceInfo.settings.marginBottom : '0'
    }
  },
  methods: {
    serviceIndex(index) {
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
        this.dialogFormTitle = '添加服务入口图'
      } else {
        this.isNewItem = false
        this.dialogFormTitle = '编辑服务入口图'
      }
      this.dialogFormVisible = true
    },
    handleCancel() {
      this.$refs.ruleForm.clearValidate()
      this.dialogFormVisible = false
    },
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.dialogFormVisible = false
          this.saveServiceContent()
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
      this.dialogValue.name = this.serviceInfo.list[index].name
      this.dialogValue.imageUrl = this.serviceInfo.list[index].imageUrl
      this.dialogValue.targetType = this.serviceInfo.list[index].targetType
      this.dialogValue.targetUrl = this.serviceInfo.list[index].targetUrl
      this.dialogValue.targetName = this.serviceInfo.list[index].targetName
      this.showImageDialog(false)
    },
    async handleDelete(index) {
      try {
        await this.$confirm('是否要删除此服务入口？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete service error: ' + e)
      }
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.imageUrl = url
    },
    saveServiceContent() {
      if (this.isNewItem) {
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT', { index: -1, value: this.dialogValue })
      } else {
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT', {
          index: this.currentEditIndex,
          value: this.dialogValue
        })
      }
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

<style scoped>

</style>
