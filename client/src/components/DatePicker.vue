<template>
  <div class="relative group">
    <input 
      ref="fpInput"
      :value="modelValue"
      type="text" 
      placeholder="Select Date & Time" 
      class="w-full bg-white/40 backdrop-blur-sm border-b border-charcoal/10 py-3.5 pl-4 pr-10 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-accent transition-all cursor-pointer font-sans rounded-t-lg"
    />
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/20 group-focus-within:text-accent transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue']);
const fpInput = ref(null);
let fpInstance = null;

onMounted(() => {
  fpInstance = flatpickr(fpInput.value, {
    enableTime: true,
    time_24hr: false,
    dateFormat: "Z",
    altInput: true,
    altFormat: "F j, Y - h:i K",
    defaultDate: props.modelValue,
    minDate: "today",
    disableMobile: "true",
    nextArrow: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
    prevArrow: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>',
    onChange: (selectedDates) => {
      if (selectedDates.length > 0) {
        emit('update:modelValue', selectedDates[0].toISOString());
      } else {
        emit('update:modelValue', '');
      }
    }
  });
});

watch(() => props.modelValue, (newValue) => {
  if (fpInstance && newValue) {
    fpInstance.setDate(newValue, false);
  } else if (fpInstance && !newValue) {
    fpInstance.clear(false);
  }
});

onUnmounted(() => {
  if (fpInstance) fpInstance.destroy();
});
</script>

<style>
/* Modern Redesign for Flatpickr */

.flatpickr-calendar {
  background: rgba(248, 245, 242, 0.95) !important; /* Sand with slight transparency */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 20px 50px -12px rgba(44, 44, 44, 0.15) !important;
  border-radius: 24px !important;
  font-family: 'Inter', sans-serif !important;
  padding: 12px !important;
  width: 320px !important;
  animation: fpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fpFadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.flatpickr-calendar:before, .flatpickr-calendar:after {
  display: none !important; /* Remove the arrow for a cleaner look */
}

/* Header */
.flatpickr-months {
  margin-bottom: 8px;
}

.flatpickr-current-month {
  font-family: 'Playfair Display', serif !important;
  font-size: 1.15rem !important;
  color: #2c2c2c !important;
  padding-top: 12px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.flatpickr-monthDropdown-months {
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 8px !important;
  border: none !important;
  background: transparent !important;
  cursor: pointer !important;
  transition: background 0.3s ease;
  appearance: none;
}

.flatpickr-monthDropdown-months:hover {
  background: rgba(44, 44, 44, 0.05) !important;
}

.numInputWrapper {
  width: 6ch !important;
  padding: 4px 0 !important;
  border-radius: 8px !important;
  transition: background 0.3s ease;
}

.numInputWrapper:hover {
  background: rgba(44, 44, 44, 0.05) !important;
}

.numInputWrapper input.cur-year {
  font-weight: 400 !important;
  color: #2c2c2c !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.numInputWrapper span {
  display: none !important; /* Hide ugly default year arrows */
}

/* Weekdays */
span.flatpickr-weekday {
  color: #2c2c2c !important;
  opacity: 0.3 !important;
  font-weight: 700 !important;
  font-size: 0.65rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.15em !important;
  padding-bottom: 12px;
}

/* Days */
.flatpickr-day {
  color: #2c2c2c !important;
  border-radius: 12px !important;
  height: 38px !important;
  line-height: 38px !important;
  margin: 2px !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.flatpickr-day:hover {
  background: rgba(217, 119, 6, 0.1) !important;
  border-color: rgba(217, 119, 6, 0.2) !important;
  color: #d97706 !important;
}

.flatpickr-day.today {
  color: #d97706 !important;
  font-weight: 800;
  border-bottom: none !important;
  background: rgba(217, 119, 6, 0.05);
}

.flatpickr-day.selected {
  background: #2c2c2c !important;
  color: #f8f5f2 !important;
  box-shadow: 0 8px 15px -4px rgba(44, 44, 44, 0.3) !important;
}

/* Time Section Refinement */
.flatpickr-time {
  margin-top: 16px;
  border-top: 1px solid rgba(44, 44, 44, 0.06) !important;
  height: auto !important;
  line-height: 44px !important;
  padding: 16px 10px !important;
  background: rgba(44, 44, 44, 0.015);
  border-radius: 0 0 24px 24px;
  display: flex !important;
  justify-content: center;
  align-items: center;
  gap: 6px !important;
}

.flatpickr-time input {
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  color: #2c2c2c !important;
  background: rgba(44, 44, 44, 0.03) !important;
  border-radius: 10px !important;
  padding: 0 !important;
  text-align: center !important;
  transition: all 0.3s ease;
  border: 1px solid transparent !important;
  height: 44px !important;
}

.flatpickr-time input:hover, .flatpickr-time input:focus {
  background: rgba(217, 119, 6, 0.05) !important;
  color: #d97706 !important;
  border-color: rgba(217, 119, 6, 0.1) !important;
}

.flatpickr-time .numInputWrapper {
  height: 44px !important;
  flex: 0 0 54px !important;
}

.flatpickr-time .numInputWrapper span {
  display: none !important;
}

.flatpickr-time .flatpickr-time-separator {
  font-weight: 400;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8px;
  opacity: 0.2;
  height: 44px;
}

.flatpickr-am-pm {
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  height: 44px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
  cursor: pointer;
  flex: 0 0 54px !important;
  background: rgba(44, 44, 44, 0.03) !important;
  color: #2c2c2c !important;
  margin: 0 !important;
}

.flatpickr-am-pm:hover {
  background: rgba(217, 119, 6, 0.1) !important;
  color: #d97706 !important;
}

/* Hide focus rings */
.flatpickr-day:focus, .flatpickr-calendar:focus {
  outline: none !important;
}

/* Style the custom input created by flatpickr */
.flatpickr-input.form-control[readonly] {
  background-color: transparent;
}
</style>
