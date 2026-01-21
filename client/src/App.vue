<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute();
const currentUser = ref<any>(null);
const showUserMenu = ref(false);

const updateUserInfo = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    currentUser.value = null;
  }
};

onMounted(updateUserInfo);

// Watch for route changes to update user info (e.g. after login)
watch(() => route.path, updateUserInfo);

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  currentUser.value = null;
  showUserMenu.value = false;
  window.location.href = '/login';
};
</script>

<template>
  <div class="min-h-screen bg-sand text-charcoal font-sans selection:bg-accent selection:text-white">
    <!-- Top Brand Header (Simplified for Mobile) -->
    <nav class="fixed top-0 w-full z-50 px-4 md:px-6 py-4 md:py-6 pointer-events-none">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <!-- Logo/Brand Container -->
        <div class="hidden md:block bg-white/40 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 pointer-events-auto transition-all duration-500 hover:bg-white/60 shadow-sm">
          <RouterLink to="/" class="flex items-center gap-4 group">
            <img src="/logo.svg" alt="Logo" class="w-8 h-8 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            <span class="font-brand font-normal text-xl tracking-[0.1em] text-charcoal uppercase inline-block">MoreThanReadingClub</span>
          </RouterLink>
        </div>

        <!-- Desktop Navigation & Profile -->
        <div class="hidden md:flex items-center gap-4 pointer-events-auto">
          <div class="flex items-center gap-8 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 shadow-sm">
            <RouterLink 
              to="/" 
              class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
              active-class=""
              exact-active-class="!text-charcoal is-active"
            >
              <span>Journal</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
            </RouterLink>
            
            <RouterLink 
              to="/library" 
              class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
              active-class="!text-charcoal is-active"
            >
              <span>Library</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
            </RouterLink>

            <RouterLink 
              to="/events" 
              class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
              active-class="!text-charcoal is-active"
            >
              <span>Events</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
            </RouterLink>

            <RouterLink 
              v-if="currentUser?.role === 'admin' || currentUser?.role === 'curator'"
              to="/admin" 
              class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
              active-class="!text-charcoal is-active"
            >
              <span>Curator</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
            </RouterLink>
          </div>

          <!-- User Profile Icon -->
          <div 
            v-if="currentUser" 
            class="relative group"
            @mouseenter="showUserMenu = true"
            @mouseleave="showUserMenu = false"
          >
            <button 
              class="w-12 h-12 rounded-full bg-white/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-xs font-bold text-charcoal/60 group-hover:bg-white/60 transition-all shadow-sm"
            >
              {{ currentUser.name?.[0].toUpperCase() || 'U' }}
            </button>

            <!-- Dropdown Menu -->
            <transition name="fade">
              <div v-if="showUserMenu" class="absolute right-0 pt-4 w-48 z-[60]">
                <div class="bg-white/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-4">
                  <div class="mb-4 pb-4 border-b border-charcoal/5">
                    <p class="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-1">{{ currentUser.role }}</p>
                    <p class="text-sm font-serif font-bold text-charcoal truncate">{{ currentUser.name }}</p>
                  </div>
                  
                  <RouterLink 
                    to="/profile" 
                    @click="showUserMenu = false"
                    class="block w-full text-left text-[10px] uppercase tracking-widest font-bold text-charcoal/60 hover:text-accent mb-4 transition-colors"
                  >
                    View Profile
                  </RouterLink>

                  <button 
                    @click="logout"
                    class="w-full text-left text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="fixed bottom-6 left-6 right-6 z-50 md:hidden backdrop-blur-3xl rounded-full">
      <div class="bg-charcoal/70 border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <RouterLink 
          to="/" 
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 group"
          active-class=""
          exact-active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
          </svg>
          <span class="text-[9px] font-medium tracking-wide text-white/30 group-[.is-active]:text-white transition-colors">Journal</span>
        </RouterLink>
        
        <RouterLink 
          to="/library" 
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"></path>
          </svg>
          <span class="text-[9px] font-medium tracking-wide text-white/30 group-[.is-active]:text-white transition-colors">Library</span>
        </RouterLink>

        <RouterLink 
          to="/events" 
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"></path>
          </svg>
          <span class="text-[9px] font-medium tracking-wide text-white/30 group-[.is-active]:text-white transition-colors">Events</span>
        </RouterLink>

        <RouterLink 
          v-if="currentUser?.role === 'admin' || currentUser?.role === 'curator'"
          to="/admin" 
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"></path>
          </svg>
          <span class="text-[9px] font-medium tracking-wide text-white/30 group-[.is-active]:text-white transition-colors">Curator</span>
        </RouterLink>

        <RouterLink 
          to="/profile" 
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="text-[9px] font-medium tracking-wide text-white/30 group-[.is-active]:text-white transition-colors">Profile</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Main Content Area with responsive padding -->
    <main class="pt-12 md:pt-28 pb-32 md:pb-12 px-4 md:px-6">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
