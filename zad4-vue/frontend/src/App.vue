<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
      <router-link class="navbar-brand" to="/">Interprety</router-link>
      <div class="navbar-nav ms-auto">
        <router-link class="nav-link" to="/checkout"
          >Koszyk ({{ cart.count }})</router-link
        >
        <template v-if="auth.user?.role === 'PRACOWNIK'">
          <router-link class="nav-link" to="/admin/orders">Zamówienia</router-link>
          <router-link class="nav-link" to="/admin/products">Produkty</router-link>
        </template>
        
        <template v-if="auth.isAuthenticated">
             <button class="btn btn-outline-light ms-2" @click="handleLogout">Wyloguj ({{ auth.user?.login }})</button>
        </template>
        <template v-else>
             <router-link class="btn btn-outline-light ms-2" to="/login">Zaloguj</router-link>
        </template>
      </div>
    </div>
  </nav>
  <router-view />
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter();

auth.initialize();

const handleLogout = () => {
  auth.logout();
  router.push('/');
};
</script>
