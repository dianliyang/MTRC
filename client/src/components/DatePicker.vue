<template>
  <div class="relative block w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleOpen"
      class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors font-sans text-left cursor-pointer group flex justify-between items-center hover:border-accent/30"
    >
      <span :class="modelValue ? 'text-charcoal' : 'text-charcoal/20'">
        {{ formattedDisplayDate || placeholder || 'Select date' }}
      </span>
      <div class="text-charcoal/20 group-hover:text-accent/50 transition-colors">
        <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </button>

    <!-- Content Renderer (Reused for Desktop Dropdown and Mobile Sheet) -->
    <template v-if="isOpen">
      <!-- Desktop Dropdown -->
      <Transition name="fade-down">
        <div v-if="!isMobile" class="hidden md:block absolute left-0 right-auto top-full mt-2 z-[60] bg-white border border-charcoal/5 rounded-2xl shadow-xl overflow-hidden p-6 backdrop-blur-xl min-w-[320px]">
          <CalendarContent 
            :current-month="currentMonth" 
            :current-year="currentYear"
            :selected-date="selectedDate"
            @prev-month="prevMonth"
            @next-month="nextMonth"
            @select-date="selectDate"
          />
        </div>
      </Transition>

      <!-- Mobile Bottom Sheet -->
      <Teleport to="body">
        <div class="md:hidden">
          <Transition name="fade">
            <div v-if="isOpen && isMobile" @click="close" class="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[100]"></div>
          </Transition>
          <Transition name="slide-up">
            <div v-if="isOpen && isMobile" class="fixed bottom-0 left-0 right-0 z-[101] bg-[#f8f5f2] rounded-t-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 max-w-2xl mx-auto flex flex-col items-center">
              <div class="w-12 h-1.5 bg-charcoal/10 rounded-full mx-auto mb-6"></div>
              
              <div class="w-full max-w-[320px]">
                <CalendarContent 
                  :current-month="currentMonth" 
                  :current-year="currentYear"
                  :selected-date="selectedDate"
                  @prev-month="prevMonth"
                  @next-month="nextMonth"
                  @select-date="selectDate"
                />
              </div>
            </div>
          </Transition>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from "vue";

// --- Props & Emits ---
const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    enableTime?: boolean;
  }>(),
  {
    enableTime: true,
  },
);

const emit = defineEmits(["update:modelValue"]);

// --- State ---
const isOpen = ref(false);
const isMobile = ref(false);

// Calendar State
const now = new Date();
const currentMonth = ref(now.getMonth());
const currentYear = ref(now.getFullYear());

// Helper: Parse initial value
const parseModelValue = (val: string) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// Initialize view based on prop or today
const initView = () => {
  const d = parseModelValue(props.modelValue) || new Date();
  currentMonth.value = d.getMonth();
  currentYear.value = d.getFullYear();
};

const selectedDate = computed(() => parseModelValue(props.modelValue));

const formattedDisplayDate = computed(() => {
  if (!selectedDate.value) return "";
  return selectedDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    ...(props.enableTime ? { hour: 'numeric', minute: '2-digit' } : {})
  });
});

