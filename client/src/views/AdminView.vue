<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-baseline mb-12">
      <div>
        <h1 class="font-serif text-4xl text-charcoal">Curator Dashboard</h1>
        <span class="text-sm text-charcoal/50 font-medium"
          >Manage the library</span
        >
      </div>
      <button @click="logout" class="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-accent transition-colors">
        Logout
      </button>
    </div>

    <!-- Library Management Section -->
    <div class="mb-16">
      <div class="flex justify-between items-baseline mb-8">
        <h2 class="font-serif text-3xl text-charcoal">Library Management</h2>
        <span class="text-[10px] text-charcoal/40 uppercase tracking-[0.2em] font-bold">Collection Overview</span>
      </div>

      <!-- Library List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="book in candidates"
          :key="book.id"
          class="bg-white p-4 rounded-xl shadow-sm flex gap-5 group border border-transparent hover:border-accent/10 transition-all"
        >
          <router-link :to="`/library/${book.id}`" class="w-16 h-24 bg-gray-100 shrink-0 overflow-hidden rounded shadow-inner cursor-pointer">
            <img :src="book.coverUrl" class="w-full h-full object-cover" />
          </router-link>
          <div class="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div v-if="book.suggesterId && String(book.suggesterId) === currentUserId" class="mb-1">
                <span class="text-[7px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent">Added by you</span>
              </div>
              <div class="flex justify-between items-start gap-2">
                <router-link :to="`/library/${book.id}`">
                  <h3 class="font-serif font-bold text-lg text-charcoal truncate hover:text-accent transition-colors">{{ book.title }}</h3>
                </router-link>
                <span class="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-charcoal/5 bg-charcoal/5 text-charcoal/40">
                  {{ book.status }}
                </span>
              </div>
              <p class="text-sm text-charcoal/60 truncate mb-1">{{ formatAuthors(book.authors) }}</p>
            </div>
            
            <div class="flex gap-4">
              <button
                v-if="book.status !== 'current'"
                @click="selectBook(book)"
                class="text-[10px] font-bold uppercase tracking-wider text-accent hover:text-charcoal transition-colors disabled:opacity-30"
                :disabled="processingId === book.id"
              >
                {{ processingId === book.id ? 'Updating...' : 'Set Current' }}
              </button>
              <button
                @click="deleteBook(book)"
                class="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors disabled:opacity-30"
                :disabled="processingId === book.id"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="candidates.length === 0 && !loadingCandidates" class="text-center py-10 text-charcoal/30 italic font-serif">
        The library is currently empty.
      </div>
    </div>

    <!-- Invite User Section (Admin Only) -->
    <div v-if="currentUser?.role === 'admin'" class="mb-16 border-t border-charcoal/10 pt-12">
      <div class="flex justify-between items-baseline mb-10">
        <h2 class="font-serif text-3xl text-charcoal">Invite Curator</h2>
        <span class="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">Admin Only</span>
      </div>

      <div class="bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Full Name</label>
            <input v-model="inviteForm.name" type="text" placeholder="e.g. Jane Doe" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Email Address</label>
            <input v-model="inviteForm.email" type="email" placeholder="jane@example.com" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Temporary Password</label>
            <input v-model="inviteForm.password" type="text" placeholder="Minimum 8 characters" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Role</label>
            <select v-model="inviteForm.role" class="w-full bg-transparent border-b border-charcoal/10 py-2 focus:outline-none focus:border-accent">
              <option value="user">Curator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <button 
          @click="inviteUser" 
          :disabled="inviting || !inviteForm.email || !inviteForm.password"
          class="px-8 py-3 bg-charcoal text-sand text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-accent transition-all disabled:opacity-20"
        >
          {{ inviting ? 'Sending Invitation...' : 'Send Invitation' }}
        </button>
      </div>
    </div>

    <!-- Schedule Meeting Section -->
    <div class="mb-16 border-t border-charcoal/10 pt-12">
      <div class="flex justify-between items-baseline mb-10">
        <h2 class="font-serif text-3xl text-charcoal">Schedule Gathering</h2>
        <span class="text-[10px] text-charcoal/40 uppercase tracking-[0.2em] font-bold">Event Curator</span>
      </div>

      <div class="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white shadow-sm mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
          <!-- Topic -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">The Topic</label>
            <input 
              v-model="newMeeting.topic" 
              type="text" 
              placeholder="e.g. Opening Night" 
              class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" 
            />
          </div>
          
          <!-- Date -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Date & Time</label>
            <DatePicker v-model="newMeeting.date" />
          </div>

          <!-- Location -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Venue</label>
            <input 
              v-model="newMeeting.location" 
              type="text" 
              placeholder="e.g. Digital Lounge" 
              class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" 
            />
          </div>

          <!-- Host -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">The Host</label>
            <input 
              v-model="newMeeting.host" 
              type="text" 
              placeholder="Enter curator name" 
              class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" 
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2 space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Agenda Details</label>
            <textarea 
              v-model="newMeeting.description"
              @input="adjustTextareaHeight($event.target)"
              placeholder="What should members prepare for?" 
              class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans resize-none overflow-hidden h-12"
            ></textarea>
          </div>
        </div>

        <!-- Book Selection -->
        <div class="mb-12">
          <label class="block text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 mb-6 ml-1">Select Subject Matter (Books)</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div 
              v-for="book in candidates" 
              :key="book.id"
              @click="toggleBookSelection(book.id)"
              class="cursor-pointer group relative bg-white border border-charcoal/5 rounded-2xl p-4 flex flex-col items-center text-center gap-4 transition-all duration-500 hover:shadow-xl active:scale-95"
              :class="newMeeting.bookIds.includes(book.id) ? 'ring-2 ring-accent border-transparent shadow-lg' : 'hover:border-accent/20'"
            >
              <div class="relative overflow-hidden rounded shadow-sm group-hover:shadow-md transition-all duration-500">
                <img :src="book.coverUrl" class="w-16 h-24 object-cover group-hover:scale-110 transition-transform duration-700" />
                <div v-if="newMeeting.bookIds.includes(book.id)" class="absolute inset-0 bg-accent/20 flex items-center justify-center">
                   <div class="bg-accent text-white p-1 rounded-full shadow-lg scale-110">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                </div>
              </div>
              <div class="text-[10px] font-bold leading-tight text-charcoal line-clamp-2 uppercase tracking-tight">{{ book.title }}</div>
            </div>
          </div>
        </div>

        <button 
          @click="createMeeting" 
          class="group w-full py-5 bg-charcoal text-sand text-[11px] uppercase tracking-[0.3em] font-bold rounded-full shadow-lg hover:bg-accent hover:shadow-accent/20 transition-all duration-700 disabled:opacity-20 flex items-center justify-center gap-4 relative overflow-hidden"
          :disabled="creatingMeeting || !newMeeting.topic || !newMeeting.date"
        >
          <span class="relative z-10">{{ creatingMeeting ? 'Curating...' : 'Confirm & Schedule' }}</span>
          <svg v-if="!creatingMeeting" class="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          <div class="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 ease-in-out opacity-10"></div>
        </button>
      </div>

      <!-- Meetings List -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="font-serif text-xl text-charcoal">Recent & Upcoming</h3>
          <div class="h-px flex-1 bg-charcoal/5"></div>
        </div>

        <div class="space-y-4">
          <div
            v-for="meeting in meetings"
            :key="meeting.id"
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/40 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-white hover:border-accent/10 transition-all duration-300 group gap-4"
          >
            <div class="flex items-start sm:items-center gap-4 sm:gap-6">
              <!-- Show stack of covers if multiple -->
              <div class="flex -space-x-4 overflow-hidden py-1 shrink-0">
                <template v-if="meeting.Books && meeting.Books.length > 0">
                  <img
                    v-for="book in meeting.Books.slice(0, 3)"
                    :key="book.id"
                    :src="book.coverUrl"
                    class="w-10 h-14 object-cover rounded-sm ring-4 ring-sand bg-gray-100 shadow-sm"
                  />
                </template>
                <div
                  v-else
                  class="w-10 h-14 bg-charcoal/5 flex items-center justify-center text-[10px] text-charcoal/20 rounded-sm border border-dashed border-charcoal/10"
                >
                  N/A
                </div>
              </div>

              <div>
                <div class="font-serif text-lg text-charcoal leading-tight">{{ meeting.topic }}</div>
                <div class="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">
                  {{ new Date(meeting.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }} •
                  {{ meeting.location }}
                </div>
                <div v-if="meeting.Books && meeting.Books.length > 0" class="text-[10px] text-accent font-bold uppercase tracking-tighter mt-1 line-clamp-1">
                  {{ meeting.Books.map((b) => b.title).join(", ") }}
                </div>
              </div>
            </div>
            
            <button
              @click="deleteMeeting(meeting.id)"
              class="w-full sm:w-auto py-3 sm:py-0 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-50 sm:bg-transparent rounded-lg sm:rounded-none hover:text-red-600 transition-colors sm:opacity-0 group-hover:opacity-100 border border-red-100 sm:border-none"
            >
              Cancel Gathering
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <transition name="slide-up">
        <div v-if="lastEmailPreview" class="fixed bottom-8 right-8 z-50">
          <div
            class="bg-charcoal text-sand px-6 py-4 rounded shadow-2xl flex items-center gap-4"
          >
            <div>
              <strong class="block font-medium">Notification Sent</strong>
              <span class="text-xs text-sand/60"
                >Members have been alerted.</span
              >
            </div>
            <a
              :href="lastEmailPreview"
              target="_blank"
              class="text-accent hover:text-white text-sm font-bold underline"
              >View Email</a
            >
            <button
              @click="lastEmailPreview = null"
              class="text-sand/40 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DatePicker from '../components/DatePicker.vue';
import { formatAuthors } from '../utils';
import type { Book, Meeting } from '../types';

const candidates = ref<Book[]>([]);
const loadingCandidates = ref(true);
const lastEmailPreview = ref<string | null>(null);
const processingId = ref<number | null>(null);

const meetings = ref<Meeting[]>([]);
const creatingMeeting = ref(false);

const currentUser = ref<any>(null);
const currentUserId = ref('');
const inviting = ref(false);
const inviteForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'user'
});

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

