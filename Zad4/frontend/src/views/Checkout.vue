<template>
  <div class="container mt-4">
    <h2 class="mb-4">Twoje Zamówienie</h2>

    <div v-if="cartStore.items.length === 0" class="alert alert-info shadow-sm">
      Twój koszyk jest pusty.
      <router-link to="/" class="alert-link"
        >Wróć do listy produktów</router-link
      >, aby coś dodać.
    </div>

    <div v-else class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <div class="card-body p-0">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="ps-3">Towar</th>
                  <th style="width: 150px">Ilość</th>
                  <th>Cena jedn.</th>
                  <th>Łącznie</th>
                  <th class="text-center">Akcja</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in cartStore.items" :key="item.id">
                  <td class="ps-3">
                    <div class="fw-bold">{{ item.name }}</div>
                    <small class="text-muted">{{ item.description }}</small>
                  </td>
                  <td>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      @change="cartStore.save()"
                      min="1"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>{{ item.price }} zł</td>
                  <td>{{ (item.price * item.quantity).toFixed(2) }} zł</td>
                  <td class="text-center">
                    <button
                      @click="cartStore.removeFromCart(index)"
                      class="btn btn-outline-danger btn-sm"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-sm border-primary">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">Dane kontaktowe</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleOrderSubmit">
              <div class="mb-3">
                <label class="form-label small fw-bold"
                  >Nazwa użytkownika</label
                >
                <input
                  v-model="userData.username"
                  type="text"
                  class="form-control"
                  placeholder="Nazwa użytkownika"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Email</label>
                <input
                  v-model="userData.email"
                  type="email"
                  class="form-control"
                  placeholder="uzytkownik@example.com"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Telefon</label>
                <input
                  v-model="userData.phone"
                  type="tel"
                  class="form-control"
                  placeholder="Numer telefonu"
                  required
                />
              </div>

              <hr />

              <div class="d-flex justify-content-between mb-3">
                <span class="h5">Suma:</span>
                <span class="h5 text-primary"
                  >{{ cartStore.totalPrice }} zł</span
                >
              </div>

              <button
                type="submit"
                class="btn btn-success btn-lg w-100"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Zatwierdź zamówienie
              </button>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3 small p-2">
              <strong>Błąd:</strong> {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useCartStore } from "@/stores/cart";
import axios from "axios";
import { useRouter } from "vue-router";

const cartStore = useCartStore();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");

const userData = reactive({
  username: "",
  email: "",
  phone: "",
});

const handleOrderSubmit = async () => {
  loading.value = true;
  errorMessage.value = "";

  // Przygotowanie danych do wysyłki (zgodnie z API)
  const orderData = {
    user_name: userData.username,
    email: userData.email,
    phone_number: userData.phone,
    items: cartStore.items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
  };

  try {
    // Wysłanie zamówienia na backend (endpoint z Zad3)
    await axios.post("/api/orders", orderData);

    alert("Dziękujemy! Zamówienie zostało złożone.");

    // Czyszczenie koszyka po sukcesie
    cartStore.items = [];
    cartStore.save();

    // Przekierowanie na stronę główną
    router.push("/");
  } catch (error) {
    // Obsługa błędów przesyłanych z serwera
    if (error.response && error.response.data) {
      // Jeśli serwer zwrócił szczegóły (np. format Problem Details)
      errorMessage.value =
        error.response.data.detail ||
        error.response.data.message ||
        "Wystąpił błąd podczas składania zamówienia.";
    } else {
      errorMessage.value = "Brak połączenia z serwerem.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@media (max-width: 768px) {
  .table-responsive {
    border: 0;
  }
}
</style>
