<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Panel Administratora - Zamówienia</h3>

      <div class="btn-group shadow-sm">
        <button v-for="status in availableStatuses" :key="status.id" @click="currentFilter = status.name" class="btn btn-primary">
          {{ translateStatus(status.name) }}
        </button>
        <button @click="currentFilter = 'WSZYSTKIE'" class="btn btn-secondary">
          Wszystkie
        </button>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Data zatwierdzenia</th>
              <th>Wartość</th>
              <th>Klient</th>
              <th>Produkty (szt.)</th>
              <th>Opinia</th>
              <th>Status</th>
              <th class="text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="fw-bold">#{{ order.id }}</td>
              <td>{{ formatDate(order.approval_date) }}</td>
              <td class="text-warning fw-bold text-nowrap"> {{ calculateTotal(order.items) }} zł</td>
              <td>
                <div class="small">{{ order.user_name }}</div>
                <div class="smaller">{{ order.email }}</div>
              </td>
              <td>
                <ul class="list-unstyled mb-0 smaller">
                  <li v-for="item in order.items" :key="item.id"> <i class="fa-solid fa-caret-right"></i> {{ item.product_name}} ({{item.quantity}}szt.)</li>
                </ul>
              </td>
              <td>
                 <div v-if="order.opinion && order.opinion.id">
                     <button @click="openOpinionModal(order.opinion)" class="btn btn-sm btn-outline-info" title="Zobacz treść"><i class="fa-solid fa-eye"></i></button>
                 </div>
                 <span v-else class="text-warning"><i class="fa-solid fa-x"></i></span>
              </td>
              <td>
                <span class="text-pink fw-bold">
                  {{ translateStatus(order.status?.name) }}
                </span>
              </td>
              <td class="text-center">
                <div v-if=" ['UNCONFIRMED', 'CONFIRMED'].includes(order.status?.name)" class="btn-group btn-group-sm">
                  <button v-if="['UNCONFIRMED'].includes(order.status?.name)" @click="updateStatus(order.id, 'CONFIRMED')" class="btn btn-primary" title="Zatwierdź"> Zatwierdź </button>
                  <button v-if="['CONFIRMED'].includes(order.status?.name)" @click="updateStatus(order.id, 'COMPLETED')" class="btn btn-success" title="Zrealizuj"> Zrealizuj </button>
                  <button @click="updateStatus(order.id, 'CANCELED')" class="btn btn-danger" title="Anuluj"> Anuluj </button>
                </div>
                <span v-else class="text-warning"><i class="fa-solid fa-x"></i></span>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="8" class="text-center py-4 text-muted">
                Brak zamówień o statusie: {{ currentFilter }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showOpinionModal" class="modal-backdrop fade show"></div>
    <div v-if="showOpinionModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Opinia klienta</h5>
            <button type="button" class="btn-close" @click="closeOpinionModal"></button>
          </div>
          <div class="modal-body" v-if="selectedOpinion">
            <div class="mb-3">
                <strong>Ocena:</strong> 
                <span class="text-warning ms-2">
                    <span v-for="n in 5" :key="n" class="fs-5">
                         {{ n <= selectedOpinion.rating ? '★' : '☆' }}
                    </span>
                </span>
            </div>
            <div class="mb-3">
                <strong>Treść:</strong>
                <p class="mt-2 p-3 bg-light rounded border">
                    {{ selectedOpinion.content }}
                </p>
            </div>
            <div class="text-end text-muted small">
                 Dodano: {{ formatDate(selectedOpinion.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const orders = ref([]);
const availableStatuses = ref([]);
const currentFilter = ref("WSZYSTKIE");

const fetchOrders = async () => {
  try {
    const [ordersRes, statusRes] = await Promise.all([
      axios.get("/api/orders"),
      axios.get("/api/status"),
    ]);
    orders.value = ordersRes.data;
    availableStatuses.value = statusRes.data;
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      alert(`Błąd: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
        alert("Błąd połączenia lub inny problem.");
    }
  }
};

const filteredOrders = computed(() => {
  if (currentFilter.value === "WSZYSTKIE") return orders.value;
  return orders.value.filter((o) => o?.status?.name === currentFilter.value);
});

const updateStatus = async (orderId, newStatusName) => {
  const statusObj = availableStatuses.value.find(
    (s) => s.name.toUpperCase() === newStatusName.toUpperCase()
  );
  
  if (!statusObj) {
    alert(`Nie znaleziono statusu: ${newStatusName}`);
    return;
  }

  try {
    await axios.patch(`/api/orders/${orderId}`, {
      status_id: statusObj.id,
    });

    await fetchOrders();
  } catch (error) {
    const errorMsg =
      error.response?.data?.detail || "Błąd podczas aktualizacji statusu.";
    alert(errorMsg);
  }
};

const calculateTotal = (items) => {
  return items
    .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    .toFixed(2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("pl-PL");
};

const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
        case 'COMPLETED': return 'ZREALIZOWANE';
        case 'CANCELED': return 'ANULOWANE';
        case 'UNCONFIRMED': return 'NIEZATWIERDZONE';
        case 'CONFIRMED': return 'ZATWIERDZONE';
        default: return status;
    }
};

const showOpinionModal = ref(false);
const selectedOpinion = ref(null);

const openOpinionModal = (opinion) => {
    selectedOpinion.value = opinion;
    showOpinionModal.value = true;
};

const closeOpinionModal = () => {
    showOpinionModal.value = false;
    selectedOpinion.value = null;
};

onMounted(fetchOrders);
</script>
