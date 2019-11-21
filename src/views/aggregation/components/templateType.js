export const bannerType = '0'
export const serviceType = '1'
export const gridType = '2'
export const promotionType = '3'
export const goodsType = '4'
export const couponType = '6'
export const hotZoneType = '7'
export const comboType = '8'

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
  show: false,
  text: {
    align: 'center',
    value: '',
    hasLink: false,
    linkType: 'aggregation',
    linkTitle: '',
    linkUrl: ''
  }
}

export const promotionSettings = {
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
  marginBottom: '0'
}

export const goodsSettings = {
  countPerLine: 2,
  floorTitleColor: '#000000',
  priceBackgroundColor: '#ECE8DE',
  priceTextColor: '#6E0F00',
  hasTabBar: false,
  tabBarBackgroundColor: '#333333',
  tabBarTextColor: '#FF9933',
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
    targetType: '',
    targetUrl: '',
    targetName: ''
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
    targetType: '',
    targetUrl: '',
    targetName: ''
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
    targetType: '',
    targetUrl: '',
    targetName: ''
  },
  countPerLine: 2,
  marginBottom: 0
}
