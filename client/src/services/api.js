import axios from 'axios';

const api = axios.create({
  baseURL: window.location.origin,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'demo_user' // In a real app, use proper auth
  }
});

export default api;