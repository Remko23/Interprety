<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow border-0">
          <div class="card-header bg-dark text-white text-center py-3">
            <h4 class="mb-0">Logowanie</h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label fw-bold">Nazwa użytkownika</label>
                <input
                  v-model="loginData.username"
                  type="text"
                  class="form-control"
                  placeholder="Wpisz login"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Hasło</label>
                <input
                  v-model="loginData.password"
                  type="password"
                  class="form-control"
                  placeholder="Wpisz hasło"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 mt-2"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Zaloguj się
              </button>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3 small">
              {{ errorMessage }}
            </div>

            <div class="mt-4 text-center">
              <p class="text-muted small">Nie masz konta?</p>
              <router-link
                to="/register"
                class="btn btn-outline-secondary btn-sm"
              >
                Zarejestruj się jako klient
              </router-link>
            </div>
          </div>
        </div>
        <div class="text-center mt-3">
          <router-link to="/" class="text-decoration-none small text-secondary">
            ← Wróć do sklepu bez logowania
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const errorMessage = ref("");

const loginData = reactive({
  username: "",
  password: "",
});

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      user_name: loginData.username,
      password: loginData.password,
    };

    const response = await axios.post("/api/users/login", payload);

    const { token, role } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const redirectPath =
      route.query.redirect || (role === "admin" ? "/admin/orders" : "/");
    router.push(redirectPath);
  } catch (error) {
    console.error("Szczegóły błędu:", error.response?.data); // Dodaj to, aby widzieć w konsoli F12 co dokładnie nie pasuje backendowi

    if (error.response && error.response.status === 401) {
      // Wyświetl szczegółowy komunikat z Twojej funkcji problem() na backendzie
      errorMessage.value =
        error.response.data.detail || "Błędny login lub hasło.";
    } else if (error.response && error.response.data.errors) {
      // Obsługa błędów walidacji (jeśli np. hasło jest za krótkie według backendu)
      errorMessage.value =
        "Błąd walidacji: " +
        error.response.data.errors.map((e) => e.msg).join(", ");
    } else {
      errorMessage.value =
        error.response?.data?.title || "Wystąpił błąd podczas logowania.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card {
  border-radius: 10px;
}
.card-header {
  border-radius: 10px 10px 0 0 !important;
}
</style>
