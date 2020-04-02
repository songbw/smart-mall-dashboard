<template>
  <div class="app-container">
    <el-steps :active="activeStep" align-center style="margin-bottom: 20px">
      <el-step title="商品信息" />
      <el-step title="商品图片" />
      <el-step title="其他属性（只读）" />
    </el-steps>
    <el-form
      v-if="activeStep === 0"
      ref="productForm"
      v-loading="loading"
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
      <el-form-item v-if="hasVendorPermission" label="商品供应商" prop="merchantId">
        <vendor-selection
          v-if="createProduct"
          :vendor-id="productForm.merchantId ? productForm.merchantId.toString() : null"
          @changed="handleMerchantChanged"
        />
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
            maxlength="15"
            style="width: 350px;margin-left: 10px"
          />
        </div>
        <span v-else>{{ productForm.skuid }}</span>
        <span v-if="productForm.merchantId === vendorAoyi" style="font-size: 12px;margin-left: 10px">
          <i class="el-icon-warning-outline">
            奥弋商品SKU规则：以10开始为奥弋自营，20开始为苏宁易购，30开始为唯品会，50开始为天猫精选，60开始为京东
          </i>
        </span>
      </el-form-item>
      <el-form-item v-if="!createProduct" label="商品状态">
        <span>{{ productForm.state | productState }}</span>
      </el-form-item>
      <el-form-item label="商品类型">
        <span v-if="viewProduct"> {{ productForm.type | typeFilter }}</span>
        <div v-else>
          <el-radio-group v-model="productForm.type">
            <el-radio
              v-for="item in typeOptions"
              :key="'type- ' + item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <span v-if="viewProduct">{{ productForm.name }}</span>
        <el-input v-else v-model="productForm.name" maxlength="100" />
      </el-form-item>
      <el-form-item label="商品副标题" prop="subTitle">
        <span v-if="viewProduct">{{ productForm.subTitle }}</span>
        <el-input v-else v-model="productForm.subTitle" maxlength="100" />
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
      <el-form-item v-if="couldUpdateInventory" label="商品库存">
        <span v-if="viewProduct"> {{ productForm.inventory }}</span>
        <el-input-number v-else v-model="productForm.inventory" :min="0" :max="100000000" step-strictly />
      </el-form-item>
      <el-form-item label="商品税率" prop="taxRate">
        <span v-if="viewProduct">
          {{ getTaxRate(productForm.taxRate) }}
        </span>
        <el-select
          v-else
          v-model="productForm.taxRate"
          clearable
        >
          <el-option
            v-for="item in taxRateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对比商品链接" prop="model">
        <span v-if="viewProduct"> {{ productForm.compareUrl }}</span>
        <el-input v-else v-model="productForm.compareUrl" maxlength="100" />
      </el-form-item>
      <el-divider v-if="productForm.merchantId !== vendorAoyi" content-position="left">商品物流</el-divider>
      <el-form-item v-if="productForm.merchantId !== vendorAoyi" label="包邮模板">
        <router-link
          v-if="freeShippingData"
          :to="{ name: 'ViewFreeShipping', params: { id: freeShippingData.id }}"
          class="el-link el-link--primary is-underline"
        >
          {{ freeShippingData.name }}
        </router-link>
        <span v-else>未设置包邮模板</span>
        <el-button
          v-if="!viewProduct"
          type="info"
          size="mini"
          style="margin-left: 10px"
          @click="$router.push({name: 'FreeShipping'})"
        >
          去修改
        </el-button>
        <span v-if="freeShippingData && freeShippingData.merchantId === 0" style="margin-left: 10px;">
          <i class="el-icon-warning-outline">目前使用平台默认包邮模板</i>
        </span>
      </el-form-item>
      <el-form-item v-if="productForm.merchantId !== vendorAoyi" label="运费模板">
        <router-link
          v-if="shippingPriceData"
          :to="{ name: 'ViewShippingPrice', params: { id: shippingPriceData.id }}"
          class="el-link el-link--primary is-underline"
        >
          {{ shippingPriceData.name }}
        </router-link>
        <span v-else>未设置运费模板</span>
        <el-button
          v-if="!viewProduct"
          :loading="shippingPriceLoading"
          type="primary"
          size="mini"
          style="margin-left: 10px"
          @click="shippingPriceDialogVisible = true"
        >
          选择模板
        </el-button>
        <el-button
          v-if="!viewProduct && shippingPriceData !== null"
          :loading="shippingPriceLoading"
          type="danger"
          size="mini"
          style="margin-left: 10px"
          @click="handleRemoveMpuShippingPrice"
        >
          清除模板
        </el-button>
        <el-button
          v-if="!viewProduct"
          type="info"
          size="mini"
          @click="$router.push({name: 'ShippingPrice'})"
        >
          去修改
        </el-button>
        <span
          v-if="!createProduct && mpuShippingPriceId === null && shippingPriceData !== null"
          style="margin-left: 10px;"
        >
          <i class="el-icon-warning-outline">目前使用平台默认运费模板</i>
        </span>
      </el-form-item>
      <el-form-item v-if="productForm.merchantId !== vendorAoyi" label="商品重量(公斤)">
        <span v-if="viewProduct"> {{ productForm.weight }}</span>
        <el-input-number
          v-else
          v-model="productForm.weight"
          :precision="3"
          :step="1"
          :min="0"
          :max="1000000"
        />
      </el-form-item>
      <el-divider content-position="left">商品价格</el-divider>
      <el-form-item v-if="hasSalePricePermission" label="销售价格(元)" prop="price">
        <span v-if="viewProduct"> {{ productForm.price }}</span>
        <el-input-number
          v-else
          v-model="productForm.price"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
      </el-form-item>
      <el-form-item v-if="hasSalePricePermission && hasCostPricePermission" label="销售参考价(元)">
        <span style="margin-right: 10px"> {{ suggestPrice }}</span>
        <el-input-number v-model="suggestPriceRate" :precision="2" :step="0.05" :min="1" :max="10" />
        <span style="font-size: 12px;margin-left: 10px;"><i class="el-icon-warning-outline">基于销售底价的比率</i></span>
      </el-form-item>
      <el-form-item v-if="hasSalePricePermission" label="销售底价(元)">
        <span style="margin-right: 10px"> {{ floorPrice }}</span>
        <el-input-number
          v-if="!viewProduct"
          v-model="productForm.floorPrice"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
        <span style="font-size: 12px;margin-left: 10px;">
          <i class="el-icon-warning-outline">基于进货价、供应商发票类型以及商品税率</i>
        </span>
      </el-form-item>
      <el-form-item v-if="hasCostPricePermission && !hasSubSku" label="进货价格(元)" prop="sprice">
        <span v-if="viewProduct"> {{ productForm.sprice }}</span>
        <el-input-number v-else v-model="productForm.sprice" :precision="2" :step="1" :min="0" :max="1000000" />
      </el-form-item>
      <el-form-item v-if="hasSalePricePermission" label="对比价格(元)">
        <span v-if="viewProduct"> {{ productForm.comparePrice }}</span>
        <el-input-number v-else v-model="productForm.comparePrice" :precision="2" :step="1" :min="0" :max="1000000" />
      </el-form-item>
      <el-divider v-if="hasProperties" content-position="left">商品规格</el-divider>
      <el-form v-if="hasProperties" label-width="13rem" inline>
        <el-form-item
          v-for="prop in productInfo.properties"
          :key="prop.id"
          :label="prop.name"
        >
          <el-input :value="prop.val" readonly />
        </el-form-item>
      </el-form>
      <el-divider v-if="hasSubSku" content-position="left">商品品种</el-divider>
      <el-form-item v-if="hasSubSku" label-width="0">
        <el-button-group v-if="hasUpdatePermission">
          <el-button
            :disabled="subSkuSoldOutSelection.length === 0"
            type="success"
            @click="handleSubSkuSelectionOnSale"
          >
            上架已选{{ subSkuSoldOutSelection.length }}个品种
          </el-button>
          <el-button
            :disabled="subSkuOnSaleSelection.length === 0"
            type="warning"
            @click="handleSubSkuSelectionSoldOut"
          >
            下架已选{{ subSkuOnSaleSelection.length }}个品种
          </el-button>
        </el-button-group>
        <el-table
          ref="subSkuTable"
          :data="subSkuList"
          fit
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            column-key="selection"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column label="品种图" align="center" width="120">
            <template slot-scope="scope">
              <img v-if="scope.row.goodsLogo" :src="scope.row.goodsLogo" class="thumb-image" alt="">
            </template>
          </el-table-column>
          <el-table-column label="品种编码" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column label="品种SKU" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.skuId }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="couldRefreshInventory" label="品种库存" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.inventory }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售价(元)" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.price | centFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column label="进货价(元)" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.sprice | centFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column label="建议销售价(元)" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.advisePrice | centFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规格" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.propertyList && scope.row.propertyList.length > 0">
                <el-tag
                  v-for="prop in scope.row.propertyList"
                  :key="prop.id"
                  type="info"
                >
                  {{ prop.val }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.status | subSkuStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="hasUpdatePermission" label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                v-if="!viewProduct"
                size="mini"
                type="warning"
                @click="handleEditSubSkuPrice(scope.$index)"
              >
                编辑
              </el-button>
              <el-button
                v-if="scope.row.status !== 1"
                size="mini"
                type="danger"
                @click="handleSubSkuOnSale(scope.$index)"
              >
                上架
              </el-button>
              <el-button
                v-else
                size="mini"
                type="danger"
                @click="handleSubSkuSoldOut(scope.$index)"
              >
                下架
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <el-form
      v-if="activeStep === 1"
      v-loading="loading"
      :model="productForm"
      :rules="formRules"
      :element-loading-text="loadingMessage"
      element-loading-spinner="el-icon-loading"
      label-position="right"
      label-width="200px"
    >
      <el-form-item label="商品封面图">
        <template>
          <image-upload
            :image-url="productCover"
            :path-name="uploadCoverData.pathName"
            :view-only="viewImageOnly"
            button-size="normal"
            image-width="200px"
            tip="如果未上传，将以第一张主图作为封面图。"
            button-name="修改封面图"
            @success="handleUploadCoverSuccess"
          />
          <el-button
            v-if="hasCustomCover && !viewImageOnly"
            type="danger"
            icon="el-icon-delete"
            style="margin-top: 10px"
            @click="handleRemoveCoverImage"
          >
            删除封面图
          </el-button>
        </template>
      </el-form-item>
      <el-form-item label="商品主图">
        <template>
          <div v-if="!viewImageOnly">
            <input
              ref="thumbnailUpload"
              class="image-upload-input"
              type="file"
              accept=".png, .jpeg, .jpg"
              :multiple="true"
              @change="handleThumbnailFileChange"
            >
            <el-button
              :disabled="thumbnails.length >= maxThumbnailLength"
              type="primary"
              icon="el-icon-picture"
              @click="handleThumbnailSelect"
            >
              添加主图
            </el-button>
            <div>
              <i class="el-icon-warning-outline" style="font-size: 12px;">
                请选择商品的主图，最多支持{{ maxThumbnailLength }}个
              </i>
            </div>
          </div>
          <el-row v-if="thumbnailUrls.length > 0">
            <el-col
              v-for="(imgUrl, index) in thumbnailUrls.slice(0, 5)"
              :key="'thumbnail-0-' + index"
              :span="4"
              :offset="index > 0 ? 1 : 0"
            >
              <custom-thumbnail
                :could-edit="!viewImageOnly"
                :image-url="imgUrl"
                :index="index"
                :length="thumbnailUrls.length"
                :bucket="thumbnailUploadPath"
                @sortThumbnail="handleSortThumbnail"
                @deleteThumbnail="handleDeleteThumbnail"
                @uploadSuccess="handleUploadThumbnailIndexSuccess"
              />
            </el-col>
          </el-row>
          <el-row v-if="thumbnailUrls.length > 5" style="margin-top: 10px">
            <el-col
              v-for="(imgUrl, index) in thumbnailUrls.slice(5)"
              :key="'thumbnail-1-' + index"
              :span="4"
              :offset="index > 0 ? 1 : 0"
            >
              <custom-thumbnail
                :could-edit="!viewImageOnly"
                :image-url="imgUrl"
                :index="5 + index"
                :length="thumbnailUrls.length"
                :bucket="thumbnailUploadPath"
                @sortThumbnail="handleSortThumbnail"
                @deleteThumbnail="handleDeleteThumbnail"
                @uploadSuccess="handleUploadThumbnailIndexSuccess"
              />
            </el-col>
          </el-row>
        </template>
      </el-form-item>
      <el-form-item label="商品描述图">
        <template>
          <div v-if="!viewImageOnly">
            <el-radio-group v-model="newIntroductionType" style="display: block;margin: 10px 0">
              <el-radio :label="1">正常详情图</el-radio>
              <el-radio :label="2">头部详情图</el-radio>
              <el-radio :label="3">尾部详情图</el-radio>
            </el-radio-group>
            <input
              ref="introductionUpload"
              class="image-upload-input"
              type="file"
              accept=".png, .jpeg, .jpg"
              :multiple="true"
              @change="handleIntroductionFileChange"
            >
            <el-button
              :disabled="introductions.length >= maxIntroductionLength"
              type="primary"
              icon="el-icon-picture"
              @click="handleIntroductionSelect"
            >
              添加详情图
            </el-button>
            <div>
              <i class="el-icon-warning-outline" style="font-size: 12px;">
                请选择商品的详情图，最多支持{{ maxIntroductionLength }}个
              </i>
            </div>
          </div>
          <div v-for="(img, index) in introductionUrls" :key="'introduction' + index" style="padding: 14px">
            <custom-introduction
              :could-edit="!viewImageOnly"
              :image-url="img"
              :index="index"
              :length="introductions.length"
              :bucket="introductionUploadPath"
              @sortIntroduction="handleSortIntroduction"
              @deleteIntroduction="handleDeleteIntroduction"
              @uploadSuccess="handleUploadIntroductionIndexSuccess"
            />
          </div>
        </template>
      </el-form-item>
    </el-form>

    <el-form
      v-if="activeStep === 2"
      label-position="right"
      label-width="200px"
    >
      <el-form-item label="商品介绍">
        <p v-if="productInfo.introduction" v-html="productInfo.introduction" />
        <div v-else>暂无介绍</div>
      </el-form-item>
    </el-form>

    <el-form>
      <el-divider />
      <el-form-item>
        <div style="display: flex;justify-content: space-between">
          <el-button type="primary" @click="goBack">返回</el-button>
          <el-button-group>
            <el-button :disabled="activeStep === 0" type="info" @click="handlePrevStep">
              上一步
            </el-button>
            <el-button :disabled="activeStep === 2" type="danger" @click="handleNextStep">
              {{ viewProduct ? '下一步' : '保存并下一步' }}
            </el-button>
            <el-button :disabled="activeStep < 2" type="success" @click="goBack">
              完成
            </el-button>
          </el-button-group>
        </div>
      </el-form-item>
    </el-form>
    <shipping-price-selection
      :mpu-list="productForm.mpu !== null ? [productForm.mpu] : []"
      :dialog-visible="shippingPriceDialogVisible"
      @onCancelled="shippingPriceDialogVisible = false"
      @onConfirmed="handleConfirmShippingPrice"
    />
    <sub-sku-info
      :dialog-visible="subSkuDialogVisible"
      :sub-sku="editSubSku"
      @cancelled="subSkuDialogVisible = false"
      @confirmed="handleUpdateSubSkuPrice"
    />
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
  getDetailInfoByMpuApi,
  updateSubSkuApi,
  getInventoryBySkuCodesApi,
  batchUpdateStateApi
} from '@/api/products'
import { searchBrandsApi } from '@/api/brands'
import CustomThumbnail from './customThumbnail'
import CustomIntroduction from './customIntroduction'
import CategorySelection from '@/components/CategorySelection'
import ImageUpload from '@/components/ImageUpload'
import VendorSelection from '@/components/VendorSelection'
import ShippingPriceSelection from './shippingPriceSelection'
import {
  max_upload_image_size,
  ProductStateOptions,
  product_default_tax_rate,
  ProductTaxRateOptions,
  vendor_invoice_type_special,
  ProductTypeOptions,
  product_sub_sku_sold_out,
  product_sub_sku_on_sale,
  ProductSubSkuStatusOptions,
  product_state_on_sale,
  product_state_off_shelves
} from '@/utils/constants'
import {
  getMerchantFreeShippingApi,
  getMpuShippingPriceApi,
  setMpuShippingPriceApi,
  deleteMpuShippingPriceApi
} from '@/api/freight'
import { ProductPermissions } from '@/utils/role-permissions'
import { cosUploadFiles } from '@/utils/cos'
import { validateURL } from '@/utils/validate'
import { scrollTo } from '@/utils/scroll-to'
import SubSkuInfo from './subSkuInfo'