interface NewMeeting {
  topic: string;
  date: string;
  location: string;
  description: string;
  host: string;
  bookIds: number[];
}

const newMeeting = ref<NewMeeting>({
  topic: "",
  date: "",
  location: "",
  description: "",
  host: "",
  bookIds: [],
});

const inviteUser = async () => {
  inviting.value = true;
  try {
    await axios.post('/api/admin/invite', inviteForm.value);
    alert('Invitation sent successfully');
    inviteForm.value = { name: '', email: '', password: '', role: 'user' };
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed to send invitation');
  } finally {
    inviting.value = false;
  }
};
const fetchCandidates = async () => {
  loadingCandidates.value = true;
  try {
    const res = await axios.get<Book[]>('/api/books');
    candidates.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loadingCandidates.value = false;
  }
};

const selectBook = async (book: Book) => {
  if (!confirm(`Mark "${book.title}" as current? Notifications will be sent.`))
    return;

  processingId.value = book.id;
  try {
    const res = await axios.post('/api/books/select', {
      id: book.id,
    });
    if (res.data.emailPreview) {
      lastEmailPreview.value = res.data.emailPreview;
    }
    await fetchCandidates();
  } catch (e) {
    alert("Failed to update status");
  } finally {
    processingId.value = null;
  }
};

