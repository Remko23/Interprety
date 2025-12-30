import { defineStore } from 'pinia';
import axios from 'axios';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user')));

    const isAuthenticated = computed(() => !!token.value);

    function login(newToken, newUser) {
        token.value = newToken;
        user.value = newUser;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        document.cookie = `token=${newToken}; path=/; max-age=3600; samesite=strict`;

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }

    function logout() {
        token.value = null;
        user.value = null;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        delete axios.defaults.headers.common['Authorization'];
    }

    function initialize() {
        if (token.value) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        }
    }

    return { token, user, isAuthenticated, login, logout, initialize };
});
