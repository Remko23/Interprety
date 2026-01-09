<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Rejestracja</h3>
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label class="form-label">Nazwa użytkownika</label>
              <input
                v-model="registerData.login"
                type="text"
                class="form-control"
                required
                minlength="3"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Hasło</label>
              <input v-model="registerData.password" type="password" class="form-control" required minlength="4"/>
            </div>
            
             <div class="mb-3">
              <label class="form-label">Powtórz hasło</label>
              <input v-model="confirmPassword" type="password" class="form-control" required minlength="4"/>
            </div>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>

            <button type="submit" class="btn btn-primary w-100">Zarejestruj się <i class="fa-solid fa-user-plus"></i></button>
            <div class="mt-3 text-center">
              <router-link to="/login">Masz już konto? Zaloguj się <i class="fa-solid fa-sign-in-alt"></i></router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const registerData = reactive({
  login: "",
  password: "",
});
const confirmPassword = ref("");
const error = ref("");
const success = ref("");

const handleRegister = async () => {
  if (registerData.password !== confirmPassword.value) {
      error.value = "Hasła nie są identyczne.";
      return;
  }

  error.value = "";
  success.value = "";

  try {
    await axios.post("/api/users/register", {
        login: registerData.login,
        password: registerData.password
    });
    
    success.value = "Konto zostało utworzone. Za chwilę nastąpi przekierowanie do logowania...";
    
    setTimeout(() => {
        router.push("/login");
    }, 2000);

  } catch (err) {
    if (err.response && err.response.data) {
        error.value = err.response.data.detail || err.response.data.message || "Błąd rejestracji.";
    } else {
        error.value = "Błąd połączenia z serwerem.";
    }
  }
};
</script>
