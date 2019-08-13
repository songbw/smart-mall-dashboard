<template>
  <div v-loading="loading" class="app-container">
    <el-form
      ref="productForm"
      :model="productForm"
      :rules="formRules"
      :element-loading-text="loadingMessage"
      element-loading-spinner="el-icon-loading"
      label-position="right"
      label-width="200px"
    >
      <el-form-item v-if="!createProduct" label="商品ID">
        <span>{{ productForm.id }}</span>
      </el-form-item>
      <el-form-item v-if="!createProduct" label="商品MPU">
        <span>{{ productForm.mpu }}</span>
      </el-form-item>
      <el-form-item v-if="!createProduct" label="创建时间">
        <span>{{ productForm.createdAt | dateFormat }}</span>
      </el-form-item>
      <el-form-item v-if="isAdminUser" label="商品供应商" prop="merchantId">
        <span v-if="viewProduct">{{ getVendorName(productForm.merchantId) }}</span>
        <el-select
          v-else
          :value="productForm.merchantId"
          style="width: 50%"
          @change="handleMerchantChanged"
        >
          <el-option
            v-for="item in vendorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品SKU" prop="skuid">
        <span v-if="viewProduct">{{ productForm.skuid }}</span>
        <el-input v-else v-model="productForm.skuid" maxlength="30" />
      </el-form-item>
      <el-form-item v-if="!createProduct" label="商品状态">
        <span>{{ productForm.state | productState }}</span>
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <span v-if="viewProduct">{{ productForm.name }}</span>
        <el-input v-else v-model="productForm.name" maxlength="100" />
      </el-form-item>
      <el-form-item label="商品品牌" prop="brand">
        <span v-if="productForm.brand" style="margin-right: 10px">{{ productForm.brand }}</span>
        <el-select
          v-if="!viewProduct"
          filterable
          remote
          placeholder="请输入商品品牌关键词"
          :value="brandSelectedId"
          :remote-method="remoteBrandOptions"
          :loading="brandLoading"
          @change="handleBrandChanged"
        >
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品类别" prop="category">
        <span v-if="viewProduct">{{ categoryName }}</span>
        <category-selection
          v-else
          :first-value="firstCategoryValue"
          :second-value="secondCategoryValue"
          :third-value="thirdCategoryValue"
          @changed="handleCategorySelectionChanged"
        />
      </el-form-item>
      <el-form-item label="商品型号" prop="model">
        <span v-if="viewProduct"> {{ productForm.model }}</span>
        <el-input v-else v-model="productForm.model" maxlength="50" />
      </el-form-item>
      <el-form-item label="商品重量">
        <span v-if="viewProduct"> {{ productForm.weight }}</span>
        <el-input v-else v-model="productForm.weight" maxlength="10" />
      </el-form-item>
      <el-form-item label="商品封面图">
        <template>
          <el-image v-if="productForm.image" :src="productForm.image" fit="contain" style="width: 200px" />
          <el-upload
            v-if="!viewProduct"
            ref="coverUpload"
            :action="uploadUrl"
            :data="uploadCoverData"
            :auto-upload="true"
            :limit="1"
            :show-file-list="true"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadCoverSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            accept="image/png, image/jpeg, image/jpg"
            style="margin: 10px"
            list-type="picture"
            name="file"
          >
            <el-button slot="trigger" type="primary" icon="el-icon-picture">
              选择封面图
            </el-button>
          </el-upload>
        </template>
      </el-form-item>
      <el-form-item label="商品条形码">
        <span v-if="viewProduct"> {{ productForm.upc }}</span>
        <el-input v-else v-model="productForm.upc" maxlength="50" />
      </el-form-item>
      <el-form-item label="销售单位">
        <span v-if="viewProduct"> {{ productForm.saleunit }}</span>
        <el-input v-else v-model="productForm.saleunit" maxlength="10" />
      </el-form-item>
      <el-form-item label="销售价格(元)" prop="price">
        <span v-if="viewProduct"> {{ productForm.price }}</span>
        <el-input-number v-else v-model="productForm.price" :precision="2" :step="1" :min="0" />
      </el-form-item>
      <el-form-item label="进货价格(元)">
        <span v-if="viewProduct"> {{ productForm.sprice }}</span>
        <el-input-number v-else v-model="productForm.sprice" :precision="2" :step="1" :min="0" />
      </el-form-item>
      <el-form-item label="商品库存">
        <span v-if="viewProduct"> {{ productForm.inventory }}</span>
        <el-input-number v-else v-model="productForm.inventory" :min="0" />
      </el-form-item>
      <el-form-item label="商品主图">
        <template>
          <el-upload
            v-if="!viewProduct"
            ref="thumbnailUpload"
            :action="uploadUrl"
            :data="uploadThumbnailData"
            :auto-upload="true"
            :disabled="thumbnails.length >= 5"
            :limit="5 - thumbnails.length < 0 ? 0 : 5 - thumbnails.length"
            :show-file-list="true"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadThumbnailSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            accept="image/png, image/jpeg, image/jpg"
            style="margin: 10px"
            list-type="picture"
            name="file"
            multiple
          >
            <el-button slot="trigger" :disabled="thumbnails.length >= 5" type="primary" icon="el-icon-picture">
              选择主图
            </el-button>
            <div slot="tip" class="el-upload__tip">请选择商品的主图，最多支持5个</div>
          </el-upload>
          <el-row v-if="thumbnailUrls.length > 0">
            <el-col
              v-for="(imgUrl, index) in thumbnailUrls"
              :key="thumbnails[index]"
              :span="4"
              :offset="index > 0 ? 1 : 0"
            >
              <custom-thumbnail
                :could-edit="!viewProduct"
                :image-url="imgUrl"
                :index="index"
                :length="thumbnailUrls.length"
                :bucket="thumbnailUploadPath"
                @sortThumbnail="handleSortThumbnail"
                @deleteThumbnail="handleDeleteThumbnail"
                @beforeUpload="handleBeforeUpload"
                @uploadError="handleUploadError"
                @uploadProgress="handleUploadProgress"
                @uploadSuccess="handleUploadThumbnailIndexSuccess"
              />
            </el-col>
          </el-row>
        </template>
      </el-form-item>
      <el-form-item label="商品描述图">
        <template>
          <div v-if="!viewProduct">
            <el-radio-group v-model="newIntroductionType" style="margin-left: 20px">
              <el-radio :label="1">正常详情图</el-radio>
              <el-radio :label="2">头部详情图</el-radio>
              <el-radio :label="3">尾部详情图</el-radio>
            </el-radio-group>
            <el-upload
              ref="introductionUpload"
              :action="uploadUrl"
              :data="uploadIntroductionData"
              :auto-upload="true"
              :limit="30"
              :show-file-list="true"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadIntroductionSuccess"
              :on-error="handleUploadError"
              :on-progress="handleUploadProgress"
              style="margin: 10px"
              accept="image/png, image/jpeg, image/jpg"
              list-type="picture"
              name="file"
              multiple
            >
              <el-button slot="trigger" type="primary" icon="el-icon-picture">
                选择描述图
              </el-button>
            </el-upload>
          </div>
          <div v-for="(img, index) in introductionUrls" :key="introductions[index]" style="padding: 14px">
            <custom-introduction
              :could-edit="!viewProduct"
              :image-url="img"
              :index="index"
              :length="introductions.length"
              :bucket="introductionUploadPath"
              @sortIntroduction="handleSortIntroduction"
              @deleteIntroduction="handleDeleteIntroduction"
              @beforeUpload="handleBeforeUpload"
              @uploadError="handleUploadError"
              @uploadProgress="handleUploadProgress"
              @uploadSuccess="handleUploadIntroductionIndexSuccess"
            />
          </div>
        </template>
      </el-form-item>
      <el-divider />
      <el-form-item>
        <el-button type="primary" @click="goBack">返回</el-button>
        <el-button v-if="!viewProduct" type="danger" @click="handleSubmit">
          {{ createProduct ? '创建' : '修改' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import { createProductApi, updateProductApi, searchProductsApi } from '@/api/products'
import { searchBrandsApi } from '@/api/brands'
import CustomThumbnail from './customThumbnail'
import CustomIntroduction from './customIntroduction'
import CategorySelection from '@/components/CategorySelection'
import {
  app_upload_url,
  ProductStateOptions,
  vendor_status_approved
} from '@/utils/constants'
import {
  getVendorListApi
} from '@/api/vendor'

const OP_VIEW = 1
const OP_EDIT = 2
const OP_CREATE = 3

export default {
  name: 'ProductDetail',
  components: { CustomIntroduction, CustomThumbnail, CategorySelection },
  filters: {
    productState: state => {
      const value = Number.parseInt(state)
      if (Number.isNaN(value)) {
        return state
      } else {
        const find = ProductStateOptions.find(option => option.value === value)
        return find ? find.label : state
      }
    },
    dateFormat: date => {
      if (isEmpty(date)) {
        return ''
      } else {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(date)
        return momentDate.isValid() ? momentDate.format(format) : date
      }
    }
  },
  data() {
    this.productInfo = null
    const validateValue = (rule, value, callback) => {
      if (value == null) {
        switch (rule.field) {
          case 'merchantId':
            if (this.isAdminUser) {
              callback(new Error('请选择商品供应商'))
            } else {
              callback()
            }
            break
          case 'skuid':
            callback(new Error('请输入商品SKU'))
            break
          case 'name':
            callback(new Error('请输入商品名称'))
            break
          case 'category':
            callback(new Error('请选择商品类别'))
            break
          case 'price':
            callback(new Error('请输入商品销售价'))
            break
        }
      } else {
        callback()
      }
    }
    return {
      uploadUrl: app_upload_url,
      uploading: false,
      uploadPercent: 0,
      uploadCoverData: {
        pathName: 'products'
      },
      uploadThumbnailData: {
        pathName: 'products'
      },
      uploadIntroductionData: {
        pathName: 'products'
      },
      thumbnailUploadPath: 'products',
      introductionUploadPath: 'products',
      loading: false,
      opType: OP_VIEW,
      brandLoading: false,
      brandOptions: [],
      brandSelectedId: null,
      categoryName: '',
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null,
      thumbnails: [],
      thumbnailUrls: [],
      newIntroductionType: 1, // 1 for normal, 2 for head, 3 for tail
      introductions: [],
      introductionUrls: [],
      productForm: {
        id: null,
        merchantId: null,
        skuid: null,
        state: 0,
        name: null,
        brandId: null, // Number
        brand: null,
        category: null,
        model: null,
        image: null,
        weight: null,
        upc: null,
        saleunit: null,
        price: null,
        sprice: null,
        inventory: null, // Number
        mpu: null,
        createdAt: null,
        imagesUrl: null,
        introductionUrl: null
      },
      formRules: {
        merchantId: [{
          required: true, validator: validateValue, trigger: 'blur'
        }],
        skuid: [{
          required: true, validator: validateValue, trigger: 'blur'
        }],
        name: [{
          required: true, validator: validateValue, trigger: 'blur'
        }],
        category: [{
          required: true, validator: validateValue, trigger: 'blur'
        }],
        price: [{
          required: true, validator: validateValue, trigger: 'change'
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      vendorOptions: 'productVendors',
      vendorId: 'vendorId'
    }),
    loadingMessage: {
      get() {
        return this.uploading ? '正在上传图片...' + this.uploadPercent + '%' : '正在加载中...'
      }
    },
    viewProduct() {
      return this.opType === OP_VIEW
    },
    createProduct() {
      return this.opType === OP_CREATE
    },
    editProduct() {
      return this.opType === OP_EDIT
    }
  },
  created() {
    if (this.$route.name === 'CreateProduct') {
      this.opType = OP_CREATE
    } else {
      if (this.$route.name === 'EditProduct') {
        this.opType = OP_EDIT
      } else {
        this.opType = OP_VIEW
      }
    }
    this.prepareProduct()
  },
  methods: {
    async prepareProduct() {
      await this.getVendorList()
      if (this.opType !== OP_CREATE) {
        this.getProductInfo()
      }
    },
    async getVendorList() {
      if (this.vendorOptions.length === 0) {
        try {
          this.loading = true
          const params = {
            page: 1,
            limit: 100,
            status: vendor_status_approved
          }
          const data = await getVendorListApi(params)
          const vendors = data.rows.map(row => {
            return {
              value: row.company.id,
              label: row.company.name
            }
          })
          this.$store.commit('products/SET_VENDOR_OPTIONS', vendors)
        } catch (e) {
          console.warn('Product get vendor list error:' + e)
        } finally {
          this.loading = false
        }
      }
    },
    getVendorName(vendorId) {
      if (this.vendorOptions.length > 0 && vendorId != null) {
        const vendor = this.vendorOptions.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    async getProductInfo() {
      const params = {
        offset: 1,
        limit: 1
      }
      if (this.$route.params.mpu) {
        params.mpu = this.$route.params.mpu
      } else {
        params.id = this.$route.params.id
      }
      if (!this.isAdminUser) {
        params.merchantId = this.vendorId
      }
      this.loading = true
      searchProductsApi(params).then(response => {
        const data = response.data.result
        if (data.total > 0) {
          this.productInfo = data.list[0]
          Object.keys(this.productForm).forEach(key => {
            if (key in this.productInfo) {
              if (key !== 'price' || key !== 'sprice') {
                this.productForm[key] = this.productInfo[key]
              } else {
                this.productForm[key] = Number.parseFloat(this.productInfo[key])
              }
            }
          })

          this.thumbnails = []
          this.thumbnailUrls = []
          if (!isEmpty(this.productForm.imagesUrl)) {
            this.thumbnails = this.productForm.imagesUrl.split(':')
            this.thumbnailUrls = this.thumbnails.map(img => this.$store.getters.cosUrl + img)
          }

          this.introductions = []
          this.introductionUrls = []

          if (!isEmpty(this.productForm.introductionUrl)) {
            this.introductions = this.productForm.introductionUrl.split(':')
            this.introductionUrls = this.introductions.map(img => this.$store.getters.cosUrl + img)
          }

          this.uploadCoverData.pathName = this.productInfo.category + '/' + this.productInfo.id + '/CoverU'
          this.thumbnailUploadPath = this.productInfo.category + '/' + this.productInfo.id + '/ZTU'
          this.uploadThumbnailData.pathName = this.thumbnailUploadPath
          this.introductionUploadPath = this.productInfo.category + '/' + this.productInfo.id + '/XTU'
          this.uploadIntroductionData.pathName = this.introductionUploadPath

          this.getCategoryName(this.productForm.category)
        }
      }).catch(error => {
        console.log('getProductInfo:' + error)
      }).finally(() => {
        this.loading = false
      })
    },
    async remoteBrandOptions(query) {
      if (isEmpty(query)) {
        this.brandOptions = []
      } else {
        try {
          this.brandLoading = true
          const { data } = await searchBrandsApi({ offset: 1, limit: 20, query })
          this.brandOptions = data.result.list.map(brand => {
            // If no english name, jus return chinese name
            const name = isEmpty(brand.brandEname) ? brand.brandCname : brand.brandName
            return { value: brand.brandId, label: name }
          })
        } catch (e) {
          console.log('Remote brand options: ' + e)
          this.brandOptions = []
        } finally {
          this.brandLoading = false
        }
      }
    },
    handleMerchantChanged(value) {
      this.productForm.merchantId = value
    },
    handleBrandChanged(value) {
      this.productForm.brandId = value
      this.productForm.brand = this.brandOptions.find(brand => brand.value === value).label
      this.brandOptions = []
    },
    getCategoryName(category) {
      this.$store.dispatch('categories/getDataByID', { id: category }).then(category => {
        if (category.length > 0) {
          if (this.categoryName.length > 0) {
            this.categoryName = category[0].categoryName + ` / ` + this.categoryName
          } else {
            this.categoryName = category[0].categoryName
          }
          if (category[0].categoryClass === '3') {
            this.thirdCategoryValue = category[0].categoryId
          } else if (category[0].categoryClass === '2') {
            this.secondCategoryValue = category[0].categoryId
          } else {
            this.firstCategoryValue = category[0].categoryId
          }
          const parentID = category[0].parentId
          if (parentID !== 0) {
            this.getCategoryName(parentID)
          }
        }
      }).catch(error => {
        console.log('getCategoryName:' + error)
      })
    },
    handleCategorySelectionChanged(category) {
      const value = Number.isSafeInteger(category.value) ? category.value : null
      switch (category.level) {
        case 1:
          this.firstCategoryValue = value
          this.secondCategoryValue = null
          this.thirdCategoryValue = null
          break
        case 2:
          this.secondCategoryValue = value
          this.thirdCategoryValue = null
          break
        case 3:
          this.thirdCategoryValue = value
          break
        default:
          break
      }
    },
    handleSortThumbnail(params) {
      const item = this.thumbnails.splice(params.index, 1)[0]
      const url = this.thumbnailUrls.splice(params.index, 1)[0]
      const newIndex = params.left ? params.index - 1 : params.index + 1
      this.thumbnails.splice(newIndex, 0, item)
      this.thumbnailUrls.splice(newIndex, 0, url)
    },
    handleDeleteThumbnail(index) {
      this.thumbnails.splice(index, 1)
      this.thumbnailUrls.splice(index, 1)
    },
    handleSortIntroduction(params) {
      const item = this.introductions.splice(params.index, 1)[0]
      const url = this.introductionUrls.splice(params.index, 1)[0]
      const newIndex = params.up ? params.index - 1 : params.index + 1
      this.introductions.splice(newIndex, 0, item)
      this.introductionUrls.splice(newIndex, 0, url)
    },
    handleDeleteIntroduction(index) {
      this.introductions.splice(index, 1)
      this.introductionUrls.splice(index, 1)
    },
    handleSubmit() {
      if (Number.isSafeInteger(this.thirdCategoryValue)) {
        this.productForm.category = this.thirdCategoryValue.toString()
      } else {
        this.productForm.category = null
      }
      this.productForm.imagesUrl = this.thumbnails.length > 0 ? this.thumbnails.join(':') : null
      this.productForm.introductionUrl = this.introductions.length > 0 ? this.introductions.join(':') : null
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          if (this.createProduct) {
            this.handleCreateProduct()
          } else {
            this.handleUpdateProduct()
          }
        }
      })
    },
    async handleCreateProduct() {
      try {
        const params = {}
        Object.keys(this.productForm).forEach(key => {
          if (this.productForm[key] !== null) {
            params[key] = this.productForm[key]
          }
        })
        if (!this.isAdminUser) {
          params.merchantId = this.vendorId
        }
        const { code } = await createProductApi(params)
        if (code === 200) {
          this.$message({ message: '创建产品信息成功。', type: 'success' })
          this.goBack()
        } else {
          this.$message.error('创建商品信息失败，请联系管理员！')
        }
      } catch (e) {
        console.warn('Create product error: ' + e)
        this.$message.error('创建产品信息失败！')
      }
    },
    handleUpdateProduct() {
      let changed = false
      const params = {
        id: this.productForm.id
      }
      Object.keys(this.productForm).forEach(key => {
        if (this.productInfo[key] !== this.productForm[key]) {
          params[key] = this.productForm[key]
          changed = true
        }
      })
      if (changed) {
        this.$confirm('请确定是否修改此商品的信息？', '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
          updateProductApi(params).then(res => {
            this.$message({ message: '更新产品信息成功。', type: 'success' })
            this.goBack()
          }).catch(error => {
            console.log('updateProductInfo:' + JSON.stringify(error))
            this.$message.error('更新产品信息失败！')
          })
        }).catch(() => {
        })
      } else {
        this.goBack()
      }
    },
    handleUploadCoverSuccess(res) {
      this.$refs.coverUpload.clearFiles()
      this.loading = false
      this.uploading = false
      this.productForm.image = this.$store.getters.cosUrl + res.data.url
    },
    handleUploadThumbnailSuccess(res, file, fileList) {
      const sucList = fileList.filter(item => item.status === 'success')
      if (sucList.length === fileList.length) {
        const sortList = sortBy(sucList, ['name'])
        for (const item of sortList) {
          const url = item.response.data.url
          if (!this.thumbnails.includes(url)) {
            this.thumbnails.push(url)
            this.thumbnailUrls.push(this.$store.getters.cosUrl + url)
          }
        }
        this.loading = false
        this.uploading = false
        this.$refs.thumbnailUpload.clearFiles()
      }
    },
    handleUploadThumbnailIndexSuccess(params) {
      const index = params.index
      const url = params.url
      this.loading = false
      this.uploading = false
      this.thumbnails.splice(index, 1)
      this.thumbnails.splice(index, 0, url)
      this.thumbnailUrls.splice(index, 1)
      this.thumbnailUrls.splice(index, 0, this.$store.getters.cosUrl + url)
    },
    handleUploadIntroductionSuccess(res, file, fileList) {
      if (fileList.length > 1) {
        const sucList = fileList.filter(item => item.status === 'success')
        if (sucList.length === fileList.length) {
          const sortList = sortBy(sucList, ['name'])
          for (const item of sortList) {
            const url = item.response.data.url
            if (!this.introductions.includes(url)) {
              this.introductions.push(url)
              this.introductionUrls.push(this.$store.getters.cosUrl + url)
            }
          }
          this.loading = false
          this.uploading = false
          this.$refs.introductionUpload.clearFiles()
        }
      } else {
        this.$refs.introductionUpload.clearFiles()
        this.loading = false
        this.uploading = false
        let index = 0

        switch (this.newIntroductionType) {
          case 1: // normal
            if (this.introductionUrls.length > 2) {
              index = this.introductions.length - 1 // the first item just before last one
            } else {
              if (this.introductionUrls.length > 0) {
                index = 1
              } else {
                index = 0
              }
            }
            this.introductions.splice(index, 0, res.data.url)
            this.introductionUrls.splice(index, 0, this.$store.getters.cosUrl + res.data.url)
            break
          case 2: // Head
            this.introductions.splice(0, 0, res.data.url)
            this.introductionUrls.splice(0, 0, this.$store.getters.cosUrl + res.data.url)
            break
          case 3: // Tail
            this.introductions.push(res.data.url)
            this.introductionUrls.push(this.$store.getters.cosUrl + res.data.url)
            break
        }
      }
    },
    handleUploadIntroductionIndexSuccess(params) {
      const index = params.index
      const url = params.url
      this.loading = false
      this.uploading = false
      this.introductions.splice(index, 1)
      this.introductions.splice(index, 0, url)
      this.introductionUrls.splice(index, 1)
      this.introductionUrls.splice(index, 0, this.$store.getters.cosUrl + url)
    },
    handleBeforeUpload(file) {
      this.uploadPercent = 0
      this.loading = true
      this.uploading = true
    },
    handleUploadError(err) {
      console.log('handleUploadError:' + err)
      this.$refs.coverUpload.clearFiles()
      this.$refs.thumbnailUpload.clearFiles()
      this.$refs.introductionUpload.clearFiles()
      this.loading = false
      this.uploading = false
    },
    handleUploadProgress(event) {
      this.uploadPercent = event.percent
    },
    goBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/goods')
    }
  }
}
</script>

<style scoped>
  .bottom {
    bottom: 10px;
    right: 10px;
  }
</style>
