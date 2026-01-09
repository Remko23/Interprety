import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/Home.vue'
import CheckoutView from '@/components/Checkout.vue'
import AdminOrders from '@/components/AdminOrdersList.vue'
import AdminProductEdit from '@/components/AdminProductEdit.vue'
import AdminProductsList from '@/components/AdminProductsList.vue'
import AdminInitProducts from '@/components/AdminInitProducts.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import MyOrders from '@/components/MyOrders.vue'
import OpinionList from '@/components/OpinionList.vue'

import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/checkout', component: CheckoutView },
    { path: '/admin/orders', component: AdminOrders, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/products', component: AdminProductsList, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/products/add', component: AdminProductEdit, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/products/:id', component: AdminProductEdit, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/admin/init', component: AdminInitProducts, meta: { requiresAuth: true, role: 'PRACOWNIK' } },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/my-orders', component: MyOrders, meta: { requiresAuth: true, role: ['KLIENT', 'PRACOWNIK'] } },
    { path: '/opinions', component: OpinionList },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return next('/login');
    }

    const requiredRole = to.meta.role;
    if (requiredRole) {
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(auth.user?.role)) {
          return next('/');
        }
      } else if (auth.user?.role !== requiredRole) {
        return next('/');
      }
    }
  }
  next();
});

export default router