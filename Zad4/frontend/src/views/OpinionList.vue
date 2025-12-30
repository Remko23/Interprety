<template>
  <div class="container mt-4">
    <h2 class="mb-4">Opinie klientów</h2>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>
    
    <div v-else-if="opinions.length === 0" class="alert alert-info">
        Brak opinii o obsłudze zamówień.
    </div>

    <div v-else class="row">
        <div v-for="opinion in opinions" :key="opinion.id" class="col-md-6 mb-3">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                         <div class="text-warning">
                             <span v-for="n in 5" :key="n" class="fs-5">
                                 {{ n <= opinion.rating ? '★' : '☆' }}
                             </span>
                         </div>
                         <small>{{ formatDate(opinion.created_at) }}</small>
                    </div>
                    <p class="card-text">{{ opinion.content }}</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const opinions = ref([]);
const loading = ref(true);

const fetchOpinions = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/opinions');
        opinions.value = response.data;
    } catch (error) {
        console.error("Błąd pobierania opinii:", error);
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

onMounted(fetchOpinions);
</script>
