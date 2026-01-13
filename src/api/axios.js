import axios from 'axios';

const BASE_URL = 'https://ecoparking-api.onrender.com/ecoparking';

// Instancia para peticiones públicas (Login, Registro, Refresh, etc)
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Muy importante para que envíe/reciba cookies
});

// Instancia para peticiones PRIVADAS (requieren autenticación)
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});