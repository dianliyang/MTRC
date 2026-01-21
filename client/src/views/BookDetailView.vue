<template>
  <div class="max-w-4xl mx-auto animate-fade-in">
    <div v-if="loading" class="h-[60vh] flex items-center justify-center">
      <div class="w-10 h-10 border-2 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="book" class="space-y-16">
      <!-- Header Section -->
      <section class="flex flex-col md:flex-row gap-12 py-12 md:py-20">
        <!-- Cover Art -->
        <div class="relative group perspective-1000 w-64 md:w-80 mx-auto md:mx-0 shrink-0">
          <div class="relative z-10 rounded-sm shadow-2xl transition-transform duration-500 ease-out group-hover:rotate-y-6 transform-style-3d">
            <img 
              v-if="book.coverUrl" 
              class="w-full h-auto object-cover rounded-sm aspect-[2/3]" 
              :src="book.coverUrl" 
              :alt="book.title"
              referrerpolicy="no-referrer"
            >
            <div v-else class="w-full h-96 bg-charcoal/10 flex items-center justify-center text-charcoal/30 font-serif">No Cover</div>
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
          <div class="absolute -bottom-4 left-0 right-0 h-16 bg-gradient-to-b from-black/5 to-transparent blur-sm transform scale-y-[-0.3] opacity-50 z-0"></div>
        </div>

        <!-- Details -->
        <div class="flex-1 text-center md:text-left">
          <div class="inline-block mb-6 px-3 py-1 border border-accent/30 text-accent text-[10px] tracking-[0.2em] uppercase font-bold rounded-full">
            {{ book.status }}
          </div>
          
          <h1 class="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
            {{ book.title }}
          </h1>
          
          <p class="text-charcoal/60 text-lg mb-6 font-light italic">
            by {{ formatAuthors(book.authors) }}
          </p>
          
          <div class="flex flex-wrap gap-4 mb-8 text-[11px] uppercase tracking-widest text-charcoal/40 font-medium justify-center md:justify-start">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
              {{ book.language }}
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              {{ book.pageCount }} pages
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ book.publishedDate?.split('-')[0] }}
            </div>
          </div>
          
          <div class="prose prose-lg text-charcoal-light font-light leading-relaxed mb-12 max-w-none text-left">
            {{ book.description?.replace(/<[^>]*>/g, '') }}
          </div>

          <!-- Like Button -->
          <div class="flex justify-center md:justify-start">
            <button 
              @click="toggleLike"
              class="group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 border"
              :class="userLiked ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/40 border-charcoal/5 text-charcoal/40 hover:border-accent/20 hover:text-accent'"
            >
              <svg 
                class="w-5 h-5 transition-transform group-hover:scale-125" 
                :class="{ 'fill-current': userLiked }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="text-xs font-bold uppercase tracking-widest">{{ book.likesCount || 0 }}</span>
            </button>
          </div>
        </div>
      </section>

      <CommentSection :bookId="book.id" />
    </div>

    <div v-else class="text-center py-20">
      <h2 class="font-serif text-2xl text-charcoal">Book not found</h2>
      <RouterLink to="/library" class="text-accent underline mt-4 inline-block">Return to Collection</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';
import CommentSection from '../components/CommentSection.vue';
import { formatAuthors } from '../utils';
import type { Book } from '../types';

const route = useRoute();
const book = ref<Book | null>(null);
const loading = ref(true);
const userLiked = ref(false);

const fetchLikeStatus = async () => {
  try {
    const res = await axios.get(`/api/books/${route.params.id}/like-status`);
    userLiked.value = res.data.liked;
  } catch (e) {
    console.error(e);
  }
};

const toggleLike = async () => {
  try {
    const res = await axios.post(`/api/books/${route.params.id}/toggle-like`);
    userLiked.value = res.data.liked;
    // Refresh book to get updated count
    const bookRes = await axios.get<Book>(`/api/books/${route.params.id}`);
    book.value = bookRes.data;
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  try {
    const res = await axios.get<Book>(`/api/books/${route.params.id}`);
    book.value = res.data;
    await fetchLikeStatus();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.rotate-y-6 { transform: rotateY(-10deg) rotateX(2deg); }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
