import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'
import {
  role_vendor_name,
  role_admin_name,
  role_watcher_name
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
    path: '/login/2fa',
    name: 'Password2FA',
    component: () => import('@/views/auth/login2FA'),
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
    path: '/password/reset',
    name: 'PasswordReset',
    component: () => import('@/views/auth/passwordReset'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }, {
        path: '/password/change',
        name: 'PasswordChange',
        component: () => import('@/views/auth/passwordChange'),
        hidden: true
      }
    ]
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
        meta: { title: '商品管理', icon: 'products', group: 'products' }
      },
      {
        path: 'viewProduct/:mpu',
        name: 'ViewProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '查看商品', icon: 'products', group: 'products' },
        hidden: true
      },
      {
        path: 'showProduct/:id',
        name: 'ShowProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '查看商品', icon: 'products', group: 'products' },
        hidden: true
      },
      {
        path: 'editProduct/:id',
        name: 'EditProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '编辑商品', icon: 'products', group: 'products' },
        hidden: true
      },
      {
        path: 'createProduct',
        name: 'CreateProduct',
        component: () => import('@/views/product/detail'),
        meta: { title: '创建商品', icon: 'products', group: 'products' },
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
      },
      {
        path: 'freeShipping',
        name: 'FreeShipping',
        component: () => import('@/views/freight/freeShipping'),
        meta: { title: '包邮模板', icon: 'free-shipping' }
      },
      {
        path: 'createFreeShipping',
        name: 'CreateFreeShipping',
        component: () => import('@/views/freight/freeShippingDetail'),
        meta: { title: '包邮模板', icon: 'free-shipping' },
        hidden: true
      },
      {
        path: 'viewFreeShipping/:id',
        name: 'ViewFreeShipping',
        component: () => import('@/views/freight/freeShippingDetail'),
        meta: { title: '包邮模板', icon: 'free-shipping' },
        hidden: true
      },
      {
        path: 'editFreeShipping/:id',
        name: 'EditFreeShipping',
        component: () => import('@/views/freight/freeShippingDetail'),
        meta: { title: '包邮模板', icon: 'free-shipping' },
        hidden: true
      },
      {
        path: 'shippingPrice',
        name: 'ShippingPrice',
        component: () => import('@/views/freight/shippingPrice'),
        meta: { title: '运费模板', icon: 'shipping-price' }
      },
      {
        path: 'createShippingPrice',
        name: 'CreateShippingPrice',
        component: () => import('@/views/freight/shippingPriceDetail'),
        meta: { title: '运费模板', icon: 'shipping-price' },
        hidden: true
      },
      {
        path: 'viewShippingPrice/:id',
        name: 'ViewShippingPrice',
        component: () => import('@/views/freight/shippingPriceDetail'),
        meta: { title: '运费模板', icon: 'shipping-price' },
        hidden: true
      },
      {
        path: 'editShippingPrice/:id',
        name: 'EditShippingPrice',
        component: () => import('@/views/freight/shippingPriceDetail'),
        meta: { title: '运费模板', icon: 'shipping-price' },
        hidden: true
      },
      {
        path: 'bulletins',
        name: 'Bulletins',
        component: () => import('@/views/bulletins/index'),
        meta: { title: '商品公告', icon: 'bulletins' }
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
        meta: { title: '优惠券管理', icon: 'coupons', group: 'coupons' }
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
        meta: { title: '优惠券详情', group: 'coupons' },
        hidden: true
      },
      {
        path: 'creation',
        name: 'CreateCoupon',
        component: () => import('@/views/coupons/custom'),
        meta: { title: '创建优惠券', group: 'coupons' },
        hidden: true
      },
      {
        path: 'usages/:id',
        name: 'CouponUsages',
        component: () => import('@/views/coupons/usages'),
        meta: { title: '领取详情', group: 'coupons' },
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
        meta: { title: '聚合页管理', icon: 'aggregations', group: 'aggregations' }
      },
      {
        path: 'editAggregation/:id',
        name: 'EditAggregation',
        component: () => import('@/views/aggregation/detail'),
        meta: { title: '编辑聚合页', icon: 'aggregations', group: 'aggregations' },
        hidden: true
      },
      {
        path: 'createAggregation',
        name: 'CreateAggregation',
        component: () => import('@/views/aggregation/detail'),
        meta: { title: '创建聚合页', icon: 'aggregations', group: 'aggregations' },
        hidden: true
      },
      {
        path: 'promotions',
        name: 'Promotions',
        component: () => import('@/views/promotions/index'),
        meta: { title: '促销活动', icon: 'promotions', group: 'promotions' }
      },
      {
        path: 'createPromotion',
        name: 'CreatePromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '创建促销活动', icon: 'promotions', group: 'promotions' },
        hidden: true
      },
      {
        path: 'editPromotion/:id',
        name: 'EditPromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '编辑促销活动', icon: 'promotions', group: 'promotions' },
        hidden: true
      },
      {
        path: 'viewPromotion/:id',
        name: 'ViewPromotion',
        component: () => import('@/views/promotions/creation'),
        meta: { title: '查看促销活动', icon: 'promotions', group: 'promotions' },
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
        meta: { title: '订单管理', icon: 'carts', group: 'orders' }
      },
      {
        path: 'viewSubOrder/:subId',
        name: 'ViewSubOrder',
        component: () => import('@/views/orders/subOrderDetail'),
        meta: { title: '查看子订单', icon: 'orders', group: 'orders' },
        hidden: true
      },
      {
        path: 'viewMainOrder/:mainId',
        name: 'ViewMainOrder',
        component: () => import('@/views/orders/mainOrderDetail'),
        meta: { title: '查看主订单', icon: 'orders', group: 'orders' },
        hidden: true
      },
      {
        path: 'delivery',
        name: 'OrderDelivery',
        component: () => import('@/views/orders/delivery'),
        meta: { title: '物流发货', icon: 'delivery', group: 'orders' }
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
        meta: { title: '售后管理', icon: 'work-order', group: 'workOrders' }
      },
      {
        path: 'viewWorkOrder/:id',
        name: 'ViewWorkOrder',
        component: () => import('@/views/workorders/detail'),
        meta: { title: '查看售后详情', icon: 'work-order', group: 'workOrders' },
        hidden: true
      },
      {
        path: 'returnAddress',
        name: 'ReturnAddress',
        component: () => import('@/views/workorders/returnAddress'),
        meta: { title: '退货地址', icon: 'return-address' }
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/index',
    name: 'StatisticsManager',
    meta: { title: '统计', icon: 'statistics' },
    children: [
      {
        path: 'index',
        name: 'UserBehaviors',
        component: () => import('@/views/statistics/behaviors'),
        meta: { title: '行为分析', icon: 'behaviors' }
      }
    ]
  },
  {
    path: '/members',
    component: Layout,
    redirect: '/members/index',
    name: 'Members',
    meta: { title: '会员', icon: 'members', group: 'members', roles: [role_admin_name, role_watcher_name] },
    children: [
      {
        path: 'index',
        name: 'MemberManager',
        component: () => import('@/views/members/index'),
        meta: { title: '会员管理', icon: 'members-manager', group: 'members', roles: [role_admin_name, role_watcher_name] }
      },
      {
        path: 'profile/:id',
        name: 'MemberProfile',
        component: () => import('@/views/members/profile'),
        meta: { title: '会员详情', icon: 'member-profile', group: 'members', roles: [role_admin_name, role_watcher_name] },
        hidden: true
      },
      {
        path: 'balances',
        name: 'MemberBalances',
        component: () => import('@/views/members/balances'),
        meta: { title: '余额管理', icon: 'balances', group: 'members', roles: [role_admin_name, role_watcher_name] },
        hidden: process.env.VUE_APP_HOST !== 'WX-MALL'
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
        meta: { title: '公司信息', icon: 'vendor-info', roles: [role_vendor_name] }
      },
      {
        path: 'user',
        name: 'UserInfo',
        component: () => import('@/views/vendor/userInfo'),
        meta: { title: '管理员', icon: 'user', roles: [role_vendor_name] }
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
        meta: { title: '商户公司', icon: 'vendor', roles: [role_admin_name] }
      },
      {
        path: 'users',
        name: 'UserManager',
        component: () => import('@/views/vendor/userManager'),
        meta: { title: '商户管理员', icon: 'user-manager', roles: [role_admin_name] }
      },
      {
        path: 'roles',
        name: 'RoleManager',
        component: () => import('@/views/vendor/roles'),
        meta: { title: '角色管理', icon: 'user-manager', roles: [role_admin_name] },
        hidden: true
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
