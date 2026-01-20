<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-baseline mb-12">
      <h1 class="font-serif text-4xl text-charcoal">Curator Dashboard</h1>
      <span class="text-sm text-charcoal/50 font-medium"
        >Manage the library</span
      >
    </div>

    <!-- Search Section -->
    <div class="mb-16">
      <div class="relative max-w-2xl">
        <input
          v-model="searchQuery"
          @keyup.enter="searchBooks"
          type="text"
          placeholder="Search for a title or author..."
          class="w-full bg-white border-none py-4 pl-6 pr-32 shadow-sm rounded-lg text-lg focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-charcoal/30"
        />
        <button
          @click="searchBooks"
          class="absolute right-2 top-2 bottom-2 px-6 bg-charcoal text-white rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          :disabled="searching"
        >
          {{ searching ? "..." : "Search" }}
        </button>
      </div>

      <!-- Search Results -->
      <transition name="fade">
        <div
          v-if="searchResults.length > 0"
          class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div
            v-for="book in searchResults"
            :key="book.id"
            class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex gap-5 group border border-transparent hover:border-accent/10"
          >
            <div
              class="w-16 h-24 bg-gray-100 shrink-0 overflow-hidden rounded-sm shadow-inner"
            >
              <img
                :src="book.volumeInfo.imageLinks?.thumbnail"
                class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-serif font-bold text-lg text-charcoal truncate">
                {{ book.volumeInfo.title }}
              </h3>
              <p class="text-sm text-charcoal/60 truncate mb-1">
                {{ book.volumeInfo.authors?.join(", ") }}
              </p>
              <div
                class="flex gap-2 text-[10px] uppercase tracking-wider text-charcoal/40 mb-3"
              >
                <span>{{ book.volumeInfo.language }}</span>
                <span>•</span>
                <span>{{ book.volumeInfo.pageCount }} pages</span>
              </div>
              <button
                @click="addCandidate(book)"
                class="text-xs font-bold uppercase tracking-wider text-accent hover:text-charcoal transition-colors"
              >
                + Add to Library
              </button>
            </div>
          </div>
        </div>
      </transition>
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
import type { Book, Meeting } from '../types';

const searchQuery = ref('');
const searchResults = ref<any[]>([]); // Google Books API results
const searching = ref(false);
const candidates = ref<Book[]>([]);
const loadingCandidates = ref(true);
const processingId = ref<number | string | null>(null);
const lastEmailPreview = ref<string | null>(null);

const meetings = ref<Meeting[]>([]);
const creatingMeeting = ref(false);

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

// Google Books API
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

    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books`, {
      googleId: googleBook.id,
      title: info.title,
      authors: info.authors || [],
      description: info.description || "",
      coverUrl: info.imageLinks?.thumbnail || "",
      language: info.language || "",
      pageCount: info.pageCount || 0,
      publishedDate: info.publishedDate || "",
      suggesterId: userId,
    });
    // Refresh list
    searchResults.value = searchResults.value.filter(
      (b) => b.id !== googleBook.id,
    );
    await fetchCandidates();
  } catch (e) {
    alert("Failed to add book");
  }
};

const fetchCandidates = async () => {
  loadingCandidates.value = true;
  try {
    const res = await axios.get<Book[]>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books`);
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
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books/select`, {
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
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books/${book.id}`);
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
    const res = await axios.get<Meeting[]>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/meetings`);
    meetings.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const createMeeting = async () => {
  creatingMeeting.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/meetings`, newMeeting.value);
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
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/meetings/${id}`);
    await fetchMeetings();
  } catch (e) {
    alert("Failed to delete meeting");
  }
};

const formatAuthors = (authorsStr: string | string[]) => {
  try {
    if (!authorsStr) return "Unknown Author";
    if (Array.isArray(authorsStr)) return authorsStr.join(", ");
    if (authorsStr.startsWith("[")) {
      return JSON.parse(authorsStr).join(", ");
    }
    return authorsStr;
  } catch (e) {
    return String(authorsStr);
  }
};

const adjustTextareaHeight = (el: any) => {
  el.style.height = "auto";
  el.style.height = (el.scrollHeight) + "px";
};

onMounted(() => {
  fetchCandidates();
  fetchMeetings();
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
