import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const auth = useAuthStore();
            auth.logout();
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

app.mount('#app')