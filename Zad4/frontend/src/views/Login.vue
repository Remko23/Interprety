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
                Zarejestruj się
              </router-link>
            </div>
          </div>
        </div>
        <div class="text-center mt-3">
          <router-link to="/" class="text-decoration-none small text-secondary">
            Wróć do sklepu bez logowania
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();
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
    const response = await axios.post("/api/users/login", {
      login: loginData.username,
      password: loginData.password,
    });
    auth.login(response.data.accessToken, response.data.refreshToken, response.data.user);

    router.push("/");
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Błąd logowania";
  } finally {
    loading.value = false;
  }
};
</script>
