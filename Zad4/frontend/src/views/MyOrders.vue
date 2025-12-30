<template>
  <div class="container mt-4">
    <h2 class="mb-4">Moje zamówienia</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="orders.length === 0" class="alert alert-info">
      Nie złożono jeszcze żadnych zamówień.
    </div>

    <div v-else>
      <div v-for="order in orders" :key="order.id" class="card mb-3 shadow-sm">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <span>
            <strong  class="text-warning">Zamówienie nr. {{ order.id }}</strong>
          </span>
          <span class="text-pink fw-bold">
            {{ translateStatus(order.status?.name) }}
          </span>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush mb-3">
             <li v-for="item in order.items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                 <span>{{ item.product_name }}</span>
                 <span>{{ item.quantity }} szt. x {{ item.unit_price }} zł</span>
             </li>
          </ul>
          <div class="d-flex justify-content-between align-items-center">
               <h5 class="text-warning mb-0">Suma: {{ calculateTotal(order.items) }} zł</h5>
               
               <div v-if="canRate(order)">
                   <button v-if="!order.opinion" @click="openRateModal(order)" class="btn btn-outline-warning">
                       Oceń zamówienie
                   </button>
                   <span v-else class="text-warning fw-bold">
                       Opinia dodana!
                   </span>
               </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Dodaj opinię do zamówienia #{{ selectedOrder?.id }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitOpinion">
                <div class="mb-3">
                    <label class="form-label fw-bold">Ocena (1-5)</label>
                    <div class="d-flex gap-2">
                        <button 
                            type="button" 
                            v-for="star in 5" 
                            :key="star"
                            @click="opinionForm.rating = star"
                            class="btn btn-sm"
                            :class="opinionForm.rating >= star ? 'btn-warning' : 'btn-outline-secondary'"
                        >
                        ★
                        </button>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Treść opinii</label>
                    <textarea v-model="opinionForm.content" class="form-control" rows="3" required minlength="5"></textarea>
                </div>
                
                <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
                <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" @click="closeModal">Anuluj</button>
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                        <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                        Wyślij
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
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const orders = ref([]);
const loading = ref(true);

const showModal = ref(false);
const selectedOrder = ref(null);
const submitting = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const opinionForm = reactive({
    rating: 0,
    content: ""
});

const fetchMyOrders = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/orders/user/${auth.user.login}`);
        orders.value = response.data.reverse();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const canRate = (order) => {
    const status = order.status?.name?.toUpperCase();
    return status === 'ZREALIZOWANE' || status === 'COMPLETED' || status === 'ANULOWANE' || status === 'CANCELED';
};

const openRateModal = (order) => {
    selectedOrder.value = order;
    opinionForm.rating = 5;
    opinionForm.content = "";
    errorMsg.value = "";
    successMsg.value = "";
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    setTimeout(() => {
        selectedOrder.value = null;
    }, 200);
};

const submitOpinion = async () => {
    if (opinionForm.rating === 0) {
        errorMsg.value = "Proszę wybrać ocenę gwiazdkową.";
        return;
    }
    
    submitting.value = true;
    errorMsg.value = "";
    
    try {
        await axios.post(`/api/orders/${selectedOrder.value.id}/opinions`, {
            rating: opinionForm.rating,
            content: opinionForm.content
        });
        
        successMsg.value = "Opinia dodana pomyślnie!";
        await fetchMyOrders();
        
        setTimeout(() => {
            closeModal();
        }, 1500);
        
    } catch (err) {
        errorMsg.value = err.response?.data?.detail || "Błąd podczas dodawania opinii.";
    } finally {
        submitting.value = false;
    }
};

const calculateTotal = (items) => {
  return items
    .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    .toFixed(2);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pl-PL') + ' ' + new Date(dateStr).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'});
}

const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
        case 'ZREALIZOWANE':
        case 'COMPLETED': return 'ZREALIZOWANE';
        case 'ANULOWANE':
        case 'CANCELED': return 'ANULOWANE';
        case 'NIEZREALIZOWANE':
        case 'UNCONFIRMED': return 'NIEZATWIERDZONE';
        case 'NOWE': return 'NOWE';
        case 'CONFIRMED':
        case 'ZATWIERDZONE': return 'ZATWIERDZONE';
        default: return status;
    }
};

onMounted(fetchMyOrders);
</script>
