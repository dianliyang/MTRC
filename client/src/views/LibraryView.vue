<template>
  <div class="max-w-6xl mx-auto animate-fade-in">
    <div class="text-center mb-16">
      <h1 class="font-serif text-4xl md:text-5xl text-charcoal mb-4">The Collection</h1>
      <p class="text-charcoal/50 text-lg font-light tracking-wide">Our history of shared worlds.</p>
    </div>

    <!-- Search & Discovery Section -->
    <div class="mb-20">
      <div class="max-w-2xl mx-auto group">
        <div class="relative flex flex-col md:block">
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchBooks"
            type="text" 
            placeholder="Search the world for your next read..." 
            class="w-full bg-white/40 backdrop-blur-md border-b border-charcoal/10 py-4 md:py-5 pl-4 md:pl-6 pr-4 md:pr-32 text-lg md:text-xl text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-all font-serif"
          />
          <button 
            @click="searchBooks"
            :disabled="searching || !searchQuery"
            class="mt-4 md:mt-0 md:absolute md:right-2 md:top-2 md:bottom-2 px-8 py-3 md:py-0 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-accent transition-all disabled:opacity-20 w-full md:w-auto"
          >
            {{ searching ? 'Searching...' : 'Search' }}
          </button>
        </div>
      </div>

      <!-- Internet Search Results -->
      <transition name="fade">
        <div v-if="searchResults.length > 0" class="mt-12">
          <div class="flex items-center gap-4 mb-8">
             <h2 class="font-serif text-2xl text-charcoal">Discovery Results</h2>
             <button @click="searchResults = []" class="text-[10px] uppercase tracking-widest font-bold text-charcoal/30 hover:text-accent">Clear</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="book in searchResults" 
              :key="book.id"
              class="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white flex gap-5 group hover:shadow-xl transition-all duration-500"
            >
              <div class="w-20 h-28 bg-gray-100 shrink-0 overflow-hidden rounded shadow-sm">
                <img v-if="book.volumeInfo.imageLinks?.thumbnail" :src="proxyImage(book.volumeInfo.imageLinks.thumbnail)" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 class="font-serif font-bold text-base text-charcoal truncate">{{ book.volumeInfo.title }}</h3>
                  <p class="text-xs text-charcoal/60 truncate mb-1">{{ book.volumeInfo.authors?.join(', ') }}</p>
                  <div class="flex gap-2 text-[9px] uppercase tracking-widest text-charcoal/40">
                    <span>{{ book.volumeInfo.language }}</span>
                    <span>•</span>
                    <span>{{ book.volumeInfo.pageCount || '?' }} pages</span>
                  </div>
                </div>
                <button 
                  @click="addCandidate(book)"
                  class="w-fit text-[10px] font-bold uppercase tracking-widest text-accent hover:text-charcoal transition-colors"
                >
                  + Add to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-12 pt-12 border-t border-charcoal/5">
      <h2 class="font-serif text-3xl text-charcoal">The Collection</h2>
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
      <router-link 
        v-for="book in filteredBooks" 
        :key="book.id" 
        :to="`/library/${book.id}`"
        class="group relative bg-white/40 backdrop-blur-sm border border-white hover:border-accent/20 rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-row sm:flex-col gap-4 sm:gap-0"
      >
        <!-- Status Badge -->
        <div class="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex gap-1 sm:gap-2">
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
            <img :src="proxyImage(book.coverUrl)" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent opacity-50"></div>
          </div>
          <!-- Reflection -->
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/20 blur-md rounded-[100%] opacity-0 group-hover:opacity-40 transition-opacity duration-500 hidden sm:block"></div>
        </div>

        <div class="text-left sm:text-center flex-1 flex flex-col justify-between py-1 sm:py-0">
          <div class="mb-2 sm:mb-4">
            <div v-if="book.suggesterId && String(book.suggesterId) === currentUserId" class="mb-1">
              <span class="text-[7px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent">Added by you</span>
            </div>
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
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { formatAuthors, proxyImage } from '../utils';
import type { Book } from '../types';

const books = ref<Book[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const searching = ref(false);
const activeFilter = ref('all');
const currentUserId = ref('');

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Current', value: 'current' },
  { label: 'Read', value: 'read' },
  { label: 'Library', value: 'candidate' }
];

const fetchBooks = async () => {
  loading.value = true;
  try {
    const res = await axios.get<Book[]>('/api/books');
    books.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const searchBooks = async () => {
  if (!searchQuery.value) return;
  searching.value = true;
  searchResults.value = [];
  try {
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery.value)}`,
    );
    searchResults.value = res.data.items || [];
  } catch (e) {
    alert("Search failed");
  } finally {
    searching.value = false;
  }
};

const addCandidate = async (googleBook: any) => {
  try {
    const info = googleBook.volumeInfo;
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }

    // Try to get a higher resolution image
    let highResCover = info.imageLinks?.thumbnail || "";
    if (highResCover) {
      highResCover = highResCover.replace('zoom=1', 'zoom=2').replace('http://', 'https://');
    }

    await axios.post('/api/books', {
      googleId: googleBook.id,
      title: info.title,
      authors: info.authors || [],
      description: info.description || "",
      coverUrl: highResCover,
      language: info.language || "",
      pageCount: info.pageCount || 0,
      publishedDate: info.publishedDate || "",
      suggesterId: userId,
    });
    // Refresh list
    searchResults.value = searchResults.value.filter(
      (b) => b.id !== googleBook.id,
    );
    await fetchBooks();
  } catch (e) {
    alert("Failed to add book");
  }
};

const filteredBooks = computed(() => {
  let result = books.value;

  if (activeFilter.value !== 'all') {
    result = result.filter(b => b.status === activeFilter.value);
  }

  return result;
});

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = String(user.id);
  }
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
