<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Edycja Produktu #{{ productId }}</h4>
          </div>
          <div class="card-body">
            <div v-if="loadingData" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
            
            <form v-else @submit.prevent="handleSave">
              <div class="mb-3">
                <label class="form-label fw-bold">Nazwa</label>
                <input v-model="product.name" type="text" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Opis</label>
                <div class="input-group">
                    <textarea v-model="product.description" class="form-control" rows="4"></textarea>
                    <button type="button" @click="optimizeDescription" class="btn btn-outline-info" title="Optymalizuj opis (SEO)">
                         <span v-if="seoLoading" class="spinner-border spinner-border-sm"></span>
                         <span v-else>Optymalizuj</span>
                    </button>
                </div>
                <small class="text-muted">Kliknij "Optymalizuj", aby wygenerować opis SEO.</small>
              </div>

              <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Cena (zł)</label>
                    <input v-model.number="product.price" type="number" step="0.01" class="form-control" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Waga (kg)</label>
                    <input v-model.number="product.weight" type="number" step="0.01" class="form-control" required />
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
                <router-link to="/admin/products" class="btn btn-secondary">Anuluj</router-link>
                <button type="submit" class="btn btn-success" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    Zapisz zmiany
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const productId = route.params.id;

const product = ref({});
const categories = ref([]);

const loadingData = ref(true);
const saving = ref(false);
const seoLoading = ref(false);

const errorMessage = ref("");
const successMessage = ref("");

const fetchData = async () => {
    loadingData.value = true;
    try {
        const [pRes, cRes] = await Promise.all([
            axios.get(`/api/products/${productId}`),
            axios.get('/api/categories')
        ]);
        product.value = pRes.data;
        categories.value = cRes.data;
    } catch (err) {
        errorMessage.value = "Nie udało się pobrać danych produktu.";
    } finally {
        loadingData.value = false;
    }
}

const optimizeDescription = async () => {
    seoLoading.value = true;
    try {
        const res = await axios.get(`/api/products/${productId}/seo-description`);
        // The backend returns text/plain or json? Checking OrderController/ProductsController logic implies it might return text or object
        // Let's assume text or { description: ... }
        // Wait, ProductsController.getSeoDesc:
        // res.status(StatusCodes.OK).send(desc); -> Text response likely.
        
        if (typeof res.data === 'string') {
            product.value.description = res.data;
        } else if (res.data.description) {
            product.value.description = res.data.description;
        } else {
             // Fallback
             product.value.description = JSON.stringify(res.data);
        }
    } catch(err) {
        alert("Błąd podczas generowania opisu SEO.");
    } finally {
        seoLoading.value = false;
    }
}

const handleSave = async () => {
    saving.value = true;
    errorMessage.value = "";
    successMessage.value = "";
    
    try {
        await axios.put(`/api/products/${productId}`, {
            product: {
                id: productId,
                name: product.value.name,
                description: product.value.description,
                price: product.value.price,
                weight: product.value.weight,
                category_id: product.value.category_id
            }
        });
        successMessage.value = "Produkt został zaktualizowany.";
    } catch (err) {
         if (err.response && err.response.data) {
            errorMessage.value = err.response.data.detail || err.response.data.message || "Błąd zapisu.";
        } else {
            errorMessage.value = "Błąd połączenia z serwerem.";
        }
    } finally {
        saving.value = false;
    }
}

onMounted(fetchData);
</script>
