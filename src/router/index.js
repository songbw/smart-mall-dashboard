import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'
import {
  role_vendor_name,
  role_admin_name
} from '@/utils/constants'

Vue.use(Router)

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/auth/login'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    component: () => import('@/views/auth/register'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/password/new',
    component: () => import('@/views/auth/register'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/products',
    name: 'Goods',
    meta: { title: '商品', icon: 'goods-manager' },
    children: [
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/product/index'),
        meta: { title: '商品管理', icon: 'products' }
      },
      {
        path: 'viewProduct/:skuId',
        name: 'ViewProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '查看商品', icon: 'products' },
        hidden: true
      },
      {
        path: 'showProduct/:id',
        name: 'ShowProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '查看商品', icon: 'products' },
        hidden: true
      },
      {
        path: 'editProduct/:id',
        name: 'EditProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '编辑商品', icon: 'products' },
        hidden: true
      },
      {
        path: 'createProduct',
        name: 'CreateProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '创建商品', icon: 'products' },
        hidden: true
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/index'),
        meta: { title: '类别管理', icon: 'categories' }
      },
      {
        path: 'brand',
        name: 'Brand',
        component: () => import('@/views/brand/index'),
        meta: { title: '品牌管理', icon: 'brands' }
      }
    ]
  },
  {
    path: '/coupons',
    component: Layout,
    redirect: '/coupons/index',
    name: 'Coupons',
    meta: { title: '权益', icon: 'golds' },
    children: [
      {
        path: 'index',
        name: 'CouponsIndex',
        component: () => import('@/views/coupons/index'),
        meta: { title: '优惠券管理', icon: 'coupons' }
      },
      {
        path: 'tags',
        name: 'CouponTags',
        component: () => import('@/views/coupons/tags'),
        meta: { title: '标签管理', icon: 'tags' }
      },
      {
        path: 'detail/:id',
        name: 'CouponDetail',
        component: () => import('@/views/coupons/custom'),
        meta: { title: '优惠券详情' },
        hidden: true
      },
      {
        path: 'creation',
        name: 'CreateCoupon',
        component: () => import('@/views/coupons/custom'),
        meta: { title: '创建优惠券' },
        hidden: true
      },
      {
        path: 'usages/:id',
        name: 'CouponUsages',
        component: () => import('@/views/coupons/usages'),
        meta: { title: '领取详情' },
        hidden: true
      }
    ]
  },
  {
    path: '/marketing',
    component: Layout,
    redirect: '/marketing/aggregations',
    name: 'Marketing',
    meta: { title: '营销', icon: 'marketing' },
    children: [
      {
        path: 'aggregations',
        name: 'Aggregations',
        component: () => import('@/views/aggregation/index'),
        meta: { title: '聚合页管理', icon: 'aggregations' }
      },
      {
        path: 'editAggregation/:id',
        name: 'EditAggregation',
        component: () => import('@/views/aggregation/detail'),
        meta: { title: '编辑聚合页', icon: 'aggregations' },
        hidden: true
      },
      {
        path: 'createAggregation',
        name: 'CreateAggregation',
        component: () => import('@/views/aggregation/detail'),
        meta: { title: '创建聚合页', icon: 'aggregations' },
        hidden: true
      },
      {
        path: 'promotions',
        name: 'Promotions',
        component: () => import('@/views/promotions/index'),
        meta: { title: '促销活动', icon: 'promotions' }
      },
      {
        path: 'createPromotion',
        name: 'CreatePromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '创建促销活动', icon: 'promotions' },
        hidden: true
      },
      {
        path: 'editPromotion/:id',
        name: 'EditPromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '创建促销活动', icon: 'promotions' },
        hidden: true
      },
      {
        path: 'viewPromotion/:id',
        name: 'ViewPromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '创建促销活动', icon: 'promotions' },
        hidden: true
      }
    ]
  },
  {
    path: '/orders',
    component: Layout,
    redirect: '/orders/index',
    name: 'OrderManager',
    meta: { title: '订单', icon: 'orders' },
    children: [
      {
        path: 'index',
        name: 'Orders',
        component: () => import('@/views/orders/index'),
        meta: { title: '订单管理', icon: 'carts' }
      },
      {
        path: 'viewSubOrder/:subId',
        name: 'ViewSubOrder',
        component: () => import('@/views/orders/subOrderDetail'),
        meta: { title: '查看子订单', icon: 'orders' },
        hidden: true
      },
      {
        path: 'viewMainOrder/:mainId',
        name: 'ViewMainOrder',
        component: () => import('@/views/orders/mainOrderDetail'),
        meta: { title: '查看主订单', icon: 'orders' },
        hidden: true
      },
      {
        path: 'delivery',
        name: 'OrderDelivery',
        component: () => import('@/views/orders/delivery'),
        meta: { title: '订单物流', icon: 'delivery' }
      }
    ]
  },
  {
    path: '/workOrders',
    component: Layout,
    redirect: '/workOrders/index',
    name: 'WorkOrderManager',
    meta: { title: '售后', icon: 'after-sales' },
    children: [
      {
        path: 'index',
        name: 'WorkOrders',
        component: () => import('@/views/workorders/index'),
        meta: { title: '售后管理', icon: 'work-order' }
      },
      {
        path: 'viewWorkOrder/:id',
        name: 'ViewWorkOrder',
        component: () => import('@/views/workorders/detail'),
        meta: { title: '查看售后详情', icon: 'work-order' },
        hidden: true
      },
      {
        path: 'types',
        name: 'WorkOrderTypes',
        component: () => import('@/views/workorders/types'),
        meta: { title: '售后类型', icon: 'tags' }
      }
    ]
  },
  {
    path: '/vendorInfo',
    component: Layout,
    redirect: '/vendorInfo/profile',
    name: 'VendorInfo',
    meta: {
      title: '商户',
      icon: 'vendor',
      roles: [role_vendor_name]
    },
    children: [
      {
        path: 'profile',
        name: 'VendorProfile',
        component: () => import('@/views/vendor/profile'),
        meta: { title: '商户', icon: 'vendor-info', roles: [role_vendor_name] }
      },
      {
        path: 'user',
        name: 'UserInfo',
        component: () => import('@/views/vendor/userInfo'),
        meta: { title: '用户', icon: 'user', roles: [role_vendor_name] }
      }
    ]
  },
  {
    path: '/vendorManager',
    component: Layout,
    redirect: '/vendorManager/manager',
    name: 'VendorMain',
    meta: {
      title: '商户',
      icon: 'vendor',
      roles: [role_admin_name]
    },
    children: [
      {
        path: 'manager',
        name: 'VendorManager',
        component: () => import('@/views/vendor/manager'),
        meta: { title: '商户管理', icon: 'vendor', roles: [role_admin_name] }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
