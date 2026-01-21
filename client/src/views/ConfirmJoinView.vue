<template>
  <div class="max-w-md mx-auto mt-20 text-left animate-fade-in">
    <div v-if="status === 'loading'" class="text-left space-y-6">
      <div class="w-12 h-12 border-4 border-charcoal/10 border-t-accent rounded-full animate-spin ml-0"></div>
      <h1 class="font-serif text-2xl text-charcoal">Confirming your spot...</h1>
    </div>

    <div v-else-if="status === 'success'" class="space-y-8">
      <div class="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <h1 class="font-serif text-3xl text-charcoal mb-2">You're all set!</h1>
        <p class="text-charcoal/60 font-light">Your attendance has been confirmed. We look forward to seeing you at the event.</p>
      </div>
      <RouterLink to="/events" class="inline-block px-10 py-4 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500">
        Back to Events
      </RouterLink>
    </div>

    <div v-else class="space-y-8">
      <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      <div>
        <h1 class="font-serif text-3xl text-charcoal mb-2">Link Expired</h1>
        <p class="text-charcoal/60 font-light">{{ errorMessage || 'This confirmation link is invalid or has already been used.' }}</p>
      </div>
      <RouterLink to="/" class="inline-block px-10 py-4 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500">
        Return Home
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const status = ref<'loading' | 'success' | 'error'>('loading');
const errorMessage = ref('');

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    status.value = 'error';
    return;
  }

  try {
    await axios.post('/api/confirm-join', { token });
    status.value = 'success';
  } catch (e: any) {
    status.value = 'error';
    errorMessage.value = e.response?.data?.error;
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
