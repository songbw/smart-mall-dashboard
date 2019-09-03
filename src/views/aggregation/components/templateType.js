export const bannerType = '0'
export const serviceType = '1'
export const gridType = '2'
export const promotionType = '3'
export const goodsType = '4'
export const couponType = '6'
export const hotZoneType = '7'
export const comboType = '8'

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
  marginBottom: 0
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
  imageKey: ''
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
