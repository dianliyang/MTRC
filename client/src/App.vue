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
        <div class="bg-white/40 backdrop-blur-xl border border-white/20 rounded-full px-4 md:px-8 py-3 md:py-4 pointer-events-auto transition-all duration-500 hover:bg-white/60 shadow-sm">
          <RouterLink to="/" class="flex items-center gap-3 md:gap-4 group">
            <img src="/logo.svg" alt="Logo" class="w-6 h-6 md:w-8 md:h-8 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            <span class="font-brand font-normal text-lg md:text-xl tracking-[0.1em] text-charcoal uppercase hidden sm:inline-block">MoreThanReadingClub</span>
            <span class="font-brand font-normal text-lg tracking-[0.1em] text-charcoal uppercase sm:hidden">MTRC</span>
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
              to="/gatherings" 
              class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
              active-class="!text-charcoal is-active"
            >
              <span>Events</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
            </RouterLink>

            <RouterLink 
              v-if="currentUser?.role === 'admin'"
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
    <nav class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div class="bg-charcoal/90 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl">
        <RouterLink 
          to="/" 
          class="p-3 rounded-full transition-all duration-300 group"
          active-class=""
          exact-active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"></path>
          </svg>
        </RouterLink>
        
        <RouterLink 
          to="/library" 
          class="p-3 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </RouterLink>

        <RouterLink 
          to="/gatherings" 
          class="p-3 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </RouterLink>

        <RouterLink 
          v-if="currentUser?.role === 'admin'"
          to="/admin" 
          class="p-3 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
          </svg>
        </RouterLink>

        <RouterLink 
          to="/profile" 
          class="p-3 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <svg class="w-5 h-5 text-white/40 group-[.is-active]:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </RouterLink>
      </div>
    </nav>

    <!-- Main Content Area with responsive padding -->
    <main class="pt-24 md:pt-32 pb-32 md:pb-12 px-4 md:px-6">
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
