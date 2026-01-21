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
            <div class="flex justify-between items-end">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] uppercase tracking-widest font-bold text-charcoal/30">Email Address</label>
                <p class="text-charcoal/80 font-medium">{{ user.email }}</p>
              </div>
              <div class="flex flex-col gap-1 text-right">
                <label class="text-[10px] uppercase tracking-widest font-bold text-charcoal/30">Joined Club</label>
                <p class="text-charcoal/60 text-xs font-bold uppercase tracking-tight">
                  {{ new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) }}
                </p>
              </div>
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

      <!-- Security Section -->
      <div class="bg-white/40 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[2rem] shadow-sm">
        <h3 class="font-serif text-2xl text-charcoal mb-8">Security</h3>
        
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Current Password</label>
            <input v-model="passwordForm.current" type="password" placeholder="Confirm existing password" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">New Password</label>
            <input v-model="passwordForm.password" type="password" placeholder="Min. 8 characters" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Confirm New Password</label>
            <input v-model="passwordForm.confirm" type="password" placeholder="Repeat new password" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          
          <button 
            @click="updatePassword"
            :disabled="updatingPassword || !isPasswordValid"
            class="w-full py-4 rounded-full bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-accent transition-all disabled:opacity-20"
          >
            {{ updatingPassword ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </div>

      <!-- Data Privacy Section -->
      <div class="bg-white/40 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[2rem] shadow-sm">
        <h3 class="font-serif text-2xl text-charcoal mb-8">Data & Privacy</h3>
        <p class="text-charcoal/60 text-sm mb-8 leading-relaxed">
          We value your privacy and are committed to protecting your personal information. Learn more about how we handle your data.
        </p>
        
        <RouterLink 
          to="/privacy"
          class="flex items-center justify-between p-4 rounded-2xl bg-charcoal/5 hover:bg-charcoal/10 transition-all group"
        >
          <span class="text-[10px] uppercase tracking-widest font-black text-charcoal">Privacy Policy</span>
          <svg class="w-4 h-4 text-charcoal/20 group-hover:text-charcoal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </RouterLink>
      </div>

      <!-- Action Footer -->
      <div class="flex flex-col items-center gap-6 pb-12">
        <button 
          @click="logout"
          class="px-12 py-4 rounded-full bg-charcoal text-sand text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-accent transition-all shadow-lg"
        >
          Sign Out of Session
        </button>
        
        <button 
          @click="deleteAccount"
          :disabled="deleting"
          class="text-[9px] uppercase tracking-[0.3em] font-bold text-red-400/40 hover:text-red-500 transition-colors disabled:opacity-30"
        >
          {{ deleting ? 'Deactivating...' : 'Delete My Account' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';

const user = ref<any>(null);
const deleting = ref(false);
const updatingPassword = ref(false);
const passwordForm = ref({ current: '', password: '', confirm: '' });

const isPasswordValid = computed(() => {
  return passwordForm.value.current &&
         passwordForm.value.password.length >= 8 && 
         passwordForm.value.password === passwordForm.value.confirm;
});

const updatePassword = async () => {
  updatingPassword.value = true;
  try {
    await axios.post('/api/profile/password', { 
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.password 
    });
    alert('Password updated successfully');
    passwordForm.value = { current: '', password: '', confirm: '' };
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed to update password');
  } finally {
    updatingPassword.value = false;
  }
};

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      user.value = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from storage');
      logout();
    }
  } else {
    logout();
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
