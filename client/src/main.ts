import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  // Only add token to our own API requests
  const isInternalRequest = config.url?.startsWith('/api') || (config.baseURL && config.url?.startsWith(config.baseURL));
  
  if (token && isInternalRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App)

app.use(router)

app.mount('#app')
