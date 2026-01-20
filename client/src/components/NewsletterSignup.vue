<template>
  <div class="mt-16 border-t border-charcoal/10 pt-12">
    <div class="max-w-xl mx-auto text-center">
      <h3 class="font-serif text-2xl mb-3 text-charcoal">Keep in Touch</h3>
      <p class="text-charcoal-light mb-8 font-light">Join the circle. Receive a notification when a new chapter begins.</p>
      
      <div class="flex flex-col gap-6 items-center">
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email Address" 
            class="bg-transparent border-b border-charcoal/20 py-2 px-1 focus:outline-none focus:border-accent transition-colors placeholder:text-charcoal/30 text-center md:text-left"
          />
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="Signal Number (+1...)" 
            class="bg-transparent border-b border-charcoal/20 py-2 px-1 focus:outline-none focus:border-accent transition-colors placeholder:text-charcoal/30 text-center md:text-left"
            @keyup.enter="subscribe"
          />
        </div>
        
        <button 
          @click="subscribe" 
          class="group relative px-8 py-3 overflow-hidden rounded-full bg-charcoal text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || (!email && !phone)"
        >
          <span class="relative z-10 text-sm tracking-widest uppercase font-medium group-hover:text-sand transition-colors">
            {{ loading ? 'Processing...' : 'Subscribe' }}
          </span>
          <div class="absolute inset-0 h-full w-full bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
        </button>
      </div>

      <p v-if="message" class="mt-4 text-sm font-medium" :class="error ? 'text-red-500' : 'text-accent'">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const phone = ref('');
const loading = ref(false);
const message = ref('');
const error = ref(false);

const subscribe = async () => {
  if (!email.value && !phone.value) return;
  
  loading.value = true;
  message.value = '';
  error.value = false;
  
  try {
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/subscribe`, { 
      email: email.value,
      phoneNumber: phone.value 
    });
    message.value = 'You are now part of the circle.';
    email.value = '';
    phone.value = '';
  } catch (e: any) {
    error.value = true;
    message.value = e.response?.data?.error || 'Unable to subscribe at this moment.';
  } finally {
    loading.value = false;
  }
};
</script>