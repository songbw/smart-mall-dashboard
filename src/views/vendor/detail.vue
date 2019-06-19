<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="企业详细信息"
    width="60%"
    center
  >
    <el-form label-position="right" label-width="100px">
      <el-form-item label="商户名">
        <el-input :value="company.name" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="商户地址">
        <el-input :value="company.address" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="商户行业">
        <el-tag v-for="tag in tags" :key="tag">
          {{ tag }}
        </el-tag>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-input :value="createdTime" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="更新时间">
        <el-input :value="updatedTime" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="营业执照">
        <img v-if="company.licenceUrl" :src="company.licenceUrl" width="50%" alt="">
      </el-form-item>
      <el-form-item label="商户管理员">
        <el-table :data="users" border style="width: 100%;">
          <el-table-column label="编号" align="center" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="登录名" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.loginName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="电话" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="角色" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.role }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import { IndustryDefinitions } from './constants'

export default {
  name: 'VendorDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    company: {
      type: Object,
      default() {
        return {}
      }
    },
    users: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    tags() {
      if (this.company.industry) {
        return this.company.industry.split(';')
          .map(item => {
            const find = IndustryDefinitions.find(definition => definition.value === item)
            return find ? find.label : item
          })
      } else {
        return []
      }
    },
    createdTime() {
      if (this.company.createTime) {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(this.company.createTime)
        return momentDate.isValid() ? momentDate.format(format) : ''
      } else {
        return ''
      }
    },
    updatedTime() {
      if (this.company.updateTime) {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(this.company.updateTime)
        return momentDate.isValid() ? momentDate.format(format) : ''
      } else {
        return ''
      }
    }
  },
  methods: {
    handleDialogConfirm() {
      this.$emit('onConfirmed')
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-input {
    width: 70%;
  }
</style>
