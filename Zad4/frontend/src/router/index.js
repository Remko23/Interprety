import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import CheckoutView from '@/views/Checkout.vue'
import AdminOrders from '@/views/Admin/Orders.vue'

import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/checkout', component: CheckoutView },
    { path: '/admin/orders', component: AdminOrders, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/products', component: () => import('@/views/Admin/ProductList.vue'), meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/products/:id', component: () => import('@/views/Admin/ProductEdit.vue'), meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/register', component: () => import('@/views/Register.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return next('/login');
    }

    if (to.meta.role && auth.user?.role !== to.meta.role) {
      return next('/');
    }
  }
  next();
});

export default router