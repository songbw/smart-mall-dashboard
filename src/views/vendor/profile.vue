<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <h3>当前商户的状态<span><el-tag>{{ statusLabel }}</el-tag></span></h3>
      </el-header>
      <el-main>
        <el-form
          ref="vendorForm"
          v-loading="loading"
          :model="profile"
          :rules="vendorRules"
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="商户名" prop="name">
            <el-input v-model="vendorName" :readonly="couldEdit === false" class="item-input" />
          </el-form-item>
          <el-form-item label="商户地址" prop="address">
            <el-input v-model="vendorAddress" :readonly="couldEdit === false" class="item-input" />
          </el-form-item>
          <el-form-item label="商户行业" prop="industry">
            <el-select
              v-model="vendorIndustry"
              :disabled="couldEdit === false"
              multiple
              placeholder="请选择行业类型"
              class="item-input"
            >
              <el-option
                v-for="item in industryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="营业执照" prop="licenseUrl">
            <img v-if="vendorLicenseUrl" :src="vendorLicenseUrl" width="50%" alt="">
            <el-upload
              ref="uploadLicense"
              :action="uploadUrl"
              :data="uploadData"
              :auto-upload="false"
              :limit="1"
              :on-success="handleUploadImageSuccess"
              :on-error="handleUploadImageError"
              :on-change="handleUploadImageChange"
              :on-remove="handleUploadImageRemove"
              list-type="picture"
              name="file"
              class="item-input"
            >
              <el-button slot="trigger" :disabled="couldEdit === false" size="small" type="primary">
                选择营业执照
              </el-button>
              <div slot="tip" class="el-upload__tip">商户所提交的营业执照请确保清晰，并且真实有效</div>
            </el-upload>
          </el-form-item>
          <el-form-item v-if="vendorStatus === statusRejected" label="审核意见">
            <el-input v-model="vendorComment" type="textarea" readonly class="item-input" />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleSaveVendor">
                {{ saveBtnLabel }}
              </el-button>
              <el-button v-if="submitBtnLabel" type="warning" @click="handleSubmitVendor">
                {{ submitBtnLabel }}
              </el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import { IndustryDefinitions, VendorStatus } from './constants'
import {
  app_upload_url,
  vendor_status_init,
  vendor_status_rejected
} from '@/utils/constants'

