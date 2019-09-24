export const free_shipping_amount_mode = 0
export const free_shipping_unit_mode = 1
export const FreeShippingModeOptions = [{
  value: free_shipping_amount_mode,
  label: '按金额包邮'
}, {
  value: free_shipping_unit_mode,
  label: '按件数包邮'
}]

export const shipping_price_unit_mode = 0
export const ShippingPriceModeOptions = [{
  value: shipping_price_unit_mode,
  label: '按件数计价'
}]

export const RegionList = [
  { type: '0', name: '默认', provinces: [] },
  { type: '1', name: '江浙沪', provinces: ['100', '130', '20'] },
  { type: '2', name: '东三省', provinces: ['90', '80', '70'] },
  { type: '3', name: '偏远地区（西藏、新疆、内蒙古、甘肃、宁夏、青海）', provinces: ['300', '290', '40', '260', '270', '280'] }
]
