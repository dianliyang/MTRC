<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-baseline mb-12">
      <div>
        <h1 class="font-serif text-4xl text-charcoal tracking-tight">Admin Console</h1>
        <span class="text-sm text-charcoal/40 font-medium"
          >System and Event Controls</span
        >
      </div>
      <button @click="logout" class="text-[10px] uppercase tracking-widest font-black text-charcoal/20 hover:text-red-400 transition-colors">
        End Session
      </button>
    </div>

    <!-- Invite User Section (Admin Only) -->
    <div v-if="currentUser?.role === 'admin'" class="mb-20">
      <div class="flex justify-between items-baseline mb-10">
        <h2 class="font-serif text-3xl text-charcoal">Invite Curator</h2>
        <span class="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">Identity Management</span>
      </div>

      <div class="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Full Name</label>
            <input v-model="inviteForm.name" type="text" placeholder="e.g. Jane Doe" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Email Address</label>
            <input v-model="inviteForm.email" type="email" placeholder="jane@example.com" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Temporary Password</label>
            <input v-model="inviteForm.password" type="text" placeholder="Minimum 8 characters" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Account Role</label>
            <select v-model="inviteForm.role" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors font-sans cursor-pointer appearance-none">
              <option value="user">Curator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <button 
          @click="inviteUser" 
          :disabled="inviting || !inviteForm.email || !inviteForm.password"
          class="px-10 py-4 bg-charcoal text-sand text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-accent hover:shadow-lg transition-all duration-500 disabled:opacity-20"
        >
          {{ inviting ? 'Sending...' : 'Send Invitation' }}
        </button>
      </div>
    </div>

    <!-- Schedule Meeting Section -->
    <div class="mb-20 border-t border-charcoal/10 pt-16">
      <div class="flex justify-between items-baseline mb-10">
        <h2 class="font-serif text-3xl text-charcoal">Create Event</h2>
        <span class="text-[10px] text-charcoal/40 uppercase tracking-[0.2em] font-bold">Programming</span>
      </div>

      <div class="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white shadow-sm mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Topic</label>
            <input v-model="newMeeting.topic" type="text" placeholder="e.g. Winter Deep Dive" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>
          
          <div class="flex flex-col sm:flex-row gap-8">
            <div class="flex-1 space-y-2">
              <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Date</label>
              <DatePicker v-model="newMeeting.date" :enable-time="false" />
            </div>

            <div class="flex-1 space-y-2">
              <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Time</label>
              <TimePicker v-model="meetingTime" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Venue</label>
            <input v-model="newMeeting.location" type="text" placeholder="e.g. Virtual Lounge" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Host</label>
            <input v-model="newMeeting.host" type="text" placeholder="Curator name" class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans" />
          </div>

          <div class="md:col-span-2 space-y-2">
            <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-1">Agenda</label>
            <textarea v-model="newMeeting.description" @input="adjustTextareaHeight($event.target)" placeholder="Details..." class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans resize-none overflow-hidden min-h-[3rem]"></textarea>
          </div>
        </div>

        <!-- Subject Matter Selection -->
        <div class="mb-12">
          <label class="block text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 mb-8 ml-1">Linked Literature</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div 
              v-for="book in candidates" 
              :key="book.id"
              @click="toggleBookSelection(book.id)"
              class="cursor-pointer group relative flex flex-col items-center text-center gap-4 transition-all duration-500 active:scale-95"
            >
              <div class="relative overflow-hidden rounded-xl shadow-lg border-4 border-transparent transition-all duration-500"
                   :class="newMeeting.bookIds.includes(book.id) ? 'border-accent shadow-accent/20' : 'group-hover:shadow-xl'">
                <img :src="book.coverUrl" referrerpolicy="no-referrer" class="w-20 h-28 object-cover" />
                <div v-if="newMeeting.bookIds.includes(book.id)" class="absolute inset-0 bg-accent/10 flex items-center justify-center">
                   <div class="bg-accent text-white p-1 rounded-full scale-110 shadow-lg">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                </div>
              </div>
              <div class="text-[10px] font-bold leading-tight text-charcoal line-clamp-2 uppercase tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">{{ book.title }}</div>
            </div>
          </div>
        </div>

        <button 
          @click="createMeeting" 
          class="w-full py-5 bg-charcoal text-sand text-[11px] uppercase tracking-[0.3em] font-bold rounded-full shadow-lg hover:bg-accent transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-4"
          :disabled="creatingMeeting || !newMeeting.topic || !newMeeting.date"
        >
          {{ creatingMeeting ? 'Processing...' : 'Confirm & Create' }}
        </button>
      </div>

      <!-- Events List -->
      <div class="space-y-6">
        <div class="flex items-center gap-4 mb-8">
          <h3 class="font-serif text-2xl text-charcoal">Registry</h3>
          <div class="h-px flex-1 bg-charcoal/5"></div>
        </div>

        <div class="space-y-4">
          <div
            v-for="meeting in meetings"
            :key="meeting.id"
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all duration-300 gap-6"
          >
            <div class="flex items-center gap-6">
              <div class="flex -space-x-4 overflow-hidden py-1">
                <template v-if="meeting.Books && meeting.Books.length > 0">
                  <img v-for="book in meeting.Books.slice(0, 3)" :key="book.id" :src="book.coverUrl" referrerpolicy="no-referrer" class="w-12 h-16 object-cover rounded-lg ring-4 ring-white shadow-sm" />
                </template>
                <div v-else class="w-12 h-16 bg-charcoal/5 flex items-center justify-center text-[8px] text-charcoal/20 rounded-lg border border-dashed border-charcoal/10">EMPTY</div>
              </div>

              <div>
                <div class="flex items-center gap-3 mb-1">
                  <div class="font-serif text-xl text-charcoal">{{ meeting.topic }}</div>
                  <span class="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border"
                        :class="meeting.publishedAt ? 'border-accent/20 text-accent bg-accent/5' : 'border-charcoal/10 text-charcoal/20'">
                    {{ meeting.publishedAt ? 'Public' : 'Draft' }}
                  </span>
                </div>
                <div class="text-[10px] text-charcoal/40 uppercase tracking-[0.1em] font-bold">
                  {{ new Date(meeting.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }} • {{ meeting.location }}
                </div>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button v-if="!meeting.publishedAt" @click.stop="publishMeeting(meeting.id)" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/5 rounded-full hover:bg-accent hover:text-white transition-all">
                Publish
              </button>
              <button @click.stop="deleteMeeting(meeting.id)" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-50 rounded-full hover:bg-red-500 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import DatePicker from '../components/DatePicker.vue';
import TimePicker from '../components/TimePicker.vue';
import type { Book, Meeting } from '../types';

const candidates = ref<Book[]>([]);
const meetings = ref<Meeting[]>([]);
const creatingMeeting = ref(false);
const currentUser = ref<any>(null);
const inviting = ref(false);
const inviteForm = ref({ name: '', email: '', password: '', role: 'user' });

const newMeeting = ref({
  topic: "",
  date: "",
  location: "",
  description: "",
  host: "",
  bookIds: [] as number[],
});

const meetingTime = ref("19:00");

// Sync time change back to main date
watch(meetingTime, (newTime) => {
  if (!newMeeting.value.date || !newTime) return;
  try {
    const d = new Date(newMeeting.value.date);
    if (isNaN(d.getTime())) return;
    const [h, m] = newTime.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    newMeeting.value.date = d.toISOString();
  } catch (e) {
    console.error("Date sync error", e);
  }
});

// Initialize time when date is picked if not set
watch(() => newMeeting.value.date, (newDate) => {
  if (newDate) {
    try {
      const d = new Date(newDate);
      if (isNaN(d.getTime())) return;
      meetingTime.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      // ignore invalid date
    }
  }
});

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const inviteUser = async () => {
  inviting.value = true;
  try {
    await axios.post('/api/admin/invite', inviteForm.value);
    alert('Curator invited');
    inviteForm.value = { name: '', email: '', password: '', role: 'user' };
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed');
  } finally {
    inviting.value = false;
  }
};

const fetchCandidates = async () => {
  try {
    const res = await axios.get<Book[]>('/api/books');
    candidates.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const toggleBookSelection = (id: number) => {
  const index = newMeeting.value.bookIds.indexOf(id);
  if (index === -1) newMeeting.value.bookIds.push(id);
  else newMeeting.value.bookIds.splice(index, 1);
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
    newMeeting.value = { topic: "", date: "", location: "", description: "", host: "", bookIds: [] };
    await fetchMeetings();
  } catch (e) {
    alert("Failed");
  } finally {
    creatingMeeting.value = false;
  }
};

const deleteMeeting = async (id: number) => {
  if (!confirm("Delete gathering?")) return;
  try {
    await axios.delete(`/api/meetings/${id}`);
    await fetchMeetings();
  } catch (e: any) {
    alert("Error: " + (e.response?.data?.error || e.message));
  }
};

const publishMeeting = async (id: number) => {
  if (!confirm("Publish and send invitations?")) return;
  try {
    await axios.post(`/api/meetings/${id}/publish`);
    await fetchMeetings();
  } catch (e) {
    alert("Failed to publish");
  }
};

const adjustTextareaHeight = (el: any) => {
  el.style.height = "auto";
  el.style.height = (el.scrollHeight) + "px";
};

onMounted(async () => {
  const userStr = localStorage.getItem('user');
  if (userStr) currentUser.value = JSON.parse(userStr);
  
  await Promise.all([fetchCandidates(), fetchMeetings()]);
});
</script>