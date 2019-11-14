<template>
  <div>
    <el-form
      ref="ruleForm"
      v-loading="creatingPage"
      :model="pageForm"
      :rules="formRules"
      label-position="right"
      label-width="120px"
      status-icon
    >
      <el-form-item label="页面名称" prop="name">
        <el-input v-model="pageName" />
      </el-form-item>
      <el-form-item v-if="hasHomePermission" label="主页设置" prop="homePage">
        <el-switch v-model="homePage" />
      </el-form-item>
      <el-form-item label="背景色" prop="backgroundColor">
        <el-color-picker v-model="pageColor" />
        <el-tag>{{ pageColor }}</el-tag>
      </el-form-item>
      <el-form-item label="显示搜索栏">
        <el-switch v-model="showSearchBar" />
      </el-form-item>
      <el-form-item label="头部背景色">
        <el-color-picker v-model="headerColor" />
        <el-tag>{{ headerColor }}</el-tag>
      </el-form-item>
      <el-form-item v-if="homePage" label="新人礼包图">
        <image-upload
          :image-url="novicePackUrl"
          path-name="aggregations"
          image-width="150px"
          tip="可选项，新人礼包宣传背景图，文件格式为JPG或PNG"
          @success="handleUploadImageSuccess"
        />
      </el-form-item>
      <el-form-item label="聚合页组">
        <span>{{ groupName }}</span>
        <el-button
          v-if="aggregationGroups.length > 0"
          type="warning"
          icon="el-icon-edit"
          size="mini"
          style="margin-left: 10px"
          @click="handleChangeGroup"
        >
          更改组
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">{{ submitBtnLabel }}</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="选择聚合页组"
      :visible.sync="groupDialogVisible"
      width="50%"
    >
      <el-radio-group v-model="groupSelectId" size="small">
        <el-radio
          v-for="group in aggregationGroups"
          :key="group.name"
          :label="group.id.toString()"
          border
          style="margin: 2px"
        >
          {{ group.name }}
        </el-radio>
      </el-radio-group>
      <div slot="footer">
        <el-button @click="handleCancelChange">取消</el-button>
        <el-button type="primary" @click="handleConfirmChange">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import { searchAggregationsApi } from '@/api/aggregations'
import ImageUpload from '@/components/ImageUpload'
import { AggregationPermissions } from '@/utils/role-permissions'
import { aggregation_on_sale_status } from '../constants'

export default {
  name: 'CreationForm',
  components: { ImageUpload },
  data() {
    return {
      creatingPage: false,
      pageForm: {
        name: null,
        homePage: null,
        backgroundColor: null,
        header: null,
        groupId: null
      },
      groupDialogVisible: false,
      groupSelectId: null,
      formRules: {
        name: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(this.pageName)) {
              callback(new Error('请输入有效的名称'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      pageInfo: 'currentAggregation',
      aggregationGroups: 'aggregationGroups',
      groupId: 'aggregationGroupId'
    }),
    hasHomePermission() {
      return this.userPermissions.includes(AggregationPermissions.home)
    },
    hasEditPermission() {
      return this.userPermissions.includes(AggregationPermissions.update)
    },
    pageName: {
      get() {
        return this.pageInfo.name
      },
      set(newValue) {
        this.$store.commit('aggregations/SET_CURRENT_DATA', { name: newValue })
        this.pageForm.name = newValue
      }
    },
    homePage: {
      get() {
        return this.pageInfo.homePage
      },
      set(newValue) {
        this.$store.commit('aggregations/SET_CURRENT_DATA', { homePage: newValue })
        this.pageForm.homePage = newValue
      }
    },
    pageDate: {
      get() {
        return this.pageInfo.effectiveDate
      },
      set(newValue) {
        this.$store.commit('aggregations/SET_CURRENT_DATA', { effectiveDate: newValue })
        this.pageForm.effectiveDate = newValue
      }
    },
    pageColor: {
      get() {
        return this.pageInfo.backgroundColor
      },
      set(newValue) {
        this.$store.commit('aggregations/SET_CURRENT_DATA', { backgroundColor: newValue })
        this.pageForm.backgroundColor = newValue
      }
    },
    headerColor: {
      get() {
        if (isEmpty(this.pageInfo.header)) {
          return null
        } else {
          const header = JSON.parse(this.pageInfo.header)
          if ('backgroundColor' in header) {
            return header.backgroundColor
          } else {
            return null
          }
        }
      },
      set(newValue) {
        const header = {
          showSearchBar: this.showSearchBar,
          backgroundColor: newValue,
          novicePackUrl: this.novicePackUrl
        }
        const headerStr = JSON.stringify(header)
        this.$store.commit('aggregations/SET_CURRENT_DATA', { header: headerStr })
        this.pageForm.header = headerStr
      }
    },
    showSearchBar: {
      get() {
        if (isEmpty(this.pageInfo.header)) {
          return false
        } else {
          const header = JSON.parse(this.pageInfo.header)
          if ('showSearchBar' in header) {
            return header.showSearchBar
          } else {
            return false
          }
        }
      },
      set(newValue) {
        const header = {
          showSearchBar: newValue,
          backgroundColor: this.headerColor,
          novicePackUrl: this.novicePackUrl
        }
        const headerStr = JSON.stringify(header)
        this.$store.commit('aggregations/SET_CURRENT_DATA', { header: headerStr })
        this.pageForm.header = headerStr
      }
    },
    novicePackUrl: {
      get() {
        if (isEmpty(this.pageInfo.header)) {
          return null
        } else {
          const header = JSON.parse(this.pageInfo.header)
          if ('novicePackUrl' in header) {
            return header.novicePackUrl
          } else {
            return null
          }
        }
      },
      set(newValue) {
        const header = {
          showSearchBar: this.showSearchBar,
          backgroundColor: this.headerColor,
          novicePackUrl: newValue
        }
        const headerStr = JSON.stringify(header)
        this.$store.commit('aggregations/SET_CURRENT_DATA', { header: headerStr })
        this.pageForm.header = headerStr
      }
    },
    groupName: {
      get() {
        const id = this.pageInfo.groupId
        if (id === null || id <= 0) {
          return '未分组'
        } else {
          const data = this.aggregationGroups.find(group => group.id === id)
          if (data) {
            return data.name
          } else {
            return '组未找到'
          }
        }
      }
    },
    submitBtnLabel: {
      get() {
        return this.pageInfo.id === -1 ? '保存并创建' : '保存并修改'
      }
    }
  },
  methods: {
    createPage() {
      this.creatingPage = true
      const now = moment().format('YYYY-MM-DD')
      const params = {}
      params.effectiveDate = now
      Object.keys(this.pageForm).forEach(key => {
        params[key] = this.pageInfo[key]
      })
      if (isEmpty(params.header)) {
        const header = {
          showSearchBar: false,
          backgroundColor: null
        }
        params.header = JSON.stringify(header)
      }
      if (params.groupId === -1) {
        params.groupId = 0
      }
      this.$store.dispatch('aggregations/createPage', params).then((id) => {
        this.$emit('createPage', id)
      }).catch(err => {
        this.$message(err)
      }).finally(() => {
        this.creatingPage = false
      })
    },
    getChangedParams() {
      let changed = false
      const params = {}
      Object.keys(this.pageForm).forEach(key => {
        if (this.pageForm[key] !== null) {
          params[key] = this.pageForm[key]
          changed = true
        }
      })
      if (changed) {
        return params
      } else {
        return null
      }
    },
    async checkHomePage(params) {
      if (this.pageInfo.status !== aggregation_on_sale_status) {
        return true
      }
      if ('homePage' in params && params.homePage === false) {
        try {
          const res = await searchAggregationsApi({ homePage: true, offset: 1, limit: 1, status: 1 })
          const data = res.data.result
          if (data.total <= 1) {
            await this.$alert('此聚合页模板为唯一主页模板，请先选择打开其它聚合页的主页选择。', '警告', {
              confirmButtonText: '确定'
            })
            return false
          } else {
            return true
          }
        } catch (e) {
          console.warn('checkHomePage:' + e)
          return false
        }
      } else {
        return true
      }
    },
    async updatePage() {
      const pageID = this.pageInfo.id
      const updatedParams = this.getChangedParams()
      if (updatedParams !== null) {
        const pass = await this.checkHomePage(updatedParams)
        if (pass) {
          try {
            await this.$confirm('保存此次修改，并开始下一步，是否继续？', '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
            this.creatingPage = true
            const params = { id: pageID, ...updatedParams }
            this.$store.dispatch('aggregations/updatePage', params).then(() => {
              this.$emit('createPage', pageID)
            }).catch(err => {
              console.warn('Update aggregation error:' + err)
              this.$message.error('保存聚合页失败，请稍后重试！')
            }).finally(() => {
              this.creatingPage = false
            })
          } catch (_) {
            console.warn('Cancel update aggregation page')
          }
        }
      } else {
        this.$emit('createPage', pageID)
        this.creatingPage = false
      }
    },
    onCancel() {
      this.$emit('cancelCreation')
    },
    onSubmit() {
      if (this.hasEditPermission) {
        const pageID = this.pageInfo.id
        this.$refs.ruleForm.validate(async(valid) => {
          if (valid) {
            if (pageID === -1) {
              this.createPage()
            } else {
              this.updatePage()
            }
          }
        })
      } else {
        this.$message.warning('没有创建或修改聚合页权限，请联系管理员！')
      }
    },
    handleChangeGroup() {
      if (this.pageInfo.groupId > 0) {
        this.groupSelectId = this.pageInfo.groupId.toString()
      } else if (this.groupId > 0) {
        this.groupSelectId = this.groupId.toString()
      } else if (this.aggregationGroups.length > 0) {
        this.groupSelectId = this.aggregationGroups[0].id.toString()
      }
      this.groupDialogVisible = true
    },
    handleCancelChange() {
      this.groupDialogVisible = false
      this.groupSelectId = null
    },
    handleConfirmChange() {
      this.groupDialogVisible = false
      this.pageForm.groupId = Number.parseInt(this.groupSelectId)
      this.$store.commit('aggregations/SET_CURRENT_DATA', { groupId: this.pageForm.groupId })
      this.groupSelectId = null
    },
    handleUploadImageSuccess(url) {
      this.novicePackUrl = url
    }
  }
}
</script>
