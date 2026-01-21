<template>
  <div class="max-w-md mx-auto mt-20 animate-fade-in px-4">
    <div v-if="status === 'loading'" class="text-left space-y-6">
      <div class="w-12 h-12 border-4 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
      <h1 class="font-serif text-2xl text-charcoal">Verifying invitation...</h1>
    </div>

    <div v-else-if="status === 'success'" class="text-left space-y-8">
      <div class="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <h1 class="font-serif text-3xl text-charcoal mb-2">Account Activated</h1>
        <p class="text-charcoal/60 font-light">Your curator account is now active. You can now sign in with your email and the password you just set.</p>
      </div>
      <RouterLink to="/login" class="inline-block px-10 py-4 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500">
        Proceed to Login
      </RouterLink>
    </div>

    <div v-else-if="status === 'expired'" class="text-left space-y-8">
      <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      <div>
        <h1 class="font-serif text-3xl text-charcoal mb-2">Invalid Invitation</h1>
        <p class="text-charcoal/60 font-light">This invitation link is invalid or has already been used.</p>
      </div>
      <RouterLink to="/" class="inline-block px-10 py-4 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500">
        Return Home
      </RouterLink>
    </div>

    <div v-else class="space-y-12">
      <div class="text-left">
        <h1 class="font-serif text-4xl text-charcoal mb-4">Join the Club</h1>
        <p class="text-charcoal/50 font-light">Please set a secure password for your curator account.</p>
      </div>

      <form @submit.prevent="submitPassword" class="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm space-y-8">
        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">New Password</label>
          <input 
            v-model="password" 
            type="password" 
            autocomplete="new-password"
            placeholder="Minimum 8 characters" 
            class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Confirm Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            autocomplete="new-password"
            placeholder="Repeat password" 
            class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <button 
          type="submit"
          :disabled="!isValid || submitting"
          class="w-full py-5 bg-charcoal text-sand text-[11px] uppercase tracking-[0.3em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500 disabled:opacity-20"
        >
          {{ submitting ? 'Processing...' : 'Activate Account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const status = ref<'form' | 'loading' | 'success' | 'expired'>('form');
const password = ref('');
const confirmPassword = ref('');
const submitting = ref(false);

const isValid = computed(() => {
  return password.value.length >= 8 && password.value === confirmPassword.value;
});

const submitPassword = async () => {
  if (!isValid.value) return;
  submitting.value = true;
  try {
    await axios.post('/api/accept-invitation', {
      token: route.query.token,
      password: password.value
    });
    status.value = 'success';
  } catch (e) {
    status.value = 'expired';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (!route.query.token) {
    status.value = 'expired';
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
