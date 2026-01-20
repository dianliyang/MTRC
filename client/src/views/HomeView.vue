<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="h-[60vh] flex flex-col items-center justify-center">
      <div class="w-12 h-12 border-4 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="currentBook" class="animate-fade-in">
      <!-- Hero Section -->
      <section class="relative py-12 md:py-20 flex flex-col md:flex-row gap-12 items-center md:items-start">
        <!-- Cover Art with Reflection -->
        <div class="relative group perspective-1000 w-64 md:w-80 shrink-0">
          <div class="relative z-10 rounded-sm shadow-2xl transition-transform duration-500 ease-out group-hover:rotate-y-6 transform-style-3d">
            <img 
              v-if="currentBook.coverUrl" 
              class="w-full h-auto object-cover rounded-sm aspect-[2/3]" 
              :src="currentBook.coverUrl" 
              :alt="currentBook.title"
            >
            <div v-else class="w-full h-96 bg-charcoal/10 flex items-center justify-center text-charcoal/30 font-serif">No Cover</div>
            
            <!-- Book Spine Effect (Left Side) -->
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
          
          <!-- Reflection -->
          <div class="absolute -bottom-4 left-0 right-0 h-16 bg-gradient-to-b from-black/5 to-transparent blur-sm transform scale-y-[-0.3] opacity-50 z-0"></div>
        </div>

        <!-- Book Details -->
        <div class="flex-1 text-center md:text-left">
          <div class="inline-block mb-6 px-3 py-1 border border-accent/30 text-accent text-[10px] tracking-[0.2em] uppercase font-bold rounded-full">
            Current Selection
          </div>
          
          <h1 class="font-serif text-5xl md:text-6xl text-charcoal leading-tight mb-4">
            {{ currentBook.title }}
          </h1>
          
          <p class="text-charcoal/60 text-lg mb-4 font-light italic">
            by {{ formatAuthors(currentBook.authors) }}
          </p>
          
          <div class="flex flex-wrap gap-4 mb-8 text-[11px] uppercase tracking-widest text-charcoal/40 font-medium">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
              {{ currentBook.language }}
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              {{ currentBook.pageCount }} pages
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ currentBook.publishedDate?.split('-')[0] }}
            </div>
          </div>
          
          <div class="prose prose-lg text-charcoal-light font-light leading-relaxed mb-8 max-w-none">
            {{ currentBook.description?.replace(/<[^>]*>/g, '').slice(0, 400) }}...
          </div>

          <div class="flex gap-4 justify-center md:justify-start">
            <button class="px-6 py-3 bg-charcoal text-white text-sm tracking-widest uppercase font-medium shadow-lg hover:bg-accent transition-colors duration-300">
              Buy Copy
            </button>
            <button class="px-6 py-3 border border-charcoal/20 text-charcoal text-sm tracking-widest uppercase font-medium hover:border-accent hover:text-accent transition-colors duration-300">
              Goodreads
            </button>
          </div>
        </div>
      </section>

      <CommentSection :bookId="currentBook.id" />
      <NewsletterSignup />
    </div>

    <!-- Empty State -->
    <div v-else class="h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 class="font-serif text-3xl text-charcoal mb-4">Silence in the Library</h2>
      <p class="text-charcoal-light font-light max-w-md">No book has been selected for this month yet. The curators are deliberating.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import type { Book } from '../types';

const currentBook = ref<Book | undefined>(undefined);
const loading = ref(true);

const formatAuthors = (authorsStr: string | string[]) => {
  try {
    if (!authorsStr) return "Unknown Author";
    if (Array.isArray(authorsStr)) return authorsStr.join(", ");
    if (typeof authorsStr === 'string' && authorsStr.startsWith("[")) {
      return JSON.parse(authorsStr).join(", ");
    }
    return authorsStr;
  } catch (e) {
    return String(authorsStr);
  }
};

onMounted(async () => {
  try {
    const res = await axios.get<Book[]>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books`);
    // Find the book with status 'current'
    currentBook.value = res.data.find(b => b.status === 'current');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.rotate-y-6 {
  transform: rotateY(-10deg) rotateX(2deg);
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>