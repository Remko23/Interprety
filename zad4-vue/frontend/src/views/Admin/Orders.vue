<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Panel Administratora - Zamówienia</h2>

      <div class="btn-group shadow-sm">
        <button
          v-for="status in availableStatuses"
          :key="status.id"
          @click="currentFilter = status.name"
          class="btn"
          :class="
            currentFilter === status.name
              ? 'btn-primary'
              : 'btn-outline-primary'
          "
        >
          {{ status.name }}
        </button>
        <button
          @click="currentFilter = 'WSZYSTKIE'"
          class="btn"
          :class="
            currentFilter === 'WSZYSTKIE'
              ? 'btn-secondary'
              : 'btn-outline-secondary'
          "
        >
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
              <th>Status</th>
              <th class="text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="fw-bold">#{{ order.id }}</td>
              <td>{{ formatDate(order.order_date) }}</td>
              <td class="text-success fw-bold">
                {{ calculateTotal(order.items) }} zł
              </td>
              <td>
                <div class="small">{{ order.user_name }}</div>
                <div class="text-muted smaller">{{ order.user_email }}</div>
              </td>
              <td>
                <ul class="list-unstyled mb-0 smaller">
                  <li v-for="item in order.items" :key="item.id">
                    •
                    {{ item.product_name || "Produkt #" + item.product_id }} ({{
                      item.quantity
                    }}
                    szt.)
                  </li>
                </ul>
              </td>
              <td>
                <span :class="getStatusBadgeClass(order.status_name)">
                  {{ order.status_name }}
                </span>
              </td>
              <td class="text-center">
                <div
                  v-if="
                    order.status_name === 'NIEZREALIZOWANE' ||
                    order.status_name === 'NOWE'
                  "
                  class="btn-group btn-group-sm"
                >
                  <button
                    @click="updateStatus(order.id, 'ZREALIZOWANE')"
                    class="btn btn-success"
                    title="Zrealizuj"
                  >
                    Zrealizuj
                  </button>
                  <button
                    @click="updateStatus(order.id, 'ANULOWANE')"
                    class="btn btn-danger"
                    title="Anuluj"
                  >
                    Anuluj
                  </button>
                </div>
                <span v-else class="text-muted small italic">Brak akcji</span>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                Brak zamówień o statusie: {{ currentFilter }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const orders = ref([]);
const availableStatuses = ref([]);
const currentFilter = ref("NIEZREALIZOWANE"); // Domyślnie pokazujemy niezrealizowane

// Pobieranie danych z backendu Zad3
const fetchOrders = async () => {
  try {
    const [ordersRes, statusRes] = await Promise.all([
      axios.get("/api/orders"),
      axios.get("/api/statuses"),
    ]);
    orders.value = ordersRes.data;
    availableStatuses.value = statusRes.data;
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    alert("Nie udało się pobrać listy zamówień.");
  }
};

// Filtrowanie zamówień na froncie
const filteredOrders = computed(() => {
  if (currentFilter.value === "WSZYSTKIE") return orders.value;
  return orders.value.filter((o) => o.status_name === currentFilter.value);
});

// Zmiana statusu zamówienia (używamy PATCH/PUT zgodnie z API Zad3)
const updateStatus = async (orderId, newStatusName) => {
  const statusObj = availableStatuses.value.find(
    (s) => s.name === newStatusName
  );
  if (!statusObj) return;

  try {
    // Zakładamy, że backend przyjmuje status_id w body
    await axios.patch(`/api/orders/${orderId}`, {
      status_id: statusObj.id,
    });

    // Odświeżamy listę po sukcesie
    await fetchOrders();
  } catch (error) {
    const errorMsg =
      error.response?.data?.detail || "Błąd podczas aktualizacji statusu.";
    alert(errorMsg);
  }
};

// Funkcje pomocnicze
const calculateTotal = (items) => {
  return items
    .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    .toFixed(2);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString("pl-PL");
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "ZREALIZOWANE":
      return "badge bg-success";
    case "ANULOWANE":
      return "badge bg-danger";
    case "NIEZREALIZOWANE":
      return "badge bg-warning text-dark";
    default:
      return "badge bg-info";
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.smaller {
  font-size: 0.85rem;
}
.italic {
  font-style: italic;
}
</style>
