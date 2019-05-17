import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '../views/layout/Layout'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    header: 'header'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/user/login', component: () => import('@/views/user/login'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },
  {
    path: '/pageDisplay/:id',
    name: 'pageDisplay',
    component: () => import('@/views/pagetemplate/pageDisplay'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      meta: { header: 'Home', icon: 'dashboard', title_key: 'home_title' },
      component: () => import('@/views/home/index')
    }]
  },
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/product',
    name: 'Goods',
    meta: { header: 'Goods', icon: 'goods', title_key: 'goods_title' },
    children: [
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/goods/product/index'),
        meta: { header: 'Product', icon: 'product', title_key: 'product_title' }
      },
      {
        path: 'productDetail/:skuid',
        name: 'ProductDetail',
        component: () => import('@/views/goods/product/productDetail'),
        meta: { header: 'Product', icon: 'product', title_key: 'product_title' },
        hidden: true
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/goods/category/index'),
        meta: { header: 'Category', icon: 'category', title_key: 'category_title' }
      },
      {
        path: 'brand',
        name: 'Brand',
        component: () => import('@/views/goods/brand/index'),
        meta: { header: 'Brand', icon: 'brand', title_key: 'brand_title' }
      },
      {
        path: 'couponIndex',
        name: 'couponIndex',
        component: () => import('@/views/coupon/index'),
        meta: { header: 'Couon', icon: 'coupon', title_key: 'coupon_title' }
      },
      {
        path: 'couponDetail/:id',
        name: 'CouponDetail',
        component: () => import('@/views/coupon/customCoupon'),
        meta: { header: 'Coupon Detail', title_key: 'coupon_detail_title' },
        hidden: true
      },
      {
        path: 'createCoupon',
        name: 'CreateCoupon',
        component: () => import('@/views/coupon/customCoupon'),
        meta: { header: 'Create Coupon', title_key: 'coupon_create_title' },
        hidden: true
      },
      {
        path: 'couponUsages/:id',
        name: 'CouponUsages',
        component: () => import('@/views/coupon/couponUsages'),
        meta: { header: 'Coupon Usages', title_key: 'coupon_usages_title' },
        hidden: true
      },
    ]
  },
  {
    path: '/marketing',
    component: Layout,
    redirect: '/marketing/pageIndex',
    name: 'Marketing',
    meta: { header: 'Marketing', icon: 'marketing', title_key: 'marketing_title' },
    children: [
      {
        path: 'pageIndex',
        name: 'pageIndex',
        component: () => import('@/views/pagetemplate/index'),
        meta: { header: 'Page Template', icon: 'pagetemplate', title_key: 'page_template_title' }
      },
      {
        path: 'pageCreate/:id',
        name: 'pageCreate',
        component: () => import('@/views/pagetemplate/pageCreate'),
        meta: { header: 'Page Create', title_key: 'page_create_title' },
        hidden: true
      },
      {
        path: 'promotionIndex',
        name: 'promotionIndex',
        component: () => import('@/views/promotionactivity/index'),
        meta: { header: 'Promotion Activity', icon: 'promotions', title_key: 'promotion_activity_title' }
      },
      {
        path: 'promotionCreate/:id',
        name: 'promotionCreate',
        component: () => import('@/views/promotionactivity/promotionCreate'),
        meta: { header: 'Promotion Create', title_key: 'promotion_create_title' },
        hidden: true
      }
    ]
  },
  {
    path: '/orderList',
    component: Layout,
    redirect: '/orderlist',
    meta: { header: 'Order List', icon: 'shopping', title_key: 'order_list_title' },
    children: [
      {
        path: 'orderList',
        name: 'orderList',
        component: () => import('@/views/orderlist/index'),
        meta: { header: 'Order List', icon: 'orders', title_key: 'order_list_title' }
      },
      {
        path: 'importExcel',
        name: 'importExcel',
        component: () => import('@/views/orderlist/importDelivery'),
        meta: { header: 'import Delivery', icon: 'delivery', title_key: 'delivery_input_title' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/userManager',
    name: 'User',
    meta: { header: 'User', icon: 'user', title_key: 'user_system_title' },
    children: [
      {
        path: 'userManager',
        name: 'userManager',
        component: () => import('@/views/user/userManager'),
        meta: { header: 'user', icon: 'peoples', title_key: 'user_manager_title' }
      },
      {
        path: 'permissionManager',
        name: 'permissionManager',
        component: () => import('@/views/user/permission'),
        meta: { header: 'permission', icon: 'password', title_key: 'permission_manager_title' }
      },
      {
        path: 'permissionGroupManager',
        name: 'permissionGroupManager',
        component: () => import('@/views/user/permissionGroupManager'),
        meta: { header: 'permissionGroup', icon: 'lock', title_key: 'permission_group_manager_title' }
      },
      {
        path: 'roleManager',
        name: 'roleManager',
        component: () => import('@/views/user/roleManager'),
        meta: { header: 'role', icon: 'people', title_key: 'role_manager_title' }
      },
      {
        path: 'organizationManager',
        name: 'organizationManager',
        component: () => import('@/views/user/organization'),
        meta: { header: 'organization', icon: 'organization', title_key: 'organization_manager_title' }
      },
      {
        path: 'sysLog',
        name: 'sysLog',
        component: () => import('@/views/log/index'),
        meta: { header: 'Log', icon: 'message', title_key: 'log_manager_title' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  scrollBehavior: (to, from, savedPosition) => (savedPosition ? savedPosition : { x: 0, y: 0 }),
  routes: constantRouterMap
})