const deleteBook = async (book: Book) => {
  if (
    !confirm(
      `Are you sure you want to remove "${book.title}" from the library?`,
    )
  )
    return;

  processingId.value = book.id;
  try {
    await axios.delete(`/api/books/${book.id}`);
    await fetchCandidates();
  } catch (e) {
    alert("Failed to delete book");
  } finally {
    processingId.value = null;
  }
};

const toggleBookSelection = (id: number) => {
  const index = newMeeting.value.bookIds.indexOf(id);
  if (index === -1) {
    newMeeting.value.bookIds.push(id);
  } else {
    newMeeting.value.bookIds.splice(index, 1);
  }
};

const fetchMeetings = async () => {
  try {
    const res = await axios.get<Meeting[]>('/api/meetings');
    meetings.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const createMeeting = async () => {
  creatingMeeting.value = true;
  try {
    await axios.post('/api/meetings', newMeeting.value);
    newMeeting.value = {
      topic: "",
      date: "",
      location: "",
      description: "",
      host: "",
      bookIds: [],
    };
    await fetchMeetings();
  } catch (e) {
    alert("Failed to schedule meeting");
  } finally {
    creatingMeeting.value = false;
  }
};

const deleteMeeting = async (id: number) => {
  if (!confirm("Cancel this gathering?")) return;
  try {
    await axios.delete(`/api/meetings/${id}`);
    await fetchMeetings();
  } catch (e) {
    alert("Failed to delete meeting");
  }
};

const adjustTextareaHeight = (el: any) => {
  el.style.height = "auto";
  el.style.height = (el.scrollHeight) + "px";
};

onMounted(async () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
    currentUserId.value = String(currentUser.value.id);
  }
  
  try {
    await Promise.all([
      fetchCandidates(),
      fetchMeetings()
    ]);
  } catch (e) {
    console.error('Failed to initialize Admin Dashboard:', e);
  }
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
