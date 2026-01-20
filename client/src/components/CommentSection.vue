<template>
  <div class="mt-20 max-w-2xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <h3 class="font-serif text-2xl text-charcoal">Thoughts</h3>
      <span class="text-xs bg-charcoal/5 px-2 py-1 rounded-full text-charcoal/60 font-medium">{{ comments.length }}</span>
    </div>
    
    <!-- Minimal Input -->
    <div class="mb-12 relative group">
      <div class="flex flex-col gap-4">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Your name" 
          class="bg-transparent text-sm border-b border-charcoal/10 py-2 w-1/3 focus:outline-none focus:border-accent transition-colors placeholder:text-charcoal/30" 
        />
        <textarea 
          v-model="newComment" 
          class="w-full bg-transparent border-b border-charcoal/10 py-4 focus:outline-none focus:border-accent transition-colors min-h-[100px] placeholder:text-charcoal/30 resize-none" 
          placeholder="Share your perspective..."
        ></textarea>
      </div>
      <div class="mt-4 flex justify-end">
        <button 
          @click="postComment" 
          class="text-xs font-bold uppercase tracking-widest text-charcoal hover:text-accent transition-colors disabled:opacity-30"
          :disabled="!newComment || submitting"
        >
          {{ submitting ? 'Posting...' : 'Publish' }}
        </button>
      </div>
    </div>

    <!-- Feed -->
    <div class="space-y-10">
      <div v-if="comments.length === 0" class="text-center py-10 text-charcoal/40 font-light italic">
        The page is blank. Be the first to write.
      </div>
      
      <div v-for="comment in comments" :key="comment.id" class="group">
        <div class="flex gap-4 items-start">
          <div class="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-xs font-bold text-charcoal/50 shrink-0">
            {{ (comment.username || 'A')[0].toUpperCase() }}
          </div>
          <div class="flex-1">
            <div class="flex items-baseline justify-between mb-1">
              <span class="font-medium text-sm text-charcoal">{{ comment.username }}</span>
              <span class="text-[10px] text-charcoal/40 uppercase tracking-wider">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="text-charcoal-light leading-relaxed font-light">{{ comment.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import type { Comment } from '../types';

const props = defineProps<{
  bookId: number;
}>();

const comments = ref<Comment[]>([]);
const newComment = ref('');
const username = ref('');
const submitting = ref(false);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const fetchComments = async () => {
  try {
    const res = await axios.get<Comment[]>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books/${props.bookId}/comments`);
    comments.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const postComment = async () => {
  if (!newComment.value.trim()) return;
  submitting.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books/${props.bookId}/comments`, {
      text: newComment.value,
      username: username.value
    });
    newComment.value = '';
    await fetchComments();
  } catch (e) {
    alert('Failed to post comment');
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchComments);
</script>