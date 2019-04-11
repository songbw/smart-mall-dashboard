import request from '@/utils/request'

export function getOrderList(data) {
  return request({
    // url: 'http://localhost:7300/mock/5c11f124b7ebe728918cb278/order/searchOrder',
     url: '/order/searchOrder',
    method: 'post',
    data: {
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
      openId: data.userId,
      id: data.orderId,
      subOrderId: data.detailId,
      telephone: data.telephone,
      payDateStart: data.payDateStart,
      payDateEnd: data.payDateEnd
    }
  })
}

export function getOrderDetail(id, pageIndex, pageSize) {
  return request({
    // url: 'http://localhost:7300/mock/5c11f124b7ebe728918cb278/order/searchDetail',
    url: '/order/searchDetail',
    method: 'post',
    data: {
      orderId: id,
      pageIndex: pageIndex,
      pageSize: pageSize
    }
  })
}

export function addOrderNotes(orderIndex, notes) {
  return request({
    // url: 'https://easy-mock.com/mock/5bebfae454579e254b2bb90e/order/note',
    url: '/order/updateRemark',
    method: 'post',
    data: {
      id: orderIndex,
      remark: notes
    }
  })
}

export function changeAddress(orderIndex, addr) {
  return request({
    // url: 'https://easy-mock.com/mock/5bebfae454579e254b2bb90e/order/address',
    url: '/order/updateAddress',
    method: 'post',
    data: {
      id: orderIndex,
      address: addr
    }
  })
}

export function deliveryUpload(total, list) {
  return request({
    // url: 'https://easy-mock.com/mock/5bebfae454579e254b2bb90e/order/delivery',
    url: '/order/uploadLogistics',
    // url: 'http://172.23.127.16:8080/order/uploadLogistics',
    method: 'post',
    data: {
      total: total,
      logisticsList: list
    }
  })
}
