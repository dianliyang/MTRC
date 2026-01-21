<template>
  <div class="relative block w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors font-sans text-left cursor-pointer group flex justify-between items-center hover:border-accent/30"
    >
      <span :class="modelValue ? 'text-charcoal' : 'text-charcoal/20'">
        {{ displayTime || placeholder || 'Select time' }}
      </span>
      <div class="text-charcoal/20 group-hover:text-accent/50 transition-colors">
        <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </button>

    <!-- Desktop Dropdown -->
    <Transition name="fade-down">
      <div v-if="isOpen" class="hidden md:block absolute left-0 right-0 top-full mt-2 z-[60] bg-white border border-charcoal/5 rounded-2xl shadow-xl overflow-hidden p-6 backdrop-blur-xl">
        <div class="flex gap-4 justify-center mb-6">
          <!-- Hours -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-[9px] uppercase tracking-widest font-bold text-charcoal/40">Hour</span>
            <div class="h-40 overflow-y-auto scrollbar-hide flex flex-col gap-1 w-16 items-center">
              <button
                v-for="h in 12"
                :key="h"
                @click="setHour(h)"
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-bold transition-all"
                :class="selectedHour === h ? 'bg-charcoal text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60'"
              >
                {{ h }}
              </button>
            </div>
          </div>

          <!-- Minutes -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-[9px] uppercase tracking-widest font-bold text-charcoal/40">Minute</span>
            <div class="h-40 overflow-y-auto scrollbar-hide flex flex-col gap-1 w-16 items-center">
              <button
                v-for="m in minutesOptions"
                :key="m"
                @click="setMinute(m)"
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-bold transition-all"
                :class="selectedMinute === m ? 'bg-charcoal text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60'"
              >
                {{ m.toString().padStart(2, '0') }}
              </button>
            </div>
          </div>

          <!-- Period -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-[9px] uppercase tracking-widest font-bold text-charcoal/40">Period</span>
            <div class="flex flex-col gap-2">
              <button
                v-for="p in ['AM', 'PM']"
                :key="p"
                @click="setPeriod(p)"
                class="w-12 h-10 flex items-center justify-center rounded-xl text-xs font-black tracking-widest transition-all"
                :class="selectedPeriod === p ? 'bg-accent text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60'"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>
        <button @click="confirmTime" class="w-full py-3 bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-accent transition-colors">
          Set Time
        </button>
      </div>
    </Transition>

    <!-- Mobile Bottom Sheet -->
    <Teleport to="body">
      <div class="md:hidden">
        <Transition name="fade">
          <div v-if="isOpen" @click="close" class="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[100]"></div>
        </Transition>
        <Transition name="slide-up">
          <div v-if="isOpen" class="fixed bottom-0 left-0 right-0 z-[101] bg-[#f8f5f2] rounded-t-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 max-w-2xl mx-auto">
            <div class="w-12 h-1.5 bg-charcoal/10 rounded-full mx-auto mb-8"></div>

            <div class="flex gap-4 justify-center mb-8">
              <!-- Hours -->
              <div class="flex flex-col items-center gap-2">
                <div class="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1 w-16 items-center snap-y">
                  <button
                    v-for="h in 12"
                    :key="h"
                    @click="setHour(h)"
                    class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-lg font-bold transition-all snap-center"
                    :class="selectedHour === h ? 'bg-charcoal text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60'"
                  >
                    {{ h }}
                  </button>
                </div>
              </div>

              <div class="h-48 flex items-center text-charcoal/20 text-2xl font-serif">:</div>

              <!-- Minutes -->
              <div class="flex flex-col items-center gap-2">
                <div class="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1 w-16 items-center snap-y">
                  <button
                    v-for="m in minutesOptions"
                    :key="m"
                    @click="setMinute(m)"
                    class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-lg font-bold transition-all snap-center"
                    :class="selectedMinute === m ? 'bg-charcoal text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60'"
                  >
                    {{ m.toString().padStart(2, '0') }}
                  </button>
                </div>
              </div>

              <!-- Period -->
              <div class="flex flex-col gap-2 justify-center ml-4">
                <button
                  v-for="p in ['AM', 'PM']"
                  :key="p"
                  @click="setPeriod(p)"
                  class="w-14 h-12 flex items-center justify-center rounded-xl text-xs font-black tracking-widest transition-all"
                  :class="selectedPeriod === p ? 'bg-accent text-white shadow-md' : 'hover:bg-charcoal/5 text-charcoal/60 bg-charcoal/5'"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <button 
              @click="confirmTime"
              class="w-full py-4 bg-charcoal text-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-accent transition-all duration-300 shadow-lg active:scale-95"
            >
              Confirm Time
            </button>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string; // "HH:mm" in 24h format
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectedHour = ref(12);
const selectedMinute = ref(0);
const selectedPeriod = ref('AM');

const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

const displayTime = computed(() => {
  if (!props.modelValue) return '';
  const parts = props.modelValue.split(':');
  if (parts.length !== 2) return '';
  
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
});

const close = () => {
  isOpen.value = false;
};

// Close dropdown on click outside (desktop)
const closeOnOutside = (e: MouseEvent) => {
  if (isOpen.value && !(e.target as Element).closest('.relative')) {
    // Only close if not clicking inside the popover structure (simplified check)
    // For specific popover classes, we rely on Vue event bubbling stop/checks usually,
    // but here we just check if we are outside the main wrapper.
    // However, since we have teleported content for mobile, we need to be careful.
    // The mobile backdrop handles the click outside.
    // For desktop (non-teleported), this check works.
    const target = e.target as HTMLElement;
    if (target.closest('.fixed')) return; // Ignore clicks in mobile sheet
    close();
  }
};

const setHour = (h: number) => {
  selectedHour.value = h;
};

const setMinute = (m: number) => {
  selectedMinute.value = m;
};

const setPeriod = (p: string) => {
  selectedPeriod.value = p;
};

const confirmTime = () => {
  updateValue();
  close();
};

const updateValue = () => {
  let h = selectedHour.value;
  if (selectedPeriod.value === 'PM' && h < 12) h += 12;
  if (selectedPeriod.value === 'AM' && h === 12) h = 0;
  
  const formattedTime = `${h.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`;
  emit('update:modelValue', formattedTime);
};

// Initialize from modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const parts = newVal.split(':');
    if (parts.length === 2) {
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      selectedPeriod.value = h >= 12 ? 'PM' : 'AM';
      selectedHour.value = h % 12 || 12;
      selectedMinute.value = m;
    }
  }
}, { immediate: true });

onMounted(() => window.addEventListener('click', closeOnOutside));
onUnmounted(() => window.removeEventListener('click', closeOnOutside));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.3s ease-out;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

