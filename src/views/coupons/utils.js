export function parseSkuList(spuList) {
  const centToYuan = cent => cent > 0 ? (cent / 100).toFixed(2) : null
  const skuList = []
  for (const spu of spuList) {
    const prod = {
      id: spu.id,
      mpu: spu.mpu,
      image: spu.image,
      name: spu.name,
      merchantId: spu.merchantId,
      floorPrice: spu.floorPrice,
      brand: spu.brand
    }
    if (Array.isArray(spu.skuList) && spu.skuList.length > 0) {
      for (const [index, sku] of spu.skuList.entries()) {
        skuList.push({
          skuId: sku.code,
          skuIndex: index,
          skuNum: spu.skuList.length,
          state: sku.status.toString(),
          price: centToYuan(sku.price),
          ...prod
        })
      }
    } else {
      skuList.push({
        skuId: spu.skuid,
        skuIndex: 0,
        skuNum: 1,
        state: spu.state,
        price: spu.price,
        ...prod
      })
    }
  }
  return skuList
}
