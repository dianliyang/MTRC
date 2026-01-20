<template>
  <div class="max-w-2xl mx-auto animate-fade-in">
    <div class="text-center mb-12">
      <h1 class="font-serif text-4xl text-charcoal mb-2">Your Profile</h1>
      <p class="text-charcoal/50 font-light uppercase tracking-[0.2em] text-[10px]">Member Identity</p>
    </div>

    <div v-if="user" class="space-y-8">
      <!-- Profile Card -->
      <div class="bg-white/40 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[2rem] shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-3xl font-serif text-accent mb-6">
            {{ user.name?.[0].toUpperCase() }}
          </div>
          
          <h2 class="font-serif text-2xl text-charcoal mb-1">{{ user.name }}</h2>
          <span class="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-charcoal text-sand mb-8">
            {{ user.role }}
          </span>

          <div class="w-full space-y-6 text-left border-t border-charcoal/5 pt-8">
            <div class="flex flex-col gap-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-charcoal/30">Email Address</label>
              <p class="text-charcoal/80 font-medium">{{ user.email }}</p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-charcoal/30">Account Status</label>
              <div class="flex items-center gap-2 text-accent">
                <div class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                <p class="text-xs font-bold uppercase tracking-tighter">Active Curator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          @click="logout"
          class="px-8 py-3 rounded-full border border-charcoal/10 text-charcoal/40 text-[10px] uppercase tracking-widest font-bold hover:bg-charcoal/5 transition-all"
        >
          Sign Out of Session
        </button>
        <button 
          @click="deleteAccount"
          :disabled="deleting"
          class="px-8 py-3 rounded-full border border-red-100 text-red-400 text-[10px] uppercase tracking-widest font-bold hover:bg-red-50 transition-all disabled:opacity-30"
        >
          {{ deleting ? 'Deactivating...' : 'Delete My Account' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref<any>(null);
const deleting = ref(false);

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    user.value = JSON.parse(userStr);
  }
});

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This action is permanent and you will lose access immediately.')) {
    return;
  }

  deleting.value = true;
  try {
    await axios.delete('/api/profile');
    alert('Your account has been successfully deactivated.');
    logout();
  } catch (e) {
    alert('Failed to delete account. Please try again.');
  } finally {
    deleting.value = false;
  }
};
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
