<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Zarządzanie Produktami</h2>
       <!-- Optional: Add Product Button logic later if needed -->
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Cena</th>
              <th>Kategoria</th>
              <th class="text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>{{ p.id }}</td>
              <td class="fw-bold">{{ p.name }}</td>
              <td>{{ p.price }} zł</td>
              <td>
                 {{ getCategoryName(p.category_id) }}
              </td>
              <td class="text-center">
                <router-link :to="`/admin/products/${p.id}`" class="btn btn-sm btn-primary">
                  Edytuj
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const products = ref([]);
const categories = ref([]);

const fetchData = async () => {
    try {
        const [pRes, cRes] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/categories')
        ]);
        products.value = pRes.data;
        categories.value = cRes.data;
    } catch (err) {
        console.error("Failed to load data", err);
    }
}

const getCategoryName = (id) => {
    const cat = categories.value.find(c => c.id == id);
    return cat ? cat.name : id;
}

onMounted(fetchData);
</script>