const decode = require('unescape')

const vendorAoyi = 2
const vendorYiyatong = 4

const OP_VIEW = 1
const OP_EDIT = 2
const OP_CREATE = 3

const floatToFixed = (value, precision) =>
  parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision))

const convertToNumber = value => isNumber(value) ? value : Number.parseFloat(value)

const imageKeys = ['image', 'imagesUrl', 'introductionUrl']
const notUpdateKeys = ['mpu', 'introduction', 'createdAt', 'state']

export default {
  name: 'ProductDetail',
  components: {
    CustomIntroduction,
    CustomThumbnail,
    CategorySelection,
    ShippingPriceSelection,
    ImageUpload,
    VendorSelection,
    SubSkuInfo
  },
  filters: {
    productState: state => {
      const value = isNumber(state) ? state : Number.parseInt(state)
      if (Number.isNaN(value)) {
        return state
      } else {
        const find = ProductStateOptions.find(option => option.value === value)
        return find ? find.label : state
      }
    },
    subSkuStatus: status => {
      const value = isNumber(status) ? status : Number.parseInt(status)
      if (Number.isNaN(value)) {
        return status
      } else {
        const find = ProductSubSkuStatusOptions.find(option => option.value === value)
        return find ? find.label : status
      }
    },
    typeFilter: type => {
      const find = ProductTypeOptions.find(item => item.value === type)
      return find ? find.label : ''
    },
    dateFormat: date => {
      if (isEmpty(date)) {
        return ''
      } else {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(date)
        return momentDate.isValid() ? momentDate.format(format) : date
      }
    },
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        return (yuan / 100).toFixed(2)
      }
    }
  },
  data() {
    this.productInfo = null
    const validateValue = (rule, value, callback) => {
      if (value === null || value === '') {
        switch (rule.field) {
          case 'merchantId':
            if (this.hasVendorPermission) {
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
      taxRateOptions: ProductTaxRateOptions,
      typeOptions: ProductTypeOptions,
      vendorAoyi: vendorAoyi,
      maxThumbnailLength: 10,
      maxIntroductionLength: 30,
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
      suggestPriceRate: 1.1,
      shippingPriceDialogVisible: false,
      freeShippingData: null,
      shippingPriceLoading: false,
      shippingPriceData: null,
      mpuShippingPriceId: null,
      hasCoverImage: false,
      toUploadFiles: [],
      uploadedFiles: [],
      failedFiles: [],
      thumbnails: [],
      thumbnailUrls: [],
      newIntroductionType: 1, // 1 for normal, 2 for head, 3 for tail
      introductions: [],
      introductionUrls: [],
      activeStep: 0,
      subSkuDialogVisible: false,
      editSubSku: {},
      subSkuOnSaleSelection: [],
      subSkuSoldOutSelection: [],
      productInfo: null,
      productForm: {
        id: null,
        merchantId: null,
        skuid: null,
        state: null,
        type: 0,
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
        subTitle: null,
        compareUrl: null,
        comparePrice: null,
        taxRate: product_default_tax_rate,
        floorPrice: null
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
            if (this.hasSalePricePermission) {
              if (isNumber(value) && value > 0) {
                callback()
              } else {
                callback(new Error('请输入商品销售价'))
              }
            } else {
              callback()
            }
          }, trigger: 'change'
        }],
        sprice: [{
          required: true, validator: (rule, value, callback) => {
            if (this.hasCostPricePermission && !this.hasSubSku) {
              if (isNumber(value) && value > 0) {
                callback()
              } else {
                callback(new Error('请输入商品进货价'))
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
      userPermissions: 'userPermissions',
      productVendors: 'productVendors',
      vendorId: 'vendorId'
    }),
    hasCreatePermission() {
      return this.userPermissions.includes(ProductPermissions.create)
    },
    hasUpdatePermission() {
      return this.userPermissions.includes(ProductPermissions.update)
    },
    hasSalePricePermission() {
      return this.userPermissions.includes(ProductPermissions.salePrice)
    },
    hasCostPricePermission() {
      return this.userPermissions.includes(ProductPermissions.costPrice)
    },
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    },
    loadingMessage: {
      get() {
        return this.uploading ? '正在上传图片...' + this.uploadPercent + '%' : '正在加载中...'
      }
    },
    viewProduct() {
      return this.opType === OP_VIEW
    },
    createProduct() {
      return this.opType === OP_CREATE && this.productForm.id === null
    },
    editProduct() {
      return this.opType === OP_EDIT
    },
    viewImageOnly() {
      return this.opType === OP_VIEW || this.productForm.merchantId === vendorYiyatong
    },
    couldUpdateInventory() {
      return this.productForm.merchantId !== vendorYiyatong && this.productForm.merchantId !== vendorAoyi
    },
    couldRefreshInventory() {
      return this.opType !== OP_CREATE && this.productForm.merchantId === vendorYiyatong
    },
    floorPrice: {
      get() {
        if (this.productForm.floorPrice >= 0) {
          return this.productForm.floorPrice
        } else {
          if (this.productForm.merchantId !== null && this.productForm.sprice > 0) {
            const vendor = this.productVendors.find(item => item.value === this.productForm.merchantId.toString())
            const taxRate = floatToFixed(Number.parseFloat(this.productForm.taxRate), 2)
            if (vendor !== null && taxRate >= 0) {
              const invoiceType = vendor.invoiceType
              const value = this.productForm.sprice *
                (invoiceType === vendor_invoice_type_special ? (1.13 - taxRate) : 1.13)
              return floatToFixed(value, 2)
            } else {
              return this.productForm.sprice
            }
          } else {
            return 0
          }
        }
      },
      set(value) {
        this.productForm.floorPrice = value
      }
    },
    suggestPrice() {
      const sprice = convertToNumber(this.floorPrice)
      if (!Number.isNaN(sprice)) {
        return floatToFixed(sprice * this.suggestPriceRate, 2).toString()
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
    hasSubSku() {
      return this.productInfo &&
        Array.isArray(this.productInfo.skuList) &&
        this.productInfo.skuList.length > 0
    },
    subSkuList() {
      return this.hasSubSku ? this.productInfo.skuList : []
    },
    hasProperties() {
      return this.productInfo &&
        Array.isArray(this.productInfo.properties) &&
        this.productInfo.properties.length > 0
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
          await this.$store.dispatch('products/getVendorList')
        } catch (e) {
          console.warn('Product get vendor list error:' + e)
        } finally {
          this.loading = false
        }
      }
    },
    getVendorName(vendorId) {
      if (this.productVendors.length > 0 && vendorId != null) {
        const vendor = this.productVendors.find(option => option.value === vendorId.toString())
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    async getInventoryBySkuCodes(skuList) {
      try {
        const codeList = skuList.map(item => item.code)
        const params = {
          codes: codeList.join(',')
        }
        const { code, data } = await getInventoryBySkuCodesApi(params)
        if (code === 200) {
          for (const skuItem of data.skuInvList) {
            const find = skuList.find(item => item.code === skuItem.code)
            if (find) {
              find.inventory = skuItem.inventoryCount
            }
          }
        }
      } catch (e) {
        console.warn('Get inventory by sku codes error:' + e)
      }
      return skuList
    },
    async getDetailInfo(mpu) {
      try {
        const { code, data } = await getDetailInfoByMpuApi({ mpu })
        if (code === 200) {
          const prod = data.result
          if (prod.introductionUrl === null) {
            prod.introductionUrl = ''
          }
          if (prod.imagesUrl === null) {
            prod.imagesUrl = ''
          }
          prod.introduction = decode(prod.introduction)
          if (prod.merchantId === vendorYiyatong &&
            Array.isArray(prod.skuList) &&
            prod.skuList.length > 0) {
            prod.skuList = await this.getInventoryBySkuCodes(prod.skuList)
          }
          return prod
        }
      } catch (e) {
        console.warn('Get product detail info error:' + e)
      }
      return null
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
      if (!this.hasVendorPermission) {
        params.merchantId = this.vendorId
      }
      this.loading = true
      searchProductsApi(params).then(async response => {
        const data = response.data.result
        if (data.total >= 1) {
          const mpu = data.list[0].mpu
          this.productInfo = await this.getDetailInfo(mpu)
          Object.keys(this.productForm).forEach(key => {
            if (key in this.productInfo) {
              switch (key) {
                case 'price':
                case 'sprice':
                case 'floorPrice':
                case 'comparePrice': {
                  const value = convertToNumber(this.productInfo[key])
                  this.productForm[key] = Number.isNaN(value) ? 0 : floatToFixed(value, 2)
                  break
                }
                case 'weight': {
                  const value = convertToNumber(this.productInfo[key])
                  this.productForm[key] = Number.isNaN(value) ? 0 : floatToFixed(value, 3)
                  break
                }
                default:
                  this.productForm[key] = this.productInfo[key]
              }
            }
          })
          const imageSep = this.productForm.merchantId === vendorYiyatong ? ';' : ':'
          this.thumbnails = []
          this.thumbnailUrls = []
          if (!isEmpty(this.productForm.imagesUrl)) {
            this.thumbnails = this.productForm.imagesUrl.split(imageSep)
            this.thumbnailUrls = this.thumbnails.map(
              img => validateURL(img) ? img : this.$store.getters.cosUrl + img)
            // Check if has custom cover image
            if (this.productForm.image !== null && this.productForm.image === this.thumbnailUrls[0]) {
              this.productForm.image = null
            }
          }
          this.hasCoverImage = this.productForm.image !== null

          this.introductions = []
          this.introductionUrls = []

          if (!isEmpty(this.productForm.introductionUrl)) {
            this.introductions = this.productForm.introductionUrl.split(imageSep)
            this.introductionUrls = this.introductions.map(
              img => validateURL(img) ? img : this.$store.getters.cosUrl + img)
          }

          this.uploadCoverData.pathName = this.productInfo.id + '/CoverU'
          this.thumbnailUploadPath = this.productInfo.id + '/ZTU'
          this.uploadThumbnailData.pathName = this.thumbnailUploadPath
          this.introductionUploadPath = this.productInfo.id + '/XTU'
          this.uploadIntroductionData.pathName = this.introductionUploadPath
          this.getCategoryName(this.productForm.category)
          this.getMerchantFreeShipping(this.productForm.merchantId)
          this.getMpuShippingPrice(this.productForm.mpu)
        } else {
          this.$message.warning('获取商品失败，请联系管理员！')
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
      this.productForm.merchantId = Number.parseInt(value)
      this.getMerchantFreeShipping(this.productForm.merchantId)
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
    handlePrevStep() {
      this.activeStep--
      scrollTo(0, 300)
    },
    handleNextStep() {
      if (this.viewProduct) {
        this.activeStep++
        scrollTo(0, 300)
      } else {
        if (this.activeStep === 0) {
          this.handleSubmitInfo()
        } else if (this.activeStep === 1) {
          if (this.viewImageOnly) {
            this.activeStep++
            scrollTo(0, 300)
          } else {
            this.handleUpdateImages()
          }
        }
      }
    },
    handleUpdateImages() {
      const formData = {
        id: this.productForm.id,
        image: this.productForm.image,
        imagesUrl: this.thumbnails.length > 0 ? this.thumbnails.join(':') : '',
        introductionUrl: this.introductions.length > 0 ? this.introductions.join(':') : ''
      }
      if (formData.image === null && this.hasCoverImage) {
        formData.image = ''
      }
      if (this.hasUpdatePermission) {
        this.handleUpdateProduct(formData)
      } else {
        this.$message.warning('没有修改商品权限，请联系管理员！')
      }
    },
    handleSubmitInfo() {
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          const keys = Object.keys(this.productForm).filter(key => !imageKeys.includes(key))
          const formData = {}
          for (const key of keys) {
            formData[key] = this.productForm[key]
          }
          formData.name = trim(formData.name)

          if (this.createProduct) {
            if (this.hasCreatePermission) {
              delete formData.id
              delete formData.mpu
              this.handleCreateProduct(formData)
            } else {
              this.$message.warning('没有创建商品权限，请联系管理员！')
            }
          } else {
            if (this.hasUpdatePermission) {
              this.handleUpdateProduct(formData)
            } else {
              this.$message.warning('没有修改商品权限，请联系管理员！')
            }
          }
        } else {
          this.$message.warning('商品信息不完整，请仔细检查！')
        }
      })
    },
    async setMpuShippingPrice(mpu, template) {
      let id = null
      try {
        const { code, data } = await setMpuShippingPriceApi({ mpu, templateId: template.id })
        if (code === 200) {
          id = data.id
        }
      } catch (e) {
        console.warn('Product set shipping price error:' + e)
      }
      return id
    },
    getValidFormItem(formData) {
      const params = {}
      for (const key of Object.keys(formData)) {
        if (formData[key] !== null) {
          const value = formData[key]
          switch (key) {
            case 'price':
            case 'sprice':
            case 'floorPrice':
            case 'comparePrice': {
              if (value > 0) {
                params[key] = floatToFixed(value, 2).toString()
              }
              break
            }
            case 'weight': {
              if (value > 0) {
                params[key] = floatToFixed(value, 3).toString()
              }
              break
            }
            case 'inventory': {
              if (value >= 0) {
                params[key] = value
              }
              break
            }
            default:
              params[key] = value
          }
        }
      }
      return params
    },
    async handleCreateProduct(formData) {
      try {
        const params = this.getValidFormItem(formData)
        if (!this.hasVendorPermission) {
          params.merchantId = this.vendorId
        }
        if (this.autoSku) {
          params.skuid = ''
        }
        if (!(params.floorPrice > 0)) {
          params.floorPrice = this.floorPrice
        }
        const res = await createProductApi(params)
        if (res.code === 200) {
          const mpu = res.data.result
          if (this.shippingPriceData !== null) {
            await this.setMpuShippingPrice(mpu, this.shippingPriceData)
          }
          const prod = await this.getDetailInfo(mpu)
          if (prod) {
            this.productInfo = prod
            this.productForm.id = prod.id
            this.productForm.skuid = prod.skuid
            this.productForm.mpu = prod.mpu
            this.productForm.state = prod.state
            this.productForm.createdAt = prod.createdAt
            this.$message({ message: '创建产品信息成功。', type: 'success' })
            this.activeStep++
            scrollTo(0, 300)
          } else {
            this.$message.error('创建商品信息失败，请联系管理员！')
          }
        } else {
          this.$message.error(res.msg || '创建商品信息失败，请联系管理员！')
        }
      } catch (e) {
        console.warn('Create product error: ' + e)
        this.$message.error('创建产品信息失败！')
      }
    },
    handleUpdateProduct(formData) {
      let changed = false
      const params = {
        id: formData.id
      }
      const filterForm = this.getValidFormItem(formData)
      Object.keys(filterForm).forEach(key => {
        if (this.productInfo[key] !== filterForm[key] && !notUpdateKeys.includes(key)) {
          params[key] = filterForm[key]
          changed = true
        }
      })
      if (changed) {
        this.$confirm('请确定是否修改此商品的信息？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateProductApi(params).then(_ => {
            this.$message({ message: '更新产品信息成功。', type: 'success' })
            if ('price' in params && this.hasSubSku) {
              const price = floatToFixed(Number.parseFloat(params.price), 2) * 100
              this.productInfo.skuList[0].price = Math.round(price)
            }
            this.activeStep++
            scrollTo(0, 300)
          }).catch(error => {
            console.log('updateProductInfo:' + JSON.stringify(error))
            this.$message.error('更新产品信息失败！')
          })
        }).catch(() => {
        })
      } else {
        this.activeStep++
        scrollTo(0, 300)
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
    handleUploadCoverSuccess(imageUrl) {
      this.productForm.image = imageUrl
    },
    sortByFileName(fileList) {
      return sortBy(fileList, [
        file => {
          const regex = /\d+/g
          const found = regex.exec(file.name)
          if (found) {
            return Number.parseInt(found[0])
          } else {
            return 0
          }
        }])
    },
    handleThumbnailSelect() {
      this.$refs['thumbnailUpload'].click()
    },
    handleThumbnailFileChange(e) {
      const count = this.maxThumbnailLength - this.thumbnails.length
      const files = []
      for (let i = 0; i < e.target.files.length; i++) {
        files.push(e.target.files.item(i))
      }
      const mimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
      const validFiles = files.filter(
        rawFile => rawFile && rawFile.size < max_upload_image_size && mimeTypes.includes(rawFile.type)
      )
      if (validFiles.length === 0) {
        this.$message.warning('上传的图片大小不超过1M，图片格式支持PNG或JPEG，请重新上传！')
        return
      }
      if (validFiles.length > count) {
        this.$message.warning(`最多还可再添加${count}个主图！`)
        return
      }
      this.uploading = true
      this.loading = true
      this.$refs['thumbnailUpload'].value = null // fix can't select the same excel
      const sortedList = this.sortByFileName(validFiles)
      this.toUploadFiles = sortedList.map((rawFile, index) => {
        const type = rawFile.type === 'image/png' ? '.png' : '.jpg'
        const now = moment().valueOf()
        const filename = `${now}${index}${type}`
        return {
          uploadName: this.thumbnailUploadPath + '/' + filename,
          uploadFile: rawFile
        }
      })
      this.uploadedFiles = []
      this.failedFiles = []
      cosUploadFiles(this.toUploadFiles,
        info => this.handleUploadProgress(info),
        (err, data, options) => this.handleUploadThumbnailSuccess(err, data, options)
      )
    },
    handleUploadThumbnailSuccess(err, data, options) {
      if (err) {
        this.failedFiles.push(err)
      } else {
        const index = parseInt(options.Index)
        if (!isNaN(index)) {
          this.uploadedFiles[index] = '/' + options.Key
        } else {
          this.failedFiles.push(options)
        }
      }
      if (this.uploadedFiles.length + this.failedFiles.length === this.toUploadFiles.length) {
        for (const url of this.uploadedFiles) {
          if (!this.thumbnails.includes(url)) {
            this.thumbnails.push(url)
            this.thumbnailUrls.push(this.$store.getters.cosUrl + url)
          }
        }
        this.uploadedFiles = []
        this.failedFiles = []
        this.loading = false
        this.uploading = false
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
    handleIntroductionSelect() {
      this.$refs['introductionUpload'].click()
    },
    handleIntroductionFileChange(e) {
      const count = this.maxIntroductionLength - this.introductions.length
      const files = []
      for (let i = 0; i < e.target.files.length; i++) {
        files.push(e.target.files.item(i))
      }
      const mimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
      const validFiles = files.filter(
        rawFile => rawFile && rawFile.size < max_upload_image_size && mimeTypes.includes(rawFile.type)
      )
      if (validFiles.length === 0) {
        this.$message.warning('上传的图片大小不超过1M，图片格式支持PNG或JPEG，请重新上传！')
        return
      }
      if (validFiles.length > count) {
        this.$message.warning(`最多还可再添加${count}个详情图！`)
        return
      }
      this.uploading = true
      this.loading = true
      this.$refs['introductionUpload'].value = null // fix can't select the same excel
      const sortedList = this.sortByFileName(validFiles)
      this.toUploadFiles = sortedList.map((rawFile, index) => {
        const type = rawFile.type === 'image/png' ? '.png' : '.jpg'
        const now = moment().valueOf()
        const filename = `${now}${index}${type}`
        return {
          uploadName: this.introductionUploadPath + '/' + filename,
          uploadFile: rawFile
        }
      })
      this.uploadedFiles = []
      this.failedFiles = []
      cosUploadFiles(this.toUploadFiles,
        info => this.handleUploadProgress(info),
        (err, data, options) => this.handleUploadIntroductionSuccess(err, data, options)
      )
    },
    handleUploadIntroductionSuccess(err, data, options) {
      if (this.toUploadFiles.length > 1) {
        if (err) {
          this.failedFiles.push(err)
        } else {
          const index = parseInt(options.Index)
          if (!isNaN(index)) {
            this.uploadedFiles.push({ index, url: '/' + options.Key })
          } else {
            this.failedFiles.push(options)
          }
        }
        if (this.uploadedFiles.length + this.failedFiles.length === this.toUploadFiles.length) {
          const sortedList = sortBy(this.uploadedFiles, ['index'])
          for (const item of sortedList) {
            if (!this.introductions.includes(item.url)) {
              this.introductions.push(item.url)
              this.introductionUrls.push(this.$store.getters.cosUrl + item.url)
            }
          }
          this.uploadedFiles = []
          this.failedFiles = []
          this.loading = false
          this.uploading = false
        }
      } else {
        this.loading = false
        this.uploading = false
        if (err) {
          this.$message.error('上传图片文件失败，请联系管理员！')
          return
        }
        let index = 0
        const url = '/' + options.Key
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
            this.introductions.splice(index, 0, url)
            this.introductionUrls.splice(index, 0, this.$store.getters.cosUrl + url)
            break
          case 2: // Head
            this.introductions.splice(0, 0, url)
            this.introductionUrls.splice(0, 0, this.$store.getters.cosUrl + url)
            break
          case 3: // Tail
            this.introductions.push(url)
            this.introductionUrls.push(this.$store.getters.cosUrl + url)
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
    handleUploadProgress(info) {
      this.uploadPercent = info.percent
    },
    async getMerchantFreeShipping(merchantId) {
      try {
        const { code, data } = await getMerchantFreeShippingApi({ merchantId })
        if (code === 200 && Array.isArray(data.result) && data.result.length > 0) {
          const shipMerchants = data.result.filter(item => item.merchantId === merchantId)
          this.freeShippingData = shipMerchants.length > 0 ? shipMerchants[0] : data.result[0]
        }
      } catch (e) {
        console.warn('Product get merchant free shipping error:' + e)
      }
    },
    async getMpuShippingPrice(mpu) {
      let suc = false
      try {
        this.shippingPriceLoading = true
        const { code, data } = await getMpuShippingPriceApi({ mpu })
        if (code === 200 && Array.isArray(data.result)) {
          if (data.result.length > 0) {
            const shipMpus = data.result.filter(item => item.shipMpuId !== null)
            this.shippingPriceData = shipMpus.length > 0 ? shipMpus[0] : data.result[0]
            this.mpuShippingPriceId = this.shippingPriceData.shipMpuId
            suc = true
          }
        }
      } catch (e) {
        console.warn('Product get mpu shipping price error:' + e)
      } finally {
        this.shippingPriceLoading = false
      }
      if (!suc) {
        this.shippingPriceData = null
        this.mpuShippingPriceId = null
      }
    },
    handleRemoveMpuShippingPrice() {
      this.$confirm('是否继续清除此商品的运费模板？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          if (this.mpuShippingPriceId !== null) {
            this.shippingPriceLoading = true
            const { code } = await deleteMpuShippingPriceApi({ id: this.mpuShippingPriceId })
            if (code === 200) {
              this.getMpuShippingPrice(this.productForm.mpu)
            }
          } else {
            this.shippingPriceData = null
          }
        } catch (e) {
          console.warn('Product remove shipping price error:' + e)
        } finally {
          this.shippingPriceLoading = false
        }
      }).catch(() => {
      })
    },
    handleConfirmShippingPrice(ret) {
      this.shippingPriceDialogVisible = false
      if (ret.suc) {
        this.getMpuShippingPrice(this.productForm.mpu)
      } else {
        this.shippingPriceData = ret.template
      }
    },
    getTaxRate(value) {
      if (value !== null) {
        const find = ProductTaxRateOptions.find(item => item.value === value)
        return find ? find.label : ''
      } else {
        return ''
      }
    },
    handleEditSubSkuPrice(index) {
      this.editSubSku = this.subSkuList[index]
      this.subSkuDialogVisible = true
    },
    async handleUpdateSubSkuPrice(params) {
      this.subSkuDialogVisible = false
      const ret = await this.handleUpdateSubSku(params)
      if (ret) {
        const index = this.productInfo.skuList.findIndex(item => item.id === params.id)
        if (index >= 0) {
          this.productInfo.skuList[index].price = params.price
          if (index === 0) {
            const price = floatToFixed(params.price / 100, 2)
            this.updateProductPrice(price)
          }
        }
      }
    },
    async handleUpdateSubSku(params) {
      let suc = false
      try {
        this.loading = true
        const { code, msg } = await updateSubSkuApi(params)
        if (code === 200) {
          suc = true
          this.$message.success('更新商品品种成功！')
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update sub sku status error:' + e)
      } finally {
        this.loading = false
      }
      return suc
    },
    isSubSkuReadyForSale(sku) {
      return sku.price > 0
    },
    isSpuReadyForSale() {
      const spu = this.productInfo
      const price = Number.parseFloat(spu.price)
      const introduction = spu.introductionUrl || spu.introduction
      return !(Number.isNaN(price) || price < 0 ||
        isEmpty(spu.image) ||
        isEmpty(spu.imagesUrl) ||
        isEmpty(introduction) ||
        isEmpty(spu.category)
      )
    },
    handleSubSkuSelectionOnSale() {
      if (!this.isSpuReadyForSale()) {
        this.$message.warning('此商品未满足上架条件，请仔细检查！')
        return
      }
      const subSkuList = this.subSkuSoldOutSelection.filter(item => this.isSubSkuReadyForSale(item))
      if (subSkuList.length > 0) {
        const spuSoldOut = this.productInfo.state === product_state_off_shelves.toString()
        const message = spuSoldOut ? '此商品为下架状态，上架将会同时影响整个商品，是否继续？' : '是否继续上架所选商品品种？'
        this.$confirm(message, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          let suc = false
          this.loading = true
          for (const subSku of subSkuList) {
            const id = subSku.id
            const params = {
              id,
              status: product_sub_sku_on_sale
            }
            const ret = await this.handleUpdateSubSku(params)
            if (ret) {
              const find = this.productInfo.skuList.find(item => item.id === id)
              if (find) find.status = product_sub_sku_on_sale
              suc = true
            }
          }
          if (suc && spuSoldOut) {
            await this.updateProductState(product_state_on_sale.toString())
          }
        }).catch(() => {
        }).finally(() => {
          this.loading = false
          this.$refs['subSkuTable'].clearSelection()
        })
      } else {
        this.$message.warning('所选商品品种价格不满足上架条件，请仔细检查！')
        this.$refs['subSkuTable'].clearSelection()
      }
    },
    handleSubSkuSelectionSoldOut() {
      const onSaleList = this.subSkuList.filter(item => item.status === product_sub_sku_on_sale)
      const shouldSoldOut = onSaleList.length === this.subSkuOnSaleSelection.length
      const message = shouldSoldOut ? '下架所选销售中品种，将会同时影响整个商品，是否继续？' : '是否继续下架所选商品品种？'
      this.$confirm(message, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let suc = false
        this.loading = true
        for (const subSku of this.subSkuOnSaleSelection) {
          const id = subSku.id
          const params = {
            id,
            status: product_sub_sku_sold_out
          }
          const ret = await this.handleUpdateSubSku(params)
          if (ret) {
            const find = this.productInfo.skuList.find(item => item.id === id)
            if (find) find.status = product_sub_sku_sold_out
            suc = true
          }
        }
        if (suc && shouldSoldOut) {
          await this.updateProductState(product_state_off_shelves.toString())
        }
      }).catch(() => {
      }).finally(() => {
        this.loading = false
        this.$refs['subSkuTable'].clearSelection()
      })
    },
    handleSubSkuOnSale(index) {
      if (!this.isSpuReadyForSale()) {
        this.$message.warning('此商品未满足上架条件，请仔细检查！')
        return
      }
      if (this.isSubSkuReadyForSale(this.subSkuList[index])) {
        const spuSoldOut = this.productInfo.state === product_state_off_shelves.toString()
        const message = spuSoldOut ? '此商品为下架状态，上架将会同时影响整个商品，是否继续？' : '是否继续上架此商品品种？'
        this.$confirm(message, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const id = this.subSkuList[index].id
          const params = {
            id,
            status: product_sub_sku_on_sale
          }
          this.loading = true
          const ret = await this.handleUpdateSubSku(params)
          if (ret) {
            this.productInfo.skuList[index].status = product_sub_sku_on_sale
            if (spuSoldOut) {
              await this.updateProductState(product_state_on_sale.toString())
            }
          }
        }).catch(() => {
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.$confirm('此商品品种不满足上架条件，是否去修改此商品品种？', '提示', {
          confirmButtonText: '去编辑',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleEditSubSkuPrice(index)
        }).catch(() => {
        })
      }
    },
    handleSubSkuSoldOut(index) {
      const oneOnSale = this.subSkuList.filter(item => item.status === product_sub_sku_on_sale).length === 1
      const message = oneOnSale ? '此为唯一销售中品种，下架将会同时影响整个商品，是否继续？' : '是否继续下架此商品品种？'
      this.$confirm(message, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const id = this.subSkuList[index].id
        const params = {
          id,
          status: product_sub_sku_sold_out
        }
        this.loading = true
        const ret = await this.handleUpdateSubSku(params)
        if (ret) {
          this.productInfo.skuList[index].status = product_sub_sku_sold_out
          if (oneOnSale) {
            await this.updateProductState(product_state_off_shelves.toString())
          }
        }
      }).catch(() => {
      }).finally(() => {
        this.loading = false
      })
    },
    async updateProductPrice(price) {
      try {
        this.loading = true
        const priceParams = { id: this.productInfo.id, price: price.toString() }
        const { code } = await updateProductApi(priceParams)
        if (code === 200) {
          this.productInfo.price = price.toString()
          this.productForm.price = price
        }
      } catch (e) {
        console.warn('Update price after sub sku price error:' + e)
      } finally {
        this.loading = false
      }
    },
    async updateProductState(state) {
      try {
        this.loading = true
        const params = [{ id: this.productInfo.id, state }]
        const { code } = await batchUpdateStateApi(params)
        if (code === 200) {
          this.productInfo.state = state
          this.productForm.state = state
        }
      } catch (e) {
        console.warn('Update spu state error:' + e)
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(selection) {
      this.subSkuOnSaleSelection = selection.filter(item => item.status === product_sub_sku_on_sale)
      this.subSkuSoldOutSelection = selection.filter(item => item.status === product_sub_sku_sold_out)
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
  .image-upload-input {
    display: none;
    z-index: -9999;
  }

  .thumb-image {
    object-fit: contain;
    width: 100%;
    height: 100%
  }
</style>
