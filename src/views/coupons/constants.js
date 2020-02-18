export const CouponAppScopes = [{
  id: '20190001',
  name: '无锡智慧城市'
}, {
  id: '20190002',
  name: '北部湾智慧城市'
}]

export const CouponTypeOptions = [{
  value: 0,
  label: '满减券'
}, {
  value: 1,
  label: '代金券'
}, {
  value: 2,
  label: '折扣券'
}, {
  value: 3,
  label: '服务券'
}, {
  value: 4,
  label: '礼包券'
}]

export const CouponCollectOptions = [{
  value: 1,
  label: '主动领取'
}, {
  value: 2,
  label: '主动发放'
}, /* {
  value: 3,
  label: '积分兑换'
},*/ {
  value: 4,
  label: '人工分配'
}]

export const CouponScenarioOptions = [{
  value: 1,
  label: '特定商品类'
}, {
  value: 2,
  label: '全场类'
}, {
  value: 3,
  label: '特定类别类'
}, {
  value: 4,
  label: '特定服务类'
}]

export const UsageStatusOptions = [{
  value: 1,
  label: '未使用'
}, {
  value: 2,
  label: '已占用'
}, {
  value: 3,
  label: '已使用'
}, {
  value: 4,
  label: '已失效'
}]

export const CustomerTypeOptions = [{
  value: 0,
  label: '全部会员'
}, {
  value: 1,
  label: '新人会员'
}]

export const UrlTypeOptions = [{
  value: 'aggregation',
  label: '聚合页'
}, {
  value: 'commodity',
  label: '单一商品'
}, {
  value: 'listing',
  label: '商品列表'
}, {
  value: 'external',
  label: '外部链接'
}, {
  value: 'blank',
  label: '无链接'
}]

export function getUrlType(url) {
  if (url !== null) {
    if (url.startsWith('aggregation://')) {
      return 'aggregation'
    } else if (url.startsWith('route://commodity')) {
      return 'commodity'
    } else if (url.startsWith('route://listing')) {
      return 'listing'
    } else if (url.startsWith('about:blank')) {
      return 'blank'
    } else {
      return 'external'
    }
  } else {
    return 'blank'
  }
}