export default {
  name: 'VendorProfile',
  data() {
    const validateName = (rule, value, callback) => {
      if (this.vendorName && this.vendorName.length > 1) {
        callback()
      } else {
        callback(new Error('请输入商户名'))
      }
    }
    const validateAddress = (rule, value, callback) => {
      if (this.vendorAddress && this.vendorAddress.length > 1) {
        callback()
      } else {
        callback(new Error('请输入商户地址'))
      }
    }
    const validateIndustry = (rule, value, callback) => {
      if (this.vendorIndustry && this.vendorIndustry.length > 0) {
        callback()
      } else {
        callback(new Error('请选择商户类型'))
      }
    }
    const validateLicense = (rule, value, callback) => {
      if (this.vendorLicenseUrl && this.vendorLicenseUrl.length > 1) {
        callback()
      } else {
        if (this.uploadFileList.length > 0) {
          callback()
        } else {
          callback(new Error('请选择营业执照图片'))
        }
      }
    }
    return {
      statusRejected: vendor_status_rejected,
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: 'vendor/licenses'
      },
      industryOptions: IndustryDefinitions,
      profile: {
        name: null,
        address: null,
        industry: null,
        licenseUrl: null
      },
      loading: false,
      vendorRules: {
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        address: [{ required: true, trigger: 'blur', validator: validateAddress }],
        industry: [{ required: true, trigger: 'change', validator: validateIndustry }],
        licenseUrl: [{ required: true, trigger: 'change', validator: validateLicense }]
      },
      uploadFileList: []
    }
  },
  computed: {
    ...mapGetters([
      'cosUrl',
      'vendorProfile'
    ]),
    statusLabel() {
      const find = VendorStatus.find(item => item.value === this.vendorStatus)
      return find ? find.label : '未知状态'
    },
    saveBtnLabel() {
      switch (this.vendorStatus) {
        case 0:
          return '企业信息登记'
        case 1:
        case 4:
          return '企业信息更新'
        default:
          return '确定'
      }
    },
    submitBtnLabel() {
      switch (this.vendorStatus) {
        case 1:
          return '提交审核'
        case 4:
          return '重新审核'
        default:
          return ''
      }
    },
    couldEdit() {
      switch (this.vendorStatus) {
        case 0:
        case 1:
        case 4:
          return true
        default:
          return false
      }
    },
    vendorStatus() {
      return this.vendorProfile ? this.vendorProfile.status : vendor_status_init
    },
    vendorComment: {
      get() {
        return this.vendorProfile ? this.vendorProfile.comments : ''
      }
    },
    vendorName: {
      get() {
        return this.profile.name != null ? this.profile.name : this.vendorProfile.name
      },
      set(value) {
        this.profile.name = value
      }
    },
    vendorAddress: {
      get() {
        return this.profile.address != null ? this.profile.address : this.vendorProfile.address
      },
      set(value) {
        this.profile.address = value
      }
    },
    vendorIndustry: {
      get() {
        const industry = this.profile.industry != null ? this.profile.industry : this.vendorProfile.industry
        if (industry) {
          return industry.split(';')
        } else {
          return []
        }
      },
      set(values) {
        this.profile.industry = values.join(';')
      }
    },
    vendorLicenseUrl() {
      return this.profile.licenseUrl != null ? this.profile.licenseUrl : this.vendorProfile.licenseUrl
    }
  },
  created() {
    this.getVendorProfile()
  },
  methods: {
    async getVendorProfile() {
      this.loading = true
      try {
        await this.$store.dispatch('vendor/getProfile')
      } catch (e) {
        console.warn(`Get vendor profile error: ${e}`)
      } finally {
        this.loading = false
      }
    },
    async updateVendorProfile() {
      try {
        this.loading = true
        const params = {}
        let changed = false
        Object.keys(this.profile).forEach(key => {
          if (!isEmpty(this.profile[key]) &&
            !isEqual(this.profile[key], this.vendorProfile[key])) {
            params[key] = this.profile[key]
            changed = true
          }
        })

        if (changed) {
          await this.$store.dispatch('vendor/updateProfile', params)
          this.$message.success('企业信息更新成功！')
        }
      } catch (e) {
        console.log(`Update vendor profile error:${e}`)
        this.$message.error('企业信息更新失败，请联系管理人员！')
      } finally {
        this.loading = false
      }
    },
    async createVendorProfile() {
      try {
        this.loading = true
        await this.$store.dispatch('vendor/createProfile', this.profile)
        this.$message.success('企业信息登记成功!')
      } catch (e) {
        console.log(`Create vendor profile error:${e}`)
        this.$message.error('企业信息登记失败，请联系管理人员！')
      } finally {
        this.loading = false
      }
    },
    createOrSaveProfile() {
      switch (this.vendorStatus) {
        case 0:
          this.createVendorProfile()
          break
        case 1:
        case 4:
          this.updateVendorProfile()
          break
        default:
          this.$router.go(-1)
          return
      }
    },
    handleSaveVendor() {
      this.$refs.vendorForm.validate(async(valid) => {
        if (valid) {
          if (this.uploadFileList.length === 0) {
            await this.createOrSaveProfile()
          } else {
            this.$refs.uploadLicense.submit()
          }
        }
      })
    },
    async handleUploadImageSuccess(response) {
      this.profile.licenseUrl = this.cosUrl + response.data.url
      this.$refs.uploadLicense.clearFiles()
      await this.createOrSaveProfile()
    },
    handleUploadImageError() {
      this.$refs.uploadLicense.clearFiles()
      this.$message.error('上传营业执照失败，请稍后重试')
    },
    handleUploadImageChange(file, fileList) {
      this.uploadFileList = fileList
    },
    handleUploadImageRemove(file, fileList) {
      this.uploadFileList = fileList
    },
    async handleSubmitVendor() {
      try {
        await this.$confirm('提交后将不能修改信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.updateVendorProfile()
        await this.$store.dispatch('vendor/submitProfile')
        this.$message.success('企业信息提交成功，正在审核！')
      } catch (e) {
        console.log(`Submit vendor error: ${e}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-input {
    width: 70%;
  }
</style>
