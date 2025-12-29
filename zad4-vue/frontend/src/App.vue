<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
      <router-link class="navbar-brand" to="/">Moja Apka Zad3</router-link>
      <div class="navbar-nav ms-auto">
        <router-link class="nav-link" to="/checkout"
          >Koszyk ({{ cart.count }})</router-link
        >
        <router-link class="nav-link" to="/admin/orders">Admin</router-link>
      </div>
    </div>
  </nav>
  <router-view />
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
const cart = useCartStore();
</script>
