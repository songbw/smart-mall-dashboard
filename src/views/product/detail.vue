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
      <el-divider content-position="left">商品信息</el-divider>
      <el-form-item v-if="isAdminUser || isWatcherUser" label="商品供应商" prop="merchantId">
        <el-select
          v-if="createProduct"
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
        <span v-else>
          {{ getVendorName(productForm.merchantId) }}
        </span>
      </el-form-item>
      <el-form-item label="商品SKU" prop="skuid">
        <div v-if="createProduct">
          <el-checkbox v-model="autoSku">系统生成</el-checkbox>
          <el-input
            v-if="!autoSku"
            v-model="productForm.skuid"
            maxlength="30"
            style="width: 350px;margin-left: 10px"
          />
          <span style="font-size: 12px;margin-left: 10px;">
            <i class="el-icon-warning-outline">创建后，将不能修改。如需填写供应商SKU，请取消勾选“系统生成”。</i>
          </span>
        </div>
        <span v-else>{{ productForm.skuid }}</span>
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
      <el-form-item label="商品条形码">
        <span v-if="viewProduct"> {{ productForm.upc }}</span>
        <el-input v-else v-model="productForm.upc" maxlength="30" />
      </el-form-item>
      <el-form-item label="销售单位">
        <span v-if="viewProduct"> {{ productForm.saleunit }}</span>
        <el-input v-else v-model="productForm.saleunit" maxlength="10" />
      </el-form-item>
      <el-form-item label="销售价格(元)" prop="price">
        <span v-if="viewProduct || !isAdminUser"> {{ productForm.price }}</span>
        <el-input-number
          v-else
          v-model="productForm.price"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
      </el-form-item>
      <el-form-item v-if="isAdminUser" label="销售底价(元)">
        <span style="margin-right: 10px"> {{ floorPrice }}</span>
        <el-input-number v-model="floorPriceRate" :precision="2" :step="0.05" :min="1" :max="10" />
        <span style="font-size: 12px;margin-left: 10px;">
          <i class="el-icon-warning-outline">基于进货价的比率</i>
        </span>
      </el-form-item>
      <el-form-item v-if="!isWatcherUser" label="进货价格(元)">
        <span v-if="viewProduct"> {{ productForm.sprice }}</span>
        <el-input-number v-else v-model="productForm.sprice" :precision="2" :step="1" :min="0" :max="1000000" />
      </el-form-item>
      <el-form-item label="商品库存">
        <span v-if="viewProduct"> {{ productForm.inventory }}</span>
        <el-input-number v-else v-model="productForm.inventory" :min="0" :max="100000000" step-strictly />
      </el-form-item>
      <el-form-item label="商品对比链接">
        <el-link v-if="viewProduct" :href="productForm.compareUrl" target="_blank" type="primary">
          {{ productForm.compareUrl }}
        </el-link>
        <el-input v-else v-model="productForm.compareUrl" maxlength="100" />
      </el-form-item>
      <el-form-item label="商品类型">
        <div v-if="createProduct">
          <el-radio-group v-model="productForm.type">
            <el-radio :label="0">实体商品</el-radio>
            <el-radio :label="1">虚拟商品</el-radio>
          </el-radio-group>
        </div>
        <span v-else>{{ isVirtualProduct ? '虚拟商品' : '实体商品' }}</span>
      </el-form-item>
      <el-divider v-if="isVirtualProduct" content-position="left">虚拟商品信息</el-divider>
      <el-form-item v-if="isVirtualProduct" label="有效天数">
        <span v-if="viewProduct"> {{ virtualProductForm.effectiveDays }}</span>
        <span v-else>
          <el-checkbox v-model="alwaysEffective">永久有效</el-checkbox>
          <el-input-number
            v-if="!alwaysEffective"
            v-model="virtualProductForm.effectiveDays"
            :min="1"
            step-strictly
            style="margin-left: 10px"
          />
        </span>
        <span style="font-size: 12px;margin-left: 10px;">
          <i class="el-icon-warning-outline">为下单成功后，虚拟商品的有效天数。</i>
        </span>
      </el-form-item>
      <el-form-item v-if="isVirtualProduct" label="虚拟面额(元)">
        <span v-if="viewProduct"> {{ virtualProductForm.parValue }}</span>
        <el-input-number
          v-else
          v-model="virtualProductForm.parValue"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
        <span style="font-size: 12px;margin-left: 10px;">
          <i class="el-icon-warning-outline">为虚拟商品价值，比如100元充值卡、100元蛋糕券。</i>
        </span>
      </el-form-item>
      <el-divider content-position="left">商品图片</el-divider>
      <el-form-item label="商品封面图">
        <template>
          <el-image v-if="productCover" :src="productCover" fit="contain" style="width: 200px">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
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
            list-type="picture"
            name="file"
          >
            <el-button slot="trigger" type="primary" icon="el-icon-picture">
              修改封面图
            </el-button>
            <el-button
              v-if="hasCustomCover"
              type="danger"
              icon="el-icon-delete"
              style="margin-left: 20px"
              @click="handleRemoveCoverImage"
            >
              删除封面图
            </el-button>
            <div slot="tip" class="el-upload__tip">
              如果未上传，将以第一张主图作为封面图。
            </div>
          </el-upload>
        </template>
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
              添加主图
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
              :limit="30 - introductions.length < 0 ? 0 : 30 - introductions.length"
              :disabled="introductions.length >= 30"
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
              <el-button slot="trigger" :disabled="introductions.length >= 30" type="primary" icon="el-icon-picture">
                添加描述图
              </el-button>
              <div slot="tip" class="el-upload__tip">请选择商品的详情图，最多支持30个</div>
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
import isNumber from 'lodash/isNumber'
import sortBy from 'lodash/sortBy'
import trim from 'lodash/trim'
import {
  createProductApi,
  updateProductApi,
  searchProductsApi,
  createVirtualProductApi,
  updateVirtualProductApi,
  findVirtualProductInfoApi
} from '@/api/products'
import { searchBrandsApi } from '@/api/brands'
import CustomThumbnail from './customThumbnail'
import CustomIntroduction from './customIntroduction'
import CategorySelection from '@/components/CategorySelection'
import {
  app_upload_url,
  ProductStateOptions,
  vendor_status_approved
} from '@/utils/constants'
import { getVendorListApi } from '@/api/vendor'

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
    const validateValue = (rule, value, callback) => {
      if (value === null || value === '') {
        switch (rule.field) {
          case 'merchantId':
            if (this.isAdminUser) {
              callback(new Error('请选择商品供应商'))
            } else {
              callback()
            }
            break
          case 'name':
            callback(new Error('请输入商品名称'))
            break
          case 'category':
            callback(new Error('请选择商品类别'))
            break
        }
      } else {
        callback()
      }
    }
    return {
      uploadUrl: app_upload_url,
      vendorAoyi: 2,
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
      autoSku: true,
      brandLoading: false,
      brandOptions: [],
      brandSelectedId: null,
      categoryName: '',
      firstCategoryValue: null,
      secondCategoryValue: null,
      thirdCategoryValue: null,
      floorPriceRate: 1.1,
      hasCoverImage: false,
      thumbnails: [],
      thumbnailUrls: [],
      newIntroductionType: 1, // 1 for normal, 2 for head, 3 for tail
      introductions: [],
      introductionUrls: [],
      productInfo: null,
      alwaysEffective: true,
      virtualProductInfo: null,
      virtualProductForm: {
        id: null,
        effectiveDays: null,
        parValue: null
      },
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
        weight: 0,
        upc: null,
        saleunit: null,
        price: 0,
        sprice: 0,
        inventory: null, // Number
        mpu: null,
        createdAt: null,
        imagesUrl: null,
        introductionUrl: null,
        compareUrl: null,
        type: 0
      },
      formRules: {
        merchantId: [{
          required: true, validator: validateValue, trigger: 'change'
        }],
        skuid: [{
          required: true, validator: (rule, value, callback) => {
            const reg = /^[a-zA-Z0-9]+$/
            if (this.autoSku || (value && reg.test(value))) {
              callback()
            } else {
              callback(new Error('请输入正确的商品SKU，只能包含字母以及数字'))
            }
          }, trigger: 'change'
        }],
        name: [{
          required: true, validator: validateValue, trigger: 'change'
        }],
        category: [{
          required: true, validator: validateValue, trigger: 'change'
        }],
        price: [{
          required: true, validator: (rule, value, callback) => {
            if (this.isAdminUser) {
              if (isNumber(value) && value > 0) {
                callback()
              } else {
                callback(new Error('请输入商品销售价'))
              }
            } else {
              callback()
            }
          }, trigger: 'change'
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      isWatcherUser: 'isWatcherUser',
      productVendors: 'productVendors',
      vendorId: 'vendorId'
    }),
    loadingMessage: {
      get() {
        return this.uploading ? '正在上传图片...' + this.uploadPercent + '%' : '正在加载中...'
      }
    },
    vendorOptions() {
      // Filter vendor Aoyi
      return this.productVendors.filter(item => item.value !== this.vendorAoyi)
    },
    viewProduct() {
      return this.opType === OP_VIEW
    },
    createProduct() {
      return this.opType === OP_CREATE
    },
    editProduct() {
      return this.opType === OP_EDIT
    },
    floorPrice() {
      if (this.productForm.sprice) {
        const sprice = Number.parseFloat(this.productForm.sprice)
        return (sprice * this.floorPriceRate).toFixed(2).toString()
      } else {
        return '无进货价格'
      }
    },
    productCover() {
      if (this.productForm.image !== null) {
        return this.productForm.image
      } else {
        return this.thumbnailUrls.length > 0 ? this.thumbnailUrls[0] : null
      }
    },
    hasCustomCover() {
      const thumbnail = this.thumbnailUrls.length > 0 ? this.thumbnailUrls[0] : null
      return this.productForm.image != null ? thumbnail === null || this.productForm.image !== thumbnail : false
    },
    isVirtualProduct: {
      get() {
        return this.productForm.type === 1
      }
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
      if (this.productVendors.length === 0) {
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
      if (this.productVendors.length > 0 && vendorId != null) {
        const vendor = this.productVendors.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    getProductInfo() {
      const params = {
        offset: 1,
        limit: 1
      }
      if (this.$route.params.mpu) {
        params.mpu = this.$route.params.mpu
      } else {
        params.id = this.$route.params.id
      }
      if (!this.isAdminUser && !this.isWatcherUser) {
        params.merchantId = this.vendorId
      }
      this.loading = true
      searchProductsApi(params).then(async response => {
        const data = response.data.result
        if (data.total === 1) {
          this.productInfo = data.list[0]
          Object.keys(this.productForm).forEach(key => {
            if (key in this.productInfo) {
              if (key !== 'price' && key !== 'sprice' && key !== 'weight') {
                this.productForm[key] = this.productInfo[key]
              } else {
                const value = Number.parseFloat(this.productInfo[key])
                this.productForm[key] = Number.isNaN(value) ? null : value
              }
            }
          })

          this.thumbnails = []
          this.thumbnailUrls = []
          if (!isEmpty(this.productForm.imagesUrl)) {
            this.thumbnails = this.productForm.imagesUrl.split(':')
            this.thumbnailUrls = this.thumbnails.map(img => this.$store.getters.cosUrl + img)
            // Check if has custom cover image
            if (this.productForm.image !== null && this.productForm.image === this.thumbnailUrls[0]) {
              this.productForm.image = null
            }
          }
          this.hasCoverImage = this.productForm.image !== null

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
          if (this.productForm.type === 1) {
            await this.getVirtualProductInfo(this.productForm.mpu)
          }
          this.getCategoryName(this.productForm.category)
        } else {
          this.$message.warning('获取商品失败，请联系管理员！')
        }
      }).catch(error => {
        console.log('getProductInfo:' + error)
      }).finally(() => {
        this.loading = false
      })
    },
    async getVirtualProductInfo(mpu) {
      try {
        const { code, data } = await findVirtualProductInfoApi({ mpu })
        if (code === 200) {
          const virtualProduct = data.result
          this.virtualProductInfo = { ...virtualProduct }
          this.virtualProductForm.id = virtualProduct.id
          this.virtualProductForm.effectiveDays = virtualProduct.effectiveDays
          this.virtualProductForm.parValue = virtualProduct.parValue
          this.alwaysEffective = virtualProduct.effectiveDays === -1
        }
      } catch (e) {
        console.warn('Get virtual product info error: ' + e)
      }
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
            return { value: brand.brandId, label: (name || brand.brandName) }
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
      if (this.thirdCategoryValue &&
        Number.isSafeInteger(this.thirdCategoryValue)) {
        this.productForm.category = this.thirdCategoryValue.toString()
        this.$refs.productForm.validateField(['category'])
      } else {
        this.productForm.category = null
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
      if (this.productForm.sprice > 0 &&
        this.productForm.price > 0 &&
        this.productForm.sprice > this.productForm.price) {
        this.$message.warning('商品的销售价必须大于进货价，请仔细检查！')
        return
      }
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          const formData = { ...this.productForm }
          formData.name = trim(formData.name)
          formData.imagesUrl = this.thumbnails.length > 0 ? this.thumbnails.join(':') : ''
          formData.introductionUrl = this.introductions.length > 0 ? this.introductions.join(':') : ''
          if (formData.image === null && this.hasCoverImage) {
            formData.image = ''
          }
          if (this.createProduct) {
            this.handleCreateProduct(formData)
          } else {
            this.handleUpdateProduct(formData)
          }
        } else {
          this.$message.warning('商品信息不完整，请仔细检查！')
        }
      })
    },
    async handleCreateVirtualProduct(mpu) {
      let ret = false
      try {
        const params = { mpu }
        if (this.alwaysEffective) {
          params.effectiveDays = -1
        } else {
          params.effectiveDays = this.virtualProductForm.effectiveDays > 0 ? this.virtualProductForm.effectiveDays : -1
        }
        params.parValue = this.virtualProductForm.parValue > 0 ? this.virtualProductForm.parValue : 0

        const { code } = await createVirtualProductApi(params)
        if (code === 200) {
          ret = true
        }
      } catch (e) {
        console.warn('Create virtual product error: ' + e)
      }
      return ret
    },
    async handleCreateProduct(formData) {
      try {
        const params = {}
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null) {
            if (key !== 'price' && key !== 'sprice') {
              params[key] = formData[key]
            } else {
              if (formData[key] > 0) {
                params[key] = formData[key].toString()
              }
            }
          }
        })
        if (!this.isAdminUser) {
          params.merchantId = this.vendorId
        }
        if (this.autoSku) {
          params.skuid = ''
        }
        this.loading = true
        const { code, msg, data } = await createProductApi(params)
        if (code === 200) {
          let suc = true
          if (this.isVirtualProduct) {
            const mpu = data.result
            suc = await this.handleCreateVirtualProduct(mpu)
          }
          if (suc) {
            this.$message({ message: '创建产品信息成功。', type: 'success' })
            this.goBack()
          } else {
            this.$message.error(msg || '创建商品信息失败，请联系管理员！')
          }
        } else {
          this.$message.error(msg || '创建商品信息失败，请联系管理员！')
        }
      } catch (e) {
        console.warn('Create product error: ' + e)
        this.$message.error('创建产品信息失败！')
      } finally {
        this.loading = false
      }
    },
    async handleUpdateVirtualProduct() {
      let ret = false
      try {
        const params = { ...this.virtualProductForm }
        if (this.alwaysEffective) {
          params.effectiveDays = -1
        } else {
          params.effectiveDays = this.virtualProductForm.effectiveDays > 0 ? this.virtualProductForm.effectiveDays : -1
        }
        params.parValue = this.virtualProductForm.parValue > 0 ? this.virtualProductForm.parValue : 0

        const { code } = await updateVirtualProductApi(params)
        if (code === 200) {
          ret = true
        }
      } catch (e) {
        console.warn('Create virtual product error: ' + e)
      }
      return ret
    },
    handleUpdateProduct(formData) {
      let changed = false
      let virtualCreate = false
      let virtualChanged = false
      const params = {
        id: formData.id
      }
      const filterForm = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          if (key !== 'price' && key !== 'sprice' && key !== 'weight') {
            filterForm[key] = formData[key]
          } else {
            if (formData[key] > 0) {
              filterForm[key] = formData[key].toString()
            }
          }
        }
      })
      Object.keys(filterForm).forEach(key => {
        if (this.productInfo[key] !== filterForm[key]) {
          params[key] = filterForm[key]
          changed = true
        }
      })
      // remove sprice if product form has not contain sprice field
      const sprice = Number.parseFloat(this.productInfo.sprice)
      if (!Number.isNaN(sprice)) {
        const hasSprice = 'sprice' in filterForm
        if (!hasSprice) {
          params.sprice = ''
          changed = true
        }
      }
      if (this.virtualProductForm.id !== null) {
        const effectiveDays = this.alwaysEffective ? -1 : this.virtualProductForm.effectiveDays
        if (this.virtualProductForm.parValue !== this.virtualProductInfo.parValue ||
          effectiveDays !== this.virtualProductInfo.effectiveDays) {
          virtualChanged = true
        }
      } else {
        if (this.isVirtualProduct) {
          virtualCreate = true
        }
      }
      if (changed || virtualChanged || virtualCreate) {
        this.$confirm('请确定是否修改此商品的信息？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          try {
            let suc = false
            this.loading = true
            if (changed) {
              const { code } = await updateProductApi(params)
              if (code === 200) {
                suc = true
              }
            }
            if (virtualCreate) {
              suc = await this.handleCreateVirtualProduct(this.productForm.mpu)
            }
            if (virtualChanged) {
              suc = await this.handleUpdateVirtualProduct()
            }
            if (suc) {
              this.$message({ message: '更新产品信息成功。', type: 'success' })
              this.goBack()
            } else {
              this.$message.error('更新产品信息失败，请联系管理员')
            }
          } catch (e) {
            console.log('updateProductInfo:' + e)
          } finally {
            this.loading = false
          }
        }).catch(() => {
        })
      } else {
        this.goBack()
      }
    },
    handleRemoveCoverImage() {
      this.$confirm('删除此商品的封面图，将以第一张主图作为封面图，是否继续此操作？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.productForm.image = null
      }).catch(() => {
      })
    },
    handleUploadCoverSuccess(res) {
      this.$refs.coverUpload.clearFiles()
      this.loading = false
      this.uploading = false
      this.productForm.image = this.$store.getters.cosUrl + res.data.url
    },
    sortByFileName(fileList) {
      return sortBy(fileList, [file => {
        const regex = /\d+/g
        const found = regex.exec(file.name)
        if (found) {
          return Number.parseInt(found[0])
        } else {
          return 0
        }
      }])
    },
    handleUploadThumbnailSuccess(res, file, fileList) {
      const sucList = fileList.filter(item => item.status === 'success')
      if (sucList.length === fileList.length) {
        const sortList = this.sortByFileName(sucList)
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
          const sortList = this.sortByFileName(sucList)
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
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        this.$message.warning('上传的图片大小超过1M，请裁剪或者优化图片，重新上传！')
        return false
      }
      this.uploadPercent = 0
      this.loading = true
      this.uploading = true
      return true
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

</style>
