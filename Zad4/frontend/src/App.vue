<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
      <router-link class="navbar-brand" to="/">Sklep</router-link>
      <div class="navbar-nav ms-auto">
        <router-link class="nav-link" to="/checkout"
          >Koszyk ({{ cart.count }})</router-link
        >
        <template v-if="auth.user?.role === 'PRACOWNIK'">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              AdminPanel
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
              <li><router-link class="dropdown-item" to="/admin/orders">Zamówienia</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/products">Produkty</router-link></li>
               <li><hr class="dropdown-divider"></li>
              <li><router-link class="dropdown-item" to="/admin/init">Inicjalizacja</router-link></li>
            </ul>
          </li>
        </template>
        
        <router-link v-if="auth.user && ['KLIENT', 'PRACOWNIK'].includes(auth.user.role)" class="nav-link" to="/my-orders">Moje zamówienia</router-link>
        <router-link class="nav-link" to="/opinions">Opinie</router-link>

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
