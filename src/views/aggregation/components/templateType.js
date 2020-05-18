import {
  aggregationBannerType,
  aggregationServiceType,
  aggregationGridType,
  aggregationPromotionType,
  aggregationGoodsType,
  aggregationCouponType,
  aggregationHotZoneType,
  aggregationComboType,
  aggregationPromotionListType,
  aggregationHorizontalGoodType
} from '@/utils/constants'

export const bannerType = aggregationBannerType
export const serviceType = aggregationServiceType
export const gridType = aggregationGridType
export const promotionType = aggregationPromotionType
export const goodsType = aggregationGoodsType
export const couponType = aggregationCouponType
export const hotZoneType = aggregationHotZoneType
export const comboType = aggregationComboType
export const promotionListType = aggregationPromotionListType
export const horizontalGoodType = aggregationHorizontalGoodType

export const good_prop_image = 'image'
export const good_prop_tile = 'title'
export const good_prop_price = 'price'
export const good_prop_promotion = 'promotion'
export const good_prop_coupon = 'coupon'
export const good_prop_subtitle = 'subtitle'
export const good_prop_tag = 'tag'
export const good_prop_add_cart = 'cart'
export const good_prop_buy_now = 'buy'
export const goodPropOptions = [
  {
    value: good_prop_image,
    label: '商品封面图'
  },
  {
    value: good_prop_tile,
    label: '商品标题'
  },
  {
    value: good_prop_price,
    label: '销售价格'
  },
  {
    value: good_prop_promotion,
    label: '促销信息'
  },
  {
    value: good_prop_coupon,
    label: '优惠券'
  },
  {
    value: good_prop_subtitle,
    label: '商品副标题'
  },
  {
    value: good_prop_tag,
    label: '商品标签'
  },
  {
    value: good_prop_add_cart,
    label: '购物车'
  },
  {
    value: good_prop_buy_now,
    label: '立即购买'
  }
]

export const gridSettings = {
  title: {
    show: false,
    text: {
      align: 'center',
      value: '',
      hasLink: false,
      linkType: 'blank',
      linkTitle: '无链接',
      linkUrl: 'about:blank'
    }
  },
  marginBottom: '0'
}

export const promotionSettings = {
  title: {
    show: true,
    textAlign: 'left',
    textValue: '',
    hasTextLink: false,
    textLinkValue: '',
    hasPromotionActivity: true,
    promotionDailySchedule: false,
    promotionActivityId: -1,
    promotionActivityName: '',
    promotionActivityStartDate: '',
    promotionActivityEndDate: '',
    hasImage: false,
    imageUrl: '',
    targetType: 'blank',
    targetUrl: 'about:blank',
    targetName: '无链接'
  },
  skuBackgroundColor: null,
  marginX: 0,
  marginBottom: '0'
}

export const goodsSettings = {
  countPerLine: 2,
  showFloorTitle: true,
  floorTitleTextColor: '#000000',
  floorTitleColor: '#FFFFFF',
  priceBackgroundColor: '#ECE8DE',
  priceTextColor: '#6E0F00',
  hasTabBar: false,
  tabBarBackgroundColor: '#333333',
  tabBarTextColor: '#FF9933',
  marginTop: 0,
  marginBottom: 0,
  visibleProps: [
    good_prop_image,
    good_prop_tile,
    good_prop_price,
    good_prop_promotion,
    good_prop_add_cart
  ]
}

export const couponSettings = {
  title: {
    show: false,
    imageUrl: '',
    targetType: 'blank',
    targetUrl: 'about:blank',
    targetName: '无链接'
  },
  marginBottom: '0'
}

export const hotZoneSettings = {
  imageUrl: '',
  imageKey: '',
  hasMargin: true
}

export const comboSettings = {
  left: {
    textValue: '',
    hasPromotionActivity: true,
    promotionDailySchedule: false,
    promotionActivityId: -1,
    promotionActivityName: '',
    promotionActivityStartDate: '',
    promotionActivityEndDate: '',
    hasImage: false,
    imageUrl: '',
    targetType: 'blank',
    targetUrl: 'about:blank',
    targetName: '无链接'
  },
  right: {
    textValue: '',
    hasPromotionActivity: true,
    promotionDailySchedule: false,
    promotionActivityId: -1,
    promotionActivityName: '',
    promotionActivityStartDate: '',
    promotionActivityEndDate: '',
    hasImage: false,
    imageUrl: '',
    targetType: 'blank',
    targetUrl: 'about:blank',
    targetName: '无链接'
  },
  countPerLine: 2,
  marginBottom: 0
}

export const promotionListSettings = {
  title: {
    show: true,
    textAlign: 'left',
    textValue: '',
    hasTextLink: false,
    textLinkValue: '',
    promotionDailySchedule: false,
    hasImage: false,
    imageUrl: ''
  },
  skuBackgroundColor: null,
  marginX: 0,
  marginBottom: '0'
}

export const horizontalGoodSettings = {
  title: {
    show: true,
    textAlign: 'left',
    textValue: '',
    hasTextLink: false,
    textLinkValue: '',
    hasImage: false,
    imageUrl: '',
    targetType: 'blank',
    targetUrl: 'about:blank',
    targetName: '无链接'
  },
  skuBackgroundColor: '#F8F8F8',
  marginX: '0',
  marginBottom: '0'
}
