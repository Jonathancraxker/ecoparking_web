// src/api/cajones.js
import { axiosPrivate } from './axios';

// Obtener solo cajones disponibles
export const getCajonesDisponibles = async () => {
    try {
        const response = await axiosPrivate.get('/api/cajones/disponibles');
        return response.data;
    } catch (error) {
        console.error('Error al obtener cajones disponibles:', error);
        throw error;
    }
};

// Obtener TODOS los cajones (disponibles y ocupados)
export const getTodosCajones = async () => {
    try {
        const response = await axiosPrivate.get('/api/cajones');
        return response.data;
    } catch (error) {
        console.error('Error al obtener todos los cajones:', error);
        throw error;
    }
};