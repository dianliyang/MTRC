<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-left mb-8 animate-fade-in-up">
      <h1 class="font-serif text-4xl text-charcoal mb-4">Events</h1>
      <p class="text-charcoal/50 text-lg font-light tracking-wide">A timeline of our conversations.</p>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <div class="w-10 h-10 border-2 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="meetings.length === 0" class="text-center py-10 text-charcoal/30 font-serif italic">
      No events scheduled.
    </div>

    <div v-else class="relative border-l border-charcoal/10 ml-4 md:ml-10 space-y-12 pb-12">
      <div 
        v-for="(meeting, index) in meetings" 
        :key="meeting.id" 
        class="relative pl-8 md:pl-12 group animate-fade-in"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- Timeline Dot -->
        <div 
          class="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-sand bg-charcoal transition-all duration-500"
          :class="isFuture(meeting.date) ? 'bg-accent scale-125' : 'bg-charcoal/20'"
        ></div>

        <!-- Content Card -->
        <div 
          class="relative overflow-hidden p-6 rounded-lg transition-all duration-300 hover:bg-white/50 border border-transparent hover:border-white hover:shadow-sm"
          :class="isFuture(meeting.date) ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0'"
        >
          <!-- Optional Book Cover Background (Blur) - Use first book -->
          <div v-if="meeting.Books && meeting.Books.length > 0" class="absolute top-0 right-0 w-32 h-32 opacity-10 translate-x-8 -translate-y-8 blur-sm pointer-events-none">
            <img :src="meeting.Books[0].coverUrl" class="w-full h-full object-cover rounded-full" />
          </div>

          <div class="relative z-10 flex gap-6">
            <!-- Book Covers Stack -->
            <div v-if="meeting.Books && meeting.Books.length > 0" class="hidden md:flex flex-col -space-y-16 shrink-0 pt-2">
              <div 
                v-for="(book, i) in meeting.Books" 
                :key="book.id"
                class="w-16 h-24 shadow-md transition-transform hover:translate-x-2"
                :style="{ zIndex: 10 - i, transform: `rotate(${i % 2 === 0 ? 3 : -2}deg)` }"
              >
                <img :src="book.coverUrl" class="w-full h-full object-cover border border-white" :alt="book.title" />
              </div>
            </div>

            <div class="flex-1">
              <div class="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                <span 
                  class="font-sans text-xs font-bold uppercase tracking-widest mb-2 md:mb-0"
                  :class="isFuture(meeting.date) ? 'text-accent' : 'text-charcoal/40'"
                >
                  {{ formatDate(meeting.date) }}
                </span>
                <span class="text-xs text-charcoal/40 font-mono">{{ formatTime(meeting.date) }}</span>
              </div>

              <h3 class="font-serif text-2xl text-charcoal mb-1 group-hover:text-accent transition-colors">
                {{ meeting.topic }}
              </h3>
              
              <div v-if="meeting.Books && meeting.Books.length > 0" class="text-xs uppercase tracking-wider text-charcoal/50 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                <div v-for="book in meeting.Books" :key="book.id" class="flex items-center gap-1">
                  <span class="font-bold text-charcoal">{{ book.title }}</span>
                  <span class="text-[10px] opacity-60">({{ book.language }} • {{ book.pageCount }}pp)</span>
                </div>
              </div>
              
              <p class="text-charcoal-light font-light leading-relaxed mb-4">
                {{ meeting.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-medium text-charcoal/60 bg-charcoal/5 px-3 py-1.5 rounded-full w-fit">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {{ meeting.location }}
                </div>
                
                <RouterLink :to="`/events/${meeting.id}`" class="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-charcoal transition-colors">
                  View Details →
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { isFuture, formatDate, formatTime } from '../utils';
import type { Meeting } from '../types';

const meetings = ref<Meeting[]>([]);
const loading = ref(true);

const fetchMeetings = async () => {
  try {
    const res = await axios.get<Meeting[]>('/api/meetings');
    meetings.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMeetings);
</script>
<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out backwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
