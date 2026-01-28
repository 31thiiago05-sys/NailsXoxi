import axios from 'axios';
import type { Service } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; // Usar variable de entorno

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getServices = async (): Promise<Service[]> => {
    const { data } = await api.get('/services');
    return data;
};

export const createService = async (serviceData: Partial<Service> & { categoryName?: string }) => {
    const { data } = await api.post('/services', serviceData);
    return data;
};

export const updateService = async (id: string, serviceData: Partial<Service> & { categoryName?: string }) => {
    const { data } = await api.put(`/services/${id}`, serviceData);
    return data;
};

export const deleteService = async (id: string) => {
    const { data } = await api.delete(`/services/${id}`);
    return data;
};

export const getCategories = async () => {
    const { data } = await api.get('/services/categories');
    return data;
};

export const getAppointments = async () => {
    const { data } = await api.get('/appointments');
    return data;
};


export const getAvailability = async () => {
    const { data } = await api.get('/availability');
    return data;
};

export const createAppointmentPreference = async (appointmentData: { appointmentId: string; title: string; price: number }) => {
    const { data } = await api.post('/payments/create-preference', appointmentData);
    return data;
};

export const createAppointment = async (appointmentData: { userId: string; serviceId: string; date: Date }) => {
    const { data } = await api.post('/appointments', appointmentData);
    return data;
};

export default api;
