<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
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

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8 pointer-events-auto bg-white/40 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 shadow-sm">
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
            <span>Gatherings</span>
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
          </RouterLink>

          <RouterLink 
            to="/admin" 
            class="relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 group text-charcoal/30 hover:text-charcoal"
            active-class="!text-charcoal is-active"
          >
            <span>Curator</span>
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full scale-0 transition-transform duration-300 group-[.is-active]:scale-100"></div>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
      <div class="bg-charcoal/90 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 flex justify-between items-center shadow-2xl">
        <RouterLink 
          to="/" 
          class="flex-1 flex flex-col items-center py-2 rounded-full transition-all duration-300 group"
          active-class=""
          exact-active-class="bg-white/10 is-active"
        >
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-[.is-active]:text-accent">Journal</span>
        </RouterLink>
        
        <RouterLink 
          to="/library" 
          class="flex-1 flex flex-col items-center py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-[.is-active]:text-accent">Library</span>
        </RouterLink>

        <RouterLink 
          to="/gatherings" 
          class="flex-1 flex flex-col items-center py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-[.is-active]:text-accent">Events</span>
        </RouterLink>

        <RouterLink 
          to="/admin" 
          class="flex-1 flex flex-col items-center py-2 rounded-full transition-all duration-300 group"
          active-class="bg-white/10 is-active"
        >
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-[.is-active]:text-accent">Curator</span>
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
