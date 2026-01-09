<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header text-white">
            <h4 class="mb-0">Inicjalizacja Bazy Danych</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
                 <p class="mb-0">
                    <strong>Uwaga:</strong> Aby załadować dane produktów upewnij się, że baza produktów jest pusta!
                 </p>
                 <button @click="exportDatabase" class="btn btn-outline-primary btn-sm">
                    Pobierz Produkty <i class="fa-solid fa-floppy-disk"></i>
                 </button>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Plik JSON z produktami</label>
              <input type="file" class="form-control" accept=".json" @change="handleFileUpload"/>
            </div>

            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            <div v-if="success" class="alert alert-success">
              {{ success }}
            </div>

            <button @click="initDatabase" class="btn w-100" :disabled="!fileContent"> Zainicjalizuj Bazę <i class="fa-solid fa-file-arrow-up"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const fileContent = ref(null);
const error = ref("");
const success = ref("");

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  error.value = "";
  success.value = "";
  fileContent.value = null;

  if (!file) return;

  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    error.value = "Proszę wybrać plik JSON.";
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let json = JSON.parse(e.target.result);
      if (!Array.isArray(json) && json.products && Array.isArray(json.products)) {
        json = json.products;
      }

      if (!Array.isArray(json)) {
        throw new Error("Plik musi zawierać tablicę produktów (lub obiekt z polem 'products').");
      }
      if (json.length > 0) {
        const sample = json[0];
        if (!sample.name || !sample.price) {
           throw new Error("Elementy tablicy muszą zawierać pola 'name' i 'price'."); 
        }
      }
      
      fileContent.value = json;
    } catch (err) {
      error.value = "Błąd parsowania pliku: " + err.message;
      event.target.value = "";
    }
  };
  reader.readAsText(file);
};

const initDatabase = async () => {
  if (!fileContent.value) return;
  error.value = "";
  success.value = "";

  try {
    const response = await axios.post("/api/init", fileContent.value);
    success.value = response.data.message || "Baza danych została zainicjalizowana.";
    fileContent.value = null;
  } catch (err) {
    if (err.response) {
      if (err.response.status === 409) {
        error.value = "Błąd: Baza danych nie jest pusta.";
      } else {
        error.value =
          err.response.data.detail ||
          err.response.data.message ||
          "Wystąpił błąd podczas inicjalizacji.";
      }
    } else {
      error.value = "Błąd połączenia z serwerem.";
    }
  }
};

const exportDatabase = async () => {
    error.value = "";
    success.value = "";
    
    try {
        const response = await axios.get('/api/products');
        const data = { products: response.data };
        
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products_export.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success.value = "Pobrano bazę danych.";
    } catch (err) {
        error.value = "Błąd podczas eksportu danych: " + (err.response?.data?.message || err.message);
    }
};
</script>
