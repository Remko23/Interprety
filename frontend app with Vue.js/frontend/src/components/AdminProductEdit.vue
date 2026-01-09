<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">{{ isEditMode ? 'Edycja produktu' : 'Dodawanie produktu' }} <i class="fa-solid" :class="isEditMode ? 'fa-pen-to-square' : 'fa-plus'"></i></h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSave">
              <div class="mb-3">
                <label class="form-label fw-bold">Nazwa</label>
                <input v-model="product.name" type="text" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Opis</label>
                <div class="input-group">
                    <textarea v-model="product.description" class="form-control" rows="4"></textarea>
                    <button v-if="isEditMode" type="button" @click="optimizeDescription" class="btn btn-outline-info" title="Optymalizuj opis (SEO)">
                         <span>Optymalizuj <i class="fa-solid fa-wand-magic-sparkles"></i></span>
                    </button>
                </div>
                <small class="text-muted" v-if="!isEditMode">Kliknij "Optymalizuj", aby wygenerować opis SEO.</small>
              </div>

              <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Cena (zł)</label>
                    <input v-model.number="product.price" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Waga (kg)</label>
                    <input v-model.number="product.weight" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Kategoria</label>
                    <select v-model="product.category_id" class="form-select" required>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                  </div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

              <div class="d-flex justify-content-between mt-4">
                <router-link to="/admin/products" class="btn btn-secondary">Anuluj <i class="fa-solid fa-ban"></i></router-link>
                <button type="submit" class="btn btn-success">
                    {{ isEditMode ? 'Zapisz zmiany' : 'Dodaj produkt' }} <i class="fa-solid" :class="isEditMode ? 'fa-file-arrow-down' : 'fa-check'"></i>
                </button> 
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const isEditMode = computed(() => !!productId);

const product = ref({
    name: '',
    description: '',
    price: '',
    weight: '',
    category_id: null
});
const categories = ref([]);

const errorMessage = ref("");
const successMessage = ref("");

const fetchData = async () => {
    try {
        const requests = [axios.get('/api/categories')];
        if (isEditMode.value) {
            requests.push(axios.get(`/api/products/${productId}`));
        }
        
        const responses = await Promise.all(requests);
        categories.value = responses[0].data;
        
        if (isEditMode.value) {
            product.value = responses[1].data;
        }
    } catch (err) {
        errorMessage.value = "Nie udało się pobrać danych.";
    }
}

const optimizeDescription = async () => {
    if (!product.value.name) return;
    try {
        if (!isEditMode.value) {
            alert("Optymalizacja dostępna tylko dla zapisanych produktów.");
            return;
        }

        const res = await axios.get(`/api/products/${productId}/seo-description`);        
        if (typeof res.data === 'string') {
            product.value.description = res.data;
        } else if (res.data.description) {
            product.value.description = res.data.description;
        } else {
             product.value.description = JSON.stringify(res.data);
        }
    } catch(err) {
        alert("Błąd podczas generowania opisu SEO.");
    }
}

const handleSave = async () => {
    errorMessage.value = "";
    successMessage.value = "";
    
    try {
        const productData = {
            name: product.value.name,
            description: product.value.description,
            price: parseFloat(product.value.price),
            weight: parseFloat(product.value.weight),
            category_id: product.value.category_id
        };

        if (isEditMode.value) {
            await axios.put(`/api/products/${productId}`, { 
                product: { ...productData, id: productId } 
            });
            successMessage.value = "Produkt został zaktualizowany.";
            setTimeout(() => {
                router.push('/admin/products');
            }, 1000);
        } else {
            await axios.post('/api/products', productData);
            successMessage.value = "Produkt został dodany pomyślnie.";
            setTimeout(() => {
                router.push('/admin/products');
            }, 1000);
        }
    } catch (err) {
         if (err.response && err.response.data) {
            errorMessage.value = err.response.data.detail || err.response.data.message || "Błąd zapisu.";
        } else {
            errorMessage.value = "Błąd połączenia z serwerem.";
        }
    }
}

onMounted(fetchData);
</script>
