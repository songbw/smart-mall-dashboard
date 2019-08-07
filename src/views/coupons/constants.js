export const coupon_status_init = 1
export const coupon_status_published = 2
export const coupon_status_ready_for_sale = 3
export const coupon_status_on_sale = 4
export const coupon_status_off_shelves = 5
export const coupon_status_distributing = 6

export const CouponStatusDefinition = [{
  value: coupon_status_init,
  label: '编辑中'
}, {
  value: coupon_status_ready_for_sale,
  label: '未开始'
}, {
  value: coupon_status_on_sale,
  label: '进行中'
}, {
  value: coupon_status_off_shelves,
  label: '已下线'
}, {
  value: coupon_status_distributing,
  label: '待分配'
}]

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
}]

export const CouponCollectOptions = [{
  value: 1,
  label: '主动领取'
}, {
  value: 2,
  label: '主动发放'
}, {
  value: 3,
  label: '积分兑换'
}, {
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