// --- Actions ---
const toggleOpen = () => {
  if (!isOpen.value) initView();
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDate = (day: number) => {
  // Construct new date object
  // If we had a previous value with time, preserve it? 
  // The requirement says "if time selection is disabled, close".
  // For now, let's just default to 12:00 PM or preserve existing time if possible.
  
  let newDate = new Date(currentYear.value, currentMonth.value, day);
  
  if (props.enableTime && selectedDate.value) {
    // Preserve time if editing
    newDate.setHours(selectedDate.value.getHours());
    newDate.setMinutes(selectedDate.value.getMinutes());
  } else if (props.enableTime) {
    // Default to noon if new
    newDate.setHours(12, 0, 0, 0);
  }

  // ISO string for v-model
  emit("update:modelValue", newDate.toISOString());
  
  if (!props.enableTime) {
    close();
  }
};

// --- Utilities ---
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const closeOnOutside = (e: MouseEvent) => {
  if (isOpen.value && !isMobile.value && !(e.target as Element).closest('.relative')) {
    close();
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("click", closeOnOutside);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("click", closeOnOutside);
});

// --- Internal Component for Calendar Logic & UI ---
const CalendarContent = defineComponent({
  props: ['currentMonth', 'currentYear', 'selectedDate'],
  emits: ['prevMonth', 'nextMonth', 'selectDate'],
  setup(props, { emit }) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const daysInMonth = computed(() => new Date(props.currentYear, props.currentMonth + 1, 0).getDate());
    const firstDayOffset = computed(() => new Date(props.currentYear, props.currentMonth, 1).getDay());

    // Generate grid: we need empty slots for offset + actual days
    const gridCells = computed(() => {
      const cells = [];
      // Empty offset cells
      for (let i = 0; i < firstDayOffset.value; i++) {
        cells.push({ type: 'empty', key: `empty-${i}` });
      }
      // Day cells
      for (let d = 1; d <= daysInMonth.value; d++) {
        cells.push({ type: 'day', value: d, key: `day-${d}` });
      }
      return cells;
    });

    const isSelected = (day: number) => {
      if (!props.selectedDate) return false;
      return props.selectedDate.getDate() === day &&
             props.selectedDate.getMonth() === props.currentMonth &&
             props.selectedDate.getFullYear() === props.currentYear;
    };

    const isToday = (day: number) => {
      const now = new Date();
      return now.getDate() === day &&
             now.getMonth() === props.currentMonth &&
             now.getFullYear() === props.currentYear;
    };

    return () => h('div', { class: 'w-full' }, [
      // Header
      h('div', { class: 'flex items-center justify-between mb-6 relative h-8' }, [
        // Prev Button
        h('button', { 
          onClick: () => emit('prevMonth'),
          class: 'w-8 h-8 flex items-center justify-center rounded-full bg-charcoal/5 hover:bg-accent/10 hover:text-accent transition-colors z-10'
        }, [
          h('svg', { class: 'w-3 h-3 fill-current', viewBox: '0 0 17 17' }, [
            h('path', { d: 'M12.707 16.707l-1.414 1.414L4.586 11.414l8.121-8.121 1.414 1.414-6.707 6.707z' })
          ])
        ]),
        
        // Title (Centered Absolute)
        h('div', { class: 'absolute inset-0 flex items-center justify-center pointer-events-none' }, [
          h('span', { class: 'text-base font-bold uppercase tracking-wider text-charcoal font-sans' }, 
            `${monthNames[props.currentMonth]} ${props.currentYear}`
          )
        ]),

        // Next Button
        h('button', { 
          onClick: () => emit('nextMonth'),
          class: 'w-8 h-8 flex items-center justify-center rounded-full bg-charcoal/5 hover:bg-accent/10 hover:text-accent transition-colors z-10'
        }, [
          h('svg', { class: 'w-3 h-3 fill-current', viewBox: '0 0 17 17' }, [
            h('path', { d: 'M4.293 16.707l1.414 1.414 8.121-8.121-8.121-8.121-1.414 1.414 6.707 6.707z' })
          ])
        ])
      ]),

      // Weekdays
      h('div', { class: 'grid grid-cols-7 mb-2' }, 
        weekDays.map(day => h('div', { class: 'text-[10px] uppercase font-bold text-charcoal/30 text-center py-1' }, day))
      ),

      // Days Grid
      h('div', { class: 'grid grid-cols-7 gap-y-1' }, 
        gridCells.value.map(cell => {
          if (cell.type === 'empty') {
            return h('div', { key: cell.key });
          }
          const day = cell.value as number;
          const selected = isSelected(day);
          const today = isToday(day);
          
          return h('button', {
            key: cell.key,
            onClick: () => emit('selectDate', day),
            class: [
              'w-full aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200',
              selected ? 'bg-charcoal text-white font-bold shadow-md' : 'text-charcoal hover:bg-charcoal/5',
              today && !selected ? 'border border-accent/30 text-accent' : ''
            ]
          }, day);
        })
      )
    ]);
  }
});
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
</style>