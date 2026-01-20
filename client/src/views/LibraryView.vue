<template>
  <div class="max-w-6xl mx-auto animate-fade-in">
    <div class="text-center mb-16">
      <h1 class="font-serif text-4xl md:text-5xl text-charcoal mb-4">The Collection</h1>
      <p class="text-charcoal/50 text-lg font-light tracking-wide">Our history of shared worlds.</p>
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
      <div class="relative w-full md:w-96 group">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search title or author..." 
          class="w-full bg-white/40 backdrop-blur-sm border-b border-charcoal/10 py-3 pl-4 pr-10 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-accent transition-colors font-sans"
        />
        <svg class="w-4 h-4 absolute right-3 top-3.5 text-charcoal/20 group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div class="flex gap-2">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full border transition-all duration-300"
          :class="activeFilter === filter.value ? 'bg-charcoal text-white border-charcoal' : 'bg-transparent text-charcoal/40 border-charcoal/10 hover:border-charcoal/30'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Book Grid -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-10 h-10 border-2 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="filteredBooks.length === 0" class="text-center py-20 text-charcoal/30 font-serif italic">
      No books found matching your criteria.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id" 
        class="group relative bg-white/40 backdrop-blur-sm border border-white hover:border-accent/20 rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-row sm:flex-col gap-4 sm:gap-0"
      >
        <!-- Status Badge -->
        <div class="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex gap-1 sm:gap-2">
          <span 
            v-if="book.suggesterId && book.suggesterId === currentUserId"
            class="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border bg-accent text-white border-accent"
          >
            YOU
          </span>
          <span 
            class="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border bg-white/80 backdrop-blur-md"
            :class="{
              'text-accent border-accent/20': book.status === 'current',
              'text-charcoal/40 border-charcoal/5': book.status === 'candidate',
              'text-green-700 border-green-100': book.status === 'read'
            }"
          >
            {{ book.status }}
          </span>
        </div>

        <div class="flex justify-center sm:mb-6 relative shrink-0">
          <div class="relative w-20 h-28 sm:w-32 sm:h-48 shadow-md rounded overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <img :src="book.coverUrl" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent opacity-50"></div>
          </div>
          <!-- Reflection -->
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/20 blur-md rounded-[100%] opacity-0 group-hover:opacity-40 transition-opacity duration-500 hidden sm:block"></div>
        </div>

        <div class="text-left sm:text-center flex-1 flex flex-col justify-between py-1 sm:py-0">
          <div class="mb-2 sm:mb-4">
            <h3 class="font-serif font-bold text-lg sm:text-xl text-charcoal leading-tight mb-1 sm:mb-2 line-clamp-2">{{ book.title }}</h3>
            <p class="text-[10px] sm:text-xs text-charcoal/50 uppercase tracking-wider font-medium">{{ formatAuthors(book.authors) }}</p>
          </div>
          
          <div class="pt-2 sm:pt-4 border-t border-charcoal/5 flex justify-start sm:justify-center gap-2 sm:gap-4 text-[8px] sm:text-[10px] text-charcoal/40 uppercase tracking-widest font-bold">
            <span>{{ book.publishedDate?.split('-')[0] || 'Unknown' }}</span>
            <span>•</span>
            <span>{{ book.language }}</span>
            <span class="hidden xs:inline">•</span>
            <span class="hidden xs:inline">{{ book.pageCount }}pp</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import type { Book } from '../types';

const books = ref<Book[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const activeFilter = ref('all');
const currentUserId = ref('');

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Current', value: 'current' },
  { label: 'Read', value: 'read' },
  { label: 'Library', value: 'candidate' }
];

const fetchBooks = async () => {
  try {
    const res = await axios.get<Book[]>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books`);
    books.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const filteredBooks = computed(() => {
  let result = books.value;

  if (activeFilter.value !== 'all') {
    result = result.filter(b => b.status === activeFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(b => 
      b.title.toLowerCase().includes(query) || 
      (typeof b.authors === 'string' && b.authors.toLowerCase().includes(query))
    );
  }

  return result;
});

const formatAuthors = (authorsStr: string | string[]) => {
  try {
    if (!authorsStr) return "Unknown";
    if (Array.isArray(authorsStr)) return authorsStr.join(", ");
    if (authorsStr.startsWith("[")) {
      return JSON.parse(authorsStr).join(", ");
    }
    return authorsStr;
  } catch (e) {
    return String(authorsStr);
  }
};

onMounted(() => {
  currentUserId.value = localStorage.getItem('userId') || '';
  fetchBooks();
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
