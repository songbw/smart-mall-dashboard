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
    redirect: '/products',
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
        path: 'sync',
        name: 'ProductSync',
        component: () => import('@/views/sync/index'),
        meta: { title: '商品同步', icon: 'sync', roles: [role_admin_name] }
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
