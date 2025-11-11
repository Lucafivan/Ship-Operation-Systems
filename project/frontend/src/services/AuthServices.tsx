import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const API_URL = API_BASE_URL + '/auth';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export const loginUser = (credentials: LoginCredentials) => {
  return apiClient.post('/login', credentials);
};

export const registerUser = (credentials: RegisterCredentials) => {
  return apiClient.post('/register', credentials);
};