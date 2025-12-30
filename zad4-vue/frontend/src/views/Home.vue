<template>
  <div class="container">
    <div class="row mb-3">
      <div class="col-md-6">
        <input
          v-model="filters.name"
          class="form-control"
          placeholder="Filtruj po nazwie..."
        />
      </div>
      <div class="col-md-6">
        <select v-model="filters.category" class="form-select">
          <option value="">Wszystkie kategorie</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <table class="table table-hover border">
      <thead class="table-light">
        <tr>
          <th>Nazwa</th>
          <th>Opis</th>
          <th>Cena</th>
          <th>Akcja</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredProducts" :key="p.id">
          <td>{{ p.name }}</td>
          <td v-html="p.description"></td>
          <td>{{ p.price }} zł</td>
          <td class="text-end">
            <button @click="cart.addToCart(p)" class="btn btn-success btn-sm">
              Dodaj do koszyka
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import axios from "axios";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const filters = reactive({ name: "", category: "" });

onMounted(async () => {
  const [pRes, cRes] = await Promise.all([
    axios.get("/api/products"),
    axios.get("/api/categories"),
  ]);
  products.value = pRes.data;
  categories.value = cRes.data;
});

const filteredProducts = computed(() => {
  return products.value.filter(
    (p) =>
      p.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (!filters.category || p.category_id == filters.category)
  );
});
</script>
