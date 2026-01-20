<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) return;
  loading.value = true;
  error.value = '';

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/login`, {
      email: email.value,
      password: password.value
    });

    if (res.data.token) {
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      // Redirect to Admin view after login
      router.push('/admin');
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-20 p-8 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg">
    <h1 class="font-serif text-3xl text-charcoal mb-8 text-center">Curator Access</h1>
    
    <div class="space-y-6">
      <div>
        <label class="block text-xs uppercase tracking-widest text-charcoal/40 font-bold mb-2">Email</label>
        <input 
          v-model="email" 
          type="email" 
          class="w-full bg-white/50 border border-charcoal/10 rounded-lg py-3 px-4 focus:outline-none focus:border-accent transition-colors"
          @keyup.enter="login"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-widest text-charcoal/40 font-bold mb-2">Password</label>
        <input 
          v-model="password" 
          type="password" 
          class="w-full bg-white/50 border border-charcoal/10 rounded-lg py-3 px-4 focus:outline-none focus:border-accent transition-colors"
          @keyup.enter="login"
        />
      </div>

      <button 
        @click="login" 
        class="w-full py-4 bg-charcoal text-white font-bold uppercase tracking-widest rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Verifying...' : 'Enter' }}
      </button>

      <p v-if="error" class="text-center text-red-500 text-sm font-medium">{{ error }}</p>
    </div>
  </div>
</template>
