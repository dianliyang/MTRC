<template>
  <div class="relative block w-full" v-click-outside="close">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal focus:outline-none focus:border-accent transition-colors font-sans text-left cursor-pointer"
    >
      <span :class="modelValue ? 'text-charcoal' : 'text-charcoal/20'">
        {{ displayTime || placeholder || 'Select time' }}
      </span>
    </button>

    <!-- Popover -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="isOpen"
        @click.stop
        class="absolute z-[100] top-full left-0 right-0 mt-2 p-2 bg-white border border-charcoal/10 shadow-2xl flex w-full min-h-[280px] rounded-2xl"
      >
        <!-- Hours -->
        <div class="flex-1 flex flex-col items-center py-4 px-2">
          <input
            type="text"
            inputmode="numeric"
            v-model="inputHourDisplay"
            @blur="finalizeHour"
            @keyup.enter="finalizeHour"
            @click.stop
            @focus="($event.target as HTMLInputElement).select()"
            class="w-12 text-center text-sm font-bold tracking-tight text-charcoal bg-charcoal/5 rounded-lg py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-text relative z-[60]"
            maxlength="2"
          />
          <div class="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1 px-1 snap-y w-full items-center">
            <button
              v-for="h in 12"
              :key="h"
              @click="setHour(h)"
              class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all snap-center"
              :class="selectedHour === h ? 'bg-charcoal text-sand shadow-lg' : 'hover:bg-charcoal/5 text-charcoal/40'"
            >
              {{ h.toString().padStart(2, '0') }}
            </button>
          </div>
        </div>

        <!-- Minutes -->
        <div class="flex-1 flex flex-col items-center py-4 px-2 border-l border-charcoal/5">
          <input
            type="text"
            inputmode="numeric"
            v-model="inputMinuteDisplay"
            @blur="finalizeMinute"
            @keyup.enter="finalizeMinute"
            @click.stop
            @focus="($event.target as HTMLInputElement).select()"
            class="w-12 text-center text-sm font-bold tracking-tight text-charcoal bg-charcoal/5 rounded-lg py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-text relative z-[60]"
            maxlength="2"
          />
          <div class="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1 px-1 snap-y w-full items-center">
            <button
              v-for="m in minutesOptions"
              :key="m"
              @click="setMinute(m)"
              class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all snap-center"
              :class="selectedMinute === m ? 'bg-charcoal text-sand shadow-lg' : 'hover:bg-charcoal/5 text-charcoal/40'"
            >
              {{ m.toString().padStart(2, '0') }}
            </button>
          </div>
        </div>

        <!-- AM/PM -->
        <div class="flex-1 flex flex-col items-center py-4 px-2 border-l border-charcoal/5">
          <span class="text-[8px] uppercase tracking-[0.2em] font-black text-charcoal/20 mb-3 h-9 flex items-center">Zone</span>
          <div class="flex flex-col gap-2 w-full items-center">
            <button
              v-for="p in ['AM', 'PM']"
              :key="p"
              @click="setPeriod(p)"
              class="w-12 h-10 flex items-center justify-center rounded-xl text-[9px] font-black tracking-widest transition-all"
              :class="selectedPeriod === p ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-charcoal/5 text-charcoal/40'"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: string; // "HH:mm" in 24h format
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectedHour = ref(12);
const selectedMinute = ref(0);
const selectedPeriod = ref('AM');

const inputHourDisplay = ref('12');
const inputMinuteDisplay = ref('00');

const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

const finalizeHour = () => {
  let val = parseInt(inputHourDisplay.value);
  if (isNaN(val)) {
    inputHourDisplay.value = selectedHour.value.toString().padStart(2, '0');
    return;
  }
  if (val > 12) val = 12;
  if (val < 1) val = 1;
  selectedHour.value = val;
  inputHourDisplay.value = val.toString().padStart(2, '0');
  updateValue();
};

const finalizeMinute = () => {
  let val = parseInt(inputMinuteDisplay.value);
  if (isNaN(val)) {
    inputMinuteDisplay.value = selectedMinute.value.toString().padStart(2, '0');
    return;
  }
  if (val > 59) val = 59;
  if (val < 0) val = 0;
  selectedMinute.value = val;
  inputMinuteDisplay.value = val.toString().padStart(2, '0');
  updateValue();
};

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

const setHour = (h: number) => {
  selectedHour.value = h;
  inputHourDisplay.value = h.toString().padStart(2, '0');
  updateValue();
};

const setMinute = (m: number) => {
  selectedMinute.value = m;
  inputMinuteDisplay.value = m.toString().padStart(2, '0');
  updateValue();
};

const setPeriod = (p: string) => {
  selectedPeriod.value = p;
  updateValue();
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
      inputHourDisplay.value = selectedHour.value.toString().padStart(2, '0');
      inputMinuteDisplay.value = selectedMinute.value.toString().padStart(2, '0');
    }
  }
}, { immediate: true });

// v-click-outside directive logic
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      // Check if the click was outside the element and its children
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    // Use capture phase to ensure we catch it before other stopPropagation calls if necessary, 
    // but here we just want to make sure it's registered on the document.
    // mousedown is often more reliable than click for "click outside"
    document.addEventListener('mousedown', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('mousedown', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

