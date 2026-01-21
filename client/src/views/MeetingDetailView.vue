<template>
  <div class="max-w-4xl mx-auto animate-fade-in">
    <div v-if="loading" class="h-[60vh] flex items-center justify-center">
      <div class="w-10 h-10 border-2 border-charcoal/10 border-t-accent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="meeting" class="space-y-16">
      <!-- Header -->
      <section class="text-left py-12 md:py-20 border-b border-charcoal/5">
        <div class="inline-block mb-6 px-3 py-1 border border-accent/30 text-accent text-[10px] tracking-[0.2em] uppercase font-bold rounded-full">
          Event Detail
        </div>
        <h1 class="font-serif text-5xl md:text-6xl text-charcoal leading-tight mb-6">
          {{ meeting.topic }}
        </h1>
        <div class="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-charcoal/60">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {{ formatDate(meeting.date) }} at {{ formatTime(meeting.date) }}
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {{ meeting.location }}
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Hosted by <span class="text-charcoal">{{ meeting.host }}</span>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
        <!-- Description & Books -->
        <div class="md:col-span-2 space-y-12">
          <div>
            <h2 class="font-serif text-2xl text-charcoal mb-4">The Agenda</h2>
            <p class="text-charcoal-light font-light leading-relaxed text-lg whitespace-pre-wrap">
              {{ meeting.description }}
            </p>
          </div>

          <div v-if="meeting.Books && meeting.Books.length > 0">
            <h2 class="font-serif text-2xl text-charcoal mb-6">Subject Matter</h2>
            <div class="grid grid-cols-1 gap-8">
              <div v-for="book in meeting.Books" :key="book.id" class="flex gap-6 group">
                <img :src="book.coverUrl" class="w-20 h-32 object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-500" />
                <div>
                  <h3 class="font-serif font-bold text-xl text-charcoal mb-1">{{ book.title }}</h3>
                  <p class="text-sm text-charcoal/60 mb-2">{{ formatAuthors(book.authors) }}</p>
                  <div class="text-[10px] uppercase tracking-widest text-charcoal/40">
                    {{ book.language }} • {{ book.pageCount }} pages
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Participants -->
        <div class="space-y-8">
          <div class="bg-white/50 border border-white p-8 rounded-2xl shadow-sm">
            <h2 class="font-serif text-2xl text-charcoal mb-6 flex justify-between items-center">
              Participants
              <span class="text-xs font-sans font-normal text-charcoal/30">{{ meeting.Participants?.length || 0 }}</span>
            </h2>
            
            <div class="space-y-4 mb-8">
              <div v-if="meeting.Participants?.length === 0" class="text-charcoal/40 font-light italic text-sm text-center py-4">
                No one has joined yet.
              </div>
              <div v-for="p in meeting.Participants" :key="p.id" class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                  {{ p.name[0].toUpperCase() }}
                </div>
                <span class="text-sm text-charcoal/80 font-medium">{{ p.name }}</span>
              </div>
            </div>

            <div v-if="isFuture(meeting.date)" class="border-t border-charcoal/5 pt-8">
              <h4 class="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-4">Join this Event</h4>
              
              <!-- Authenticated User: One-click join if not already participating -->
              <div v-if="currentUser && !isParticipating" class="space-y-4">
                <p class="text-xs text-charcoal/60 leading-relaxed">Confirm your attendance with one click.</p>
                <button 
                  @click="joinAsCurrentUser" 
                  class="w-full py-3 bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2"
                  :disabled="joining"
                >
                  <svg v-if="!joining" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  {{ joining ? 'Joining...' : 'Confirm My Spot' }}
                </button>
              </div>

              <!-- Participant message if already joined -->
              <div v-else-if="currentUser && isParticipating" class="bg-accent/5 p-4 rounded-xl border border-accent/10">
                <div class="flex items-center gap-2 text-accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  <span class="text-[10px] uppercase tracking-widest font-black">You're attending</span>
                </div>
              </div>

              <!-- Guest Form -->
              <div v-else class="space-y-3">
                <input v-model="joinForm.name" type="text" placeholder="Your Name" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent transition-colors text-sm" />
                <input v-model="joinForm.email" type="email" placeholder="Your Email" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent transition-colors text-sm" />
                <button 
                  @click="joinMeeting" 
                  class="w-full py-3 bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-accent transition-all duration-300 disabled:opacity-30"
                  :disabled="!joinForm.name || !joinForm.email || joining"
                >
                  {{ joining ? 'Processing...' : 'Send Confirmation Link' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="font-serif text-2xl text-charcoal">Meeting not found</h2>
      <RouterLink to="/events" class="text-accent underline mt-4 inline-block">Return to Events</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';
import { formatDate, formatTime, isFuture, formatAuthors } from '../utils';
import type { Meeting } from '../types';

const route = useRoute();
const meeting = ref<Meeting | null>(null);
const loading = ref(true);
const joining = ref(false);
const joinForm = ref({ name: '', email: '' });
const currentUser = ref<any>(null);

const isParticipating = computed(() => {
  if (!currentUser.value || !meeting.value?.Participants) return false;
  return meeting.value.Participants.some(p => p.email.toLowerCase() === currentUser.value.email.toLowerCase());
});

onMounted(async () => {
  const userStr = localStorage.getItem('user');
  if (userStr) currentUser.value = JSON.parse(userStr);

  await fetchMeeting();
});

const fetchMeeting = async () => {
  try {
    const res = await axios.get<Meeting>(`/api/meetings/${route.params.id}`);
    meeting.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const joinAsCurrentUser = async () => {
  if (!currentUser.value) return;
  joining.value = true;
  try {
    await axios.post(`/api/meetings/${route.params.id}/join`, {
      name: currentUser.value.name,
      email: currentUser.value.email
    });
    alert('Attendance confirmed! You are now on the list.');
    await fetchMeeting();
  } catch (e) {
    alert('Failed to join event.');
  } finally {
    joining.value = false;
  }
};

const joinMeeting = async () => {
  if (!joinForm.value.name || !joinForm.value.email) return;
  joining.value = true;
  try {
    await axios.post(`/api/meetings/${route.params.id}/join`, joinForm.value);
    alert('Please check your email to confirm your attendance. A magic link has been sent to you.');
    joinForm.value = { name: '', email: '' };
  } catch (e) {
    alert('Failed to send confirmation email. Please check your information.');
  } finally {
    joining.value = false;
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
