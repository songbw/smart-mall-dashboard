<template>
  <div class="app-container">
    <el-form v-loading="loading" :model="product"
             :element-loading-text="loadingMessage"
             element-loading-spinner="el-icon-loading"
             label-position="right" label-width="200px">
      <el-form-item :label="$t('product_detail_id_title')">
        <span>{{ product.id }}</span>
      </el-form-item>
      <el-form-item :label="$t('product_table_skuid_title')">
        <span>{{ product.skuid }}</span>
      </el-form-item>
      <el-form-item label="商品状态">
        <span>{{ product.state === '0'? '已下架':'销售中' }}</span>
      </el-form-item>
      <el-form-item :label="$t('product_table_name_title')">
        <el-input v-model="product.name" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_brand_title')">
        <el-input v-model="product.brand" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_category_title')">
        <el-input v-model="categoryName" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_model_title')">
        <el-input v-model="product.model" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_weight_title')">
        <el-input v-model="product.weight" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_image_title')">
        <template>
          <img :src="coverUrl" width="200px">
          <el-upload
            ref="coverUpload"
            :action="uploadUrl"
            :data="uploadCoverData"
            :auto-upload="true"
            :limit="1"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadCoverSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            style="margin: 10px"
            list-type="picture"
            name="file">
            <el-button slot="trigger" :disabled="couldEditProduct === false"
                       type="primary" icon="el-icon-edit">
              修改商品图
            </el-button>
          </el-upload>
        </template>
      </el-form-item>
      <el-form-item :label="$t('product_table_upc_title')">
        <el-input v-model="product.upc" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_unit_title')">
        <el-input v-model="product.saleunit" readonly />
      </el-form-item>
      <el-form-item :label="$t('product_table_price_title')">
        <el-input v-model="product.price" readonly />
      </el-form-item>
      <el-form-item v-if="couldEditProduct" label="促销日期">
        <template>
          <div style="margin: 10px">
            <el-checkbox v-model="customizationDateChecked">设置起止日期</el-checkbox>
            <el-select v-model="customizationDateType" :disabled="customizationDateChecked === false"
                       @change="handleDateTypeChanged">
              <el-option
                v-for="item in customizationDateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value" />
            </el-select>
            <el-date-picker v-if="customizationDateChecked === true && customizationDateType === '1'"
                            :default-time="['00:00:00', '23:59:59']"
                            v-model="customizationDateRangeValue"
                            type="daterange"
                            value-format="timestamp"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期" />
            <div>
              <i class="el-icon-warning"> 说明：此有效期为后期修改商品的名称、主图、详情图等信息有效的起止日期，此有效期外展示的商品初始的信息。</i>
            </div>
          </div>
        </template>
      </el-form-item>
      <el-form-item :label="$t('product_table_thumbnail_title')">
        <template>
          <el-upload
            ref="thumbnailUpload"
            :disabled="couldEditProduct === false"
            :action="uploadUrl"
            :data="uploadThumbnailData"
            :auto-upload="true"
            :limit="1"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadThumbnailSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            style="margin: 10px"
            list-type="picture"
            name="file">
            <el-button slot="trigger" :disabled="thumbnails.length >= 5" type="primary" icon="el-icon-upload">
              {{ $t('product_button_upload_thumbnail_tip') }}
            </el-button>
            <div slot="tip" class="el-upload__tip">{{ $t('product_detail_thumbnail_select_tip') }}</div>
          </el-upload>
          <el-row v-if="thumbnailUrls.length > 0">
            <el-col v-for="(imgUrl, index) in thumbnailUrls" :span="4" :key="thumbnails[index]"
                    :offset="index > 0 ? 1 : 0">
              <custom-thumbnail :image-url="imgUrl" :index="index" :length="thumbnailUrls.length"
                                :bucket="thumbnailUploadPath" :could-edit="couldEditProduct"
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
      <el-form-item :label="$t('product_table_image_intro_title')">
        <template>
          <div style="display: flex; flex-direction: row;align-items: center;">
            <el-upload
              ref="introductionUpload"
              :action="uploadUrl"
              :data="uploadIntroductionData"
              :auto-upload="true"
              :limit="1"
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadIntroductionSuccess"
              :on-error="handleUploadError"
              :on-progress="handleUploadProgress"
              style="margin: 10px"
              list-type="picture"
              name="file">
              <el-button slot="trigger" :disabled="couldEditProduct === false"
                         type="primary" icon="el-icon-upload">
                点击上传新的详情图
              </el-button>
            </el-upload>
            <el-radio-group :disabled="couldEditProduct === false"
                            v-model="newIntroductionType" style="margin-left: 20px">
              <el-radio :label="1">正常详情图</el-radio>
              <el-radio :label="2">头部详情图</el-radio>
              <el-radio :label="3">尾部详情图</el-radio>
            </el-radio-group>
          </div>
          <div v-for="(img, index) in introductionUrls" :key="introductions[index]" style="padding: 14px">
            <custom-introduction :could-edit="couldEditProduct"
                                 :image-url="img" :index="index" :length="introductions.length"
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
    </el-form>
    <el-footer class="fixed_bottom" align="end" style="z-index: 1">
      <el-button @click="goBack">{{ $t('confirm_button_cancel_title') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t('confirm_button_ok_title') }}</el-button>
    </el-footer>
  </div>
</template>

<script>
  import { searchProductInfo, updateProductInfo } from '@/api/products'
  import CustomThumbnail from './customThumbnail'
  import CustomIntroduction from './customIntroduction'

  const minStartTimestamp = 946656000000 // Sat Jan 01 2000 00:00:00 GMT+0800 (China Standard Time)
  const maxEndTimestamp = 4102416000000 // Fri Jan 01 2100 00:00:00 GMT+0800 (China Standard Time)

  export default {
    name: 'ProductDetail',
    components: { CustomIntroduction, CustomThumbnail },
    data() {
      return {
        couldEditProduct: false,
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
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
        customizationDateOptions: [{
          value: '0',
          label: '永久有效'
        }, {
          value: '1',
          label: '日期范围'
        }],
        customizationDateType: '0',
        thumbnailUploadPath: 'products',
        introductionUploadPath: 'products',
        customizationDateChecked: false,
        customizationDateRangeValue: [minStartTimestamp, maxEndTimestamp],
        productHasCustomization: false,
        loading: true,
        categoryName: '',
        coverUrl: '',
        productThumbnails: '',
        thumbnails: [],
        thumbnailUrls: [],
        newIntroductionType: 1, // 1 for normal, 2 for head, 3 for tail
        productIntroductions: '',
        introductions: [],
        introductionUrls: [],
        product: {}
      }
    },
    computed: {
      loadingMessage: {
        get() {
          return this.uploading ? '正在上传图片...' + this.uploadPercent + '%' : '正在加载中...'
        }
      }
    },
    created() {
      this.getProductInfo()
    },
    methods: {
      getProductInfo() {
        const skuID = this.$route.params.skuid
        const params = {
          offset: 1,
          limit: 10,
          skuid: skuID
        }
        searchProductInfo(params).then(response => {
          const data = response.result
          if (data.total > 0) {
            let productInfo = null
            this.product = data.list[0]

            if (this.product.hasOwnProperty('prodInfo') && this.product.prodInfo !== null) {
              productInfo = this.product.prodInfo
            }

            this.coverUrl = this.product.image
            if (productInfo !== null &&
              productInfo.hasOwnProperty('image') &&
              productInfo.image !== null &&
              productInfo.image.trim()) {
              this.coverUrl = productInfo.image.trim()
            }
            this.product.coverUrl = this.coverUrl

            if (productInfo !== null &&
              productInfo.hasOwnProperty('startDate') &&
              productInfo.startDate !== null &&
              productInfo.hasOwnProperty('endDate') &&
              productInfo.endDate !== null) {
              const startTimestamp = Date.parse(productInfo.startDate)
              const endTimestamp = Date.parse(productInfo.endDate)
              if (isNaN(startTimestamp) === false && isNaN(endTimestamp) === false) {
                this.customizationDateRangeValue[0] = startTimestamp
                this.customizationDateRangeValue[1] = endTimestamp
                if (startTimestamp <= minStartTimestamp && endTimestamp >= maxEndTimestamp) {
                  this.customizationDateType = '0'
                } else {
                  this.customizationDateType = '1'
                }
                this.customizationDateChecked = true
                this.productHasCustomization = true
                productInfo.startTimestamp = startTimestamp
                productInfo.endTimestamp = endTimestamp
              }
            }

            this.thumbnails = []
            this.thumbnailUrls = []
            this.productThumbnails = this.product.imagesUrl
            if (productInfo !== null && productInfo.hasOwnProperty('imagesUrl') && productInfo.imagesUrl.trim()) {
              this.productThumbnails = productInfo.imagesUrl
            }
            if (this.productThumbnails !== null && this.productThumbnails.trim()) {
              const imgs = this.productThumbnails.trim().split(':')
              imgs.forEach(img => {
                this.thumbnails.push(img)
                this.thumbnailUrls.push(this.$store.getters.cosUrl + img)
              })
            }

            this.introductions = []
            this.introductionUrls = []
            this.productIntroductions = this.product.introductionUrl
            if (productInfo !== null &&
              productInfo.hasOwnProperty('introductionUrl') &&
              productInfo.introductionUrl !== null) {
              this.productIntroductions = productInfo.introductionUrl
            }
            if (this.productIntroductions !== null && this.productIntroductions.trim()) {
              const imgs = this.productIntroductions.trim().split(':')
              imgs.forEach(img => {
                this.introductions.push(img)
                this.introductionUrls.push(this.$store.getters.cosUrl + img)
              })
            }

            this.uploadCoverData.pathName = this.product.category + '/' + this.product.skuid + '/CoverU'
            this.thumbnailUploadPath = this.product.category + '/' + this.product.skuid + '/ZTU'
            this.uploadThumbnailData.pathName = this.thumbnailUploadPath
            this.introductionUploadPath = this.product.category + '/' + this.product.skuid + '/XTU'
            this.uploadIntroductionData.pathName = this.introductionUploadPath

            this.getCategoryName(this.product.category)
          }
        }).catch(error => {
          console.log('getProductInfo:' + error)
        }).finally(() => {
          this.loading = false
        })
      },
      getCategoryName(category) {
        this.$store.dispatch('getCategoryDataByID', { id: category }).then(category => {
          if (category.length > 0) {
            if (this.categoryName.length > 0) {
              this.categoryName = category[0].categoryName + ` / ` + this.categoryName
            } else {
              this.categoryName = category[0].categoryName
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
        let changed = false
        let productInfo = null
        const thumbnailStr = this.thumbnails.join(':')
        const introductionStr = this.introductions.join(':')
        const params = {}
        params.skuid = this.product.skuid

        if (this.product.hasOwnProperty('prodInfo') && this.product.prodInfo !== null) {
          productInfo = this.product.prodInfo
        }

        if (this.coverUrl !== this.product.coverUrl) {
          changed = true
          params.image = this.coverUrl
        }

        if (this.productThumbnails === null || this.productThumbnails.trim() !== thumbnailStr) {
          changed = true
          params.imagesUrl = thumbnailStr
        }

        if (this.productIntroductions === null || this.productIntroductions.trim() !== introductionStr) {
          changed = true
          params.introductionUrl = introductionStr
        }

        if (this.customizationDateChecked && this.customizationDateRangeValue.length === 2) {
          if (productInfo === null ||
            this.customizationDateRangeValue[0] !== productInfo.startTimestamp ||
            this.customizationDateRangeValue[1] !== productInfo.endTimestamp) {
            params.startDate = this.customizationDateRangeValue[0]
            params.endDate = this.customizationDateRangeValue[1]
            changed = true
          }
        } else {
          if (this.productHasCustomization) {
            params.startDate = ''
            params.endDate = ''
            changed = true
          }
        }
        if (changed) {
          this.$confirm('是否确定修改此商品的信息？请再次确认此次修改的有效起止日期。',
            this.$t('confirm_dialog_warning_title'),
            {
              confirmButtonText: this.$t('confirm_button_ok_title'),
              cancelButtonText: this.$t('confirm_button_cancel_title'),
              type: 'warning'
            }).then(() => {
            updateProductInfo(params).then(res => {
              this.$message({ message: '更新产品信息成功。', type: 'success' })
              this.goBack()
            }).catch(error => {
              console.log('updateProductInfo:' + JSON.stringify(error))
              this.$message.error('更新产品信息失败！')
            })
          })
        } else {
          this.goBack()
        }
      },
      handleUploadCoverSuccess(res) {
        this.$refs.coverUpload.clearFiles()
        this.loading = false
        this.uploading = false
        this.coverUrl = this.$store.getters.cosUrl + res.data.url
      },
      handleUploadThumbnailSuccess(res) {
        this.$refs.thumbnailUpload.clearFiles()
        this.loading = false
        this.uploading = false
        this.thumbnails.push(res.data.url)
        this.thumbnailUrls.push(this.$store.getters.cosUrl + res.data.url)
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
      handleUploadIntroductionSuccess(res) {
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
      handleDateTypeChanged(value) {
        if (value === '0') {
          this.customizationDateRangeValue = [
            minStartTimestamp,
            maxEndTimestamp
          ]
        } else {
          this.customizationDateRangeValue = []
        }
      },
      goBack() {
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.push('/')
      }
    }
  }
</script>

<style scoped>
  .image {
    width: 100%;
  }

  .fixed_bottom {
    position: fixed;
    bottom: 10px;
    right: 10px;
  }
</style>
