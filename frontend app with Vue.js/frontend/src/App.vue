<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
      <router-link class="navbar-brand" to="/"><i class="fa-solid fa-shop"></i> Sklep</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav ms-auto">
          <template v-if="auth.user?.role === 'PRACOWNIK'">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-solid fa-hammer"></i> AdminPanel </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                <li><router-link class="dropdown-item" to="/admin/orders"><i class="fa-solid fa-clipboard-list"></i> Zamówienia</router-link></li>
                <li><router-link class="dropdown-item" to="/admin/products"><i class="fa-solid fa-tags"></i> Produkty</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><router-link class="dropdown-item" to="/admin/init"><i class="fa-solid fa-file-arrow-up"></i> Inicjalizacja</router-link></li>
              </ul>
            </li>
          </template>
          
          <router-link class="nav-link" to="/checkout"><i class="fa-solid fa-cart-shopping"></i> Koszyk  ({{ cart.count }})</router-link>
          <router-link v-if="auth.user && ['KLIENT', 'PRACOWNIK'].includes(auth.user.role)" class="nav-link" to="/my-orders"><i class="fa-solid fa-list"></i> Moje zamówienia</router-link>
          <router-link class="nav-link" to="/opinions"><i class="fa-solid fa-comment-dots"></i> Opinie</router-link>

          <template v-if="auth.isAuthenticated">
              <button class="btn btn-outline-light ms-2" @click="handleLogout">({{ auth.user?.login }}) Wyloguj <i class="fa-solid fa-right-from-bracket"></i></button>
          </template>
          <template v-else>
              <router-link class="btn btn-outline-light ms-2" to="/login">Zaloguj się <i class="fa-solid fa-sign-in-alt"></i></router-link>
          </template>
        </div>
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
