import axios from 'axios'
import { Promise } from 'core-js'
import store from "./store"
import Cookies from "js-cookie"

const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

const instance = axios.create({
    baseURL: node_env == 'dev' ? 
        'http://localhost:4444/v1' : 
        'https://alinifacture.com/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
})

instance.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            // Erro de rede (ex: API offline, sem internet, CORS bloqueado, etc.)
            window.location.href = '/500';
        }
        return Promise.reject(error);
    }
);

// Interceptor de resposta 
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Caso o token seja inválido (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Remove o refreshKey e redireciona para o login
            Cookies.remove("session_id")
            console.warn('Token expirado. Redirecionando para o login...');
            window.location.href = '/';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 404) {
            window.location.href = '/404';
        }
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 500) {
            window.location.href = '/500';
        }
        return Promise.reject(error);
    }
)

instance.interceptors.request.use((config) => {
    const hasLogged = store.getters.hasLogged
    if (hasLogged) {
        const token = store.getters.accessToken
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

export default instance