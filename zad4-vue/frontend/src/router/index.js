import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import CheckoutView from '@/views/Checkout.vue'
import AdminOrders from '@/views/Admin/Orders.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/checkout', component: CheckoutView },
    { path: '/admin/orders', component: AdminOrders },
    { path: '/login', component: () => import('@/views/Login.vue') }
  ]
})

export default router