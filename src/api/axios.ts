import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';

// Update this with your actual backend URL
const BASE_URL = 'https://node-backend-zjnf.onrender.com/api/v1';
// const BASE_URL = 'http://192.168.43.37:7000/api/v1';


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',

  },
});

let logoutFunction: (() => Promise<void>) | null = null;

export const setLogoutFunction = (logout: () => Promise<void>) => {
  logoutFunction = logout;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      EventRegister.emit('userLogout', true);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;