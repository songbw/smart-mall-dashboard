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
      <el-form-item label="主页设置" prop="homePage">
        <el-switch v-model="homePage" />
      </el-form-item>
      <el-form-item label="生效日期" prop="effectiveDate">
        <el-date-picker
          v-model="pageDate"
          placeholder="选择日期"
          type="date"
          format="yyyy/MM/dd"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="背景色" prop="backgroundColor">
        <el-color-picker v-model="pageColor" />
        <el-tag>{{ pageColor }}</el-tag>
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
        <el-button @click="$emit('cancelCreation')">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存并创建</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="选择聚合页组"
      :visible.sync="groupDialogVisible"
      width="50%"
      center
    >
      <el-radio-group v-model="groupSelectId">
        <el-radio v-for="group in aggregationGroups" :key="group.name" :label="group.id.toString()" border>
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
import isEmpty from 'lodash/isEmpty'
import {
  searchAggregationsApi
} from '@/api/aggregations'

export default {
  name: 'CreationForm',
  data() {
    return {
      creatingPage: false,
      pageForm: {
        name: null,
        homePage: null,
        effectiveDate: null,
        backgroundColor: null,
        groupId: null
      },
      groupDialogVisible: false,
      groupSelectId: null,
      formRules: {
        name: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(this.pageName)) {
              callback(new Error('请输入有效的名称'))
            } else {
              callback()
            }
          }
        }],
        effectiveDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(this.pageDate)) {
              callback(new Error('请选择生效日期'))
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
      pageInfo: 'currentAggregation',
      aggregationGroups: 'aggregationGroups',
      groupId: 'aggregationGroupId'
    }),
    pageName: {
      get() {
        return this.pageForm.name != null ? this.pageForm.name : this.pageInfo.name
      },
      set(newValue) {
        this.pageForm.name = newValue
      }
    },
    homePage: {
      get() {
        return this.pageForm.homePage !== null ? this.pageForm.homePage : this.pageInfo.homePage
      },
      set(newValue) {
        this.pageForm.homePage = newValue
      }
    },
    pageDate: {
      get() {
        return this.pageForm.effectiveDate != null ? this.pageForm.effectiveDate : this.pageInfo.effectiveDate
      },
      set(newValue) {
        this.pageForm.effectiveDate = newValue
      }
    },
    pageColor: {
      get() {
        return this.pageForm.backgroundColor != null ? this.pageForm.backgroundColor : this.pageInfo.backgroundColor
      },
      set(newValue) {
        this.pageForm.backgroundColor = newValue
      }
    },
    groupName: {
      get() {
        const id = this.pageForm.groupId !== null ? this.pageForm.groupId : this.pageInfo.groupId
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
    }
  },
  methods: {
    createPage() {
      this.creatingPage = true
      const params = Object.assign({}, this.pageForm)
      if (params.groupId === null) {
        if (this.groupId > 0) {
          params.groupId = this.groupId
        } else {
          delete params.groupId
        }
      }
      if (params.backgroundColor === null) {
        params.backgroundColor = this.pageInfo.backgroundColor
      }
      if (params.homePage === null) {
        params.homePage = false
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
      if (this.pageForm.name === null) {
        this.pageForm.name = this.pageInfo.name
      } else {
        if (this.pageForm.name !== this.pageInfo.name) {
          changed = true
          params.name = this.pageForm.name
        }
      }
      if (this.pageForm.homePage == null) {
        this.pageForm.homePage = this.pageInfo.homePage
      } else {
        if (this.pageForm.homePage !== this.pageInfo.homePage) {
          changed = true
          params.homePage = this.pageForm.homePage
        }
      }
      if (this.pageForm.effectiveDate === null) {
        this.pageForm.effectiveDate = this.pageInfo.effectiveDate
      } else {
        if (this.pageForm.effectiveDate !== this.pageInfo.effectiveDate) {
          changed = true
          params.effectiveDate = this.pageForm.effectiveDate
        }
      }
      if (this.pageForm.backgroundColor === null) {
        this.pageForm.backgroundColor = this.pageInfo.backgroundColor
      } else {
        if (this.pageForm.backgroundColor !== this.pageInfo.backgroundColor) {
          changed = true
          params.backgroundColor = this.pageForm.backgroundColor
        }
      }
      if (this.pageForm.groupId === null) {
        this.pageForm.groupId = this.pageInfo.groupId
      } else {
        if (this.pageForm.groupId !== this.pageInfo.groupId) {
          changed = true
          params.groupId = this.pageForm.groupId
        }
      }
      if (changed) {
        return params
      } else {
        return null
      }
    },
    async checkHomePage(params) {
      if (params.hasOwnProperty('homePage') && params.homePage === false) {
        try {
          const res = await searchAggregationsApi({ homePage: true, offset: 1, limit: 1 })
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
          this.creatingPage = true
          const params = { id: pageID, ...updatedParams }
          this.$store.dispatch('aggregations/updatePage', params).then(() => {
            this.$emit('createPage', pageID)
          }).catch(err => {
            this.$message(err)
          }).finally(() => {
            this.creatingPage = false
          })
        }
      } else {
        this.$emit('createPage', pageID)
        this.creatingPage = false
      }
    },
    onSubmit() {
      const pageID = this.pageInfo.id
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (pageID === -1) {
            this.createPage()
          } else {
            this.updatePage()
          }
        }
      })
    },
    handleChangeGroup() {
      if (this.groupId > 0) {
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
      this.groupSelectId = null
    }
  }
}
</script>
