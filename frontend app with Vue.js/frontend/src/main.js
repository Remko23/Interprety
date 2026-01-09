import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/theme.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const auth = useAuthStore();

            if (auth.refreshToken) {
                try {
                    const response = await axios.post('/api/users/refresh-token', {
                        refreshToken: auth.refreshToken
                    });

                    const { accessToken, refreshToken } = response.data;
                    auth.login(accessToken, refreshToken, auth.user);

                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh token failed:", refreshError);
                    auth.logout();
                    router.push('/login');
                }
            } else {
                auth.logout();
                router.push('/login');
            }
        }
        return Promise.reject(error);
    }
);

app.mount('#app')