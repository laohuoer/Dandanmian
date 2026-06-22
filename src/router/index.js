import { createRouter, createWebHistory } from 'vue-router'

// 前台页面
const GalleryView = () => import('../views/GalleryView.vue')

// 后台页面
const AdminLayout = () => import('../views/admin/AdminLayout.vue')
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const PhotoManager = () => import('../views/admin/PhotoManager.vue')
const PhotoForm = () => import('../views/admin/PhotoForm.vue')
const CategoryManager = () => import('../views/admin/CategoryManager.vue')

const routes = [
  {
    path: '/',
    name: 'Gallery',
    component: GalleryView
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'photos',
        name: 'PhotoManager',
        component: PhotoManager
      },
      {
        path: 'photos/new',
        name: 'PhotoNew',
        component: PhotoForm
      },
      {
        path: 'photos/:id/edit',
        name: 'PhotoEdit',
        component: PhotoForm,
        props: true
      },
      {
        path: 'categories',
        name: 'CategoryManager',
        component: CategoryManager
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
