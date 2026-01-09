<template>
  <div class="container mt-4">
    <div v-if="orderSuccess" class="text-center py-5">
      <h2 class="mb-3 text-warning">Dziękujemy!</h2>
      <p class="lead mb-4">Twoje zamówienie zostało pomyślnie złożone.</p>
      <router-link to="/" class="btn btn-primary btn-lg">Wróć do strony głównej</router-link>
    </div>

    <div v-else>
      <h2 class="mb-4">Twoje Zamówienie</h2>
      <div v-if="cartStore.items.length === 0" class="alert alert-info shadow-sm">
        Twój koszyk jest pusty. <router-link to="/" class="alert-link">Wróć do listy produktów</router-link>, aby coś dodać.
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

                  </td>
                  <td>
                    <input type="number" v-model.number="item.quantity" @input="validateQuantity(item)" min="1" max="1000" class="form-control form-control-sm"/>
                  </td>
                  <td>{{ item.price }} zł</td>
                  <td>{{ (item.price * item.quantity).toFixed(2) }} zł</td>
                  <td class="text-center">
                    <button @click="cartStore.removeFromCart(index)" class="btn btn-outline-danger btn-sm"> Usuń <i class="fa-solid fa-trash"></i> </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Dane kontaktowe</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleOrderSubmit">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Imię</label>
                  <input v-model="userData.firstName" type="text" class="form-control" placeholder="Wpisz imię" required/>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Nazwisko</label>
                  <input v-model="userData.lastName" type="text" class="form-control" placeholder="Wpisz nazwisko" required/>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Nazwa użytkownika</label>
                <input v-model="userData.username" type="text" class="form-control" placeholder="Nazwa użytkownika" required readonly/>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Email</label>
                <input v-model="userData.email" type="email" class="form-control" placeholder="uzytkownik@example.com" required/>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Telefon</label>
                <input v-model="userData.phone" type="tel" class="form-control" placeholder="Numer telefonu" required/>
              </div>

              <hr/>

              <div class="d-flex justify-content-between mb-3">
                <span class="h5">Suma:</span>
                <span class="h5 text-warning">{{ cartStore.totalPrice }} zł</span>
              </div>
              <button type="submit" class="btn btn-success btn-lg w-100"> Zatwierdź zamówienie <i class="fa-solid fa-check"></i></button>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3 small p-2">
              <strong>Błąd:</strong> {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const cartStore = useCartStore();
const authStore = useAuthStore();

const errorMessage = ref("");
const orderSuccess = ref(false);

const userData = reactive({
  username: "",
  email: "",
  phone: "",
});

onMounted(() => {
    if (authStore.user && authStore.user.login) {
        userData.username = authStore.user.login;
    } else {
        userData.username = "niezalogowany";
    }
});

const handleOrderSubmit = async () => {
  errorMessage.value = "";
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
    await axios.post("/api/orders", orderData);
    cartStore.items = [];
    cartStore.save();
    orderSuccess.value = true;
  } catch (error) {
    if (error.response && error.response.data) {
      errorMessage.value =
        error.response.data.detail ||
        error.response.data.message ||
        "Wystąpił błąd podczas składania zamówienia.";
    } else {
      errorMessage.value = "Brak połączenia z serwerem.";
    }
  }
};

const validateQuantity = (item) => {
  if (item.quantity > 1000) {
    item.quantity = 1000;
  } else if (item.quantity < 1 && item.quantity !== '') {
    item.quantity = 1;
  }
  cartStore.save();
};
</script>
