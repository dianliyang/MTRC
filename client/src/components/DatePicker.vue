<template>
  <div class="relative">
    <input 
      ref="fpInput"
      :value="modelValue"
      type="text" 
      placeholder="Select Date & Time" 
      class="w-full bg-sand/30 border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-accent transition-colors cursor-pointer font-sans"
    />
    <div class="absolute right-0 top-3 pointer-events-none text-charcoal/20">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
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
    time_24hr: true, // Enable 24-hour format
    dateFormat: "Z",
    altInput: true,
    altFormat: "F j, Y - H:i", // Clean 24hr display
    defaultDate: props.modelValue,
    minDate: "today",
    disableMobile: "true",
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
  font-size: 1.1rem !important;
  color: #2c2c2c !important;
  padding-top: 10px !important;
}

.flatpickr-monthDropdown-months {
  font-weight: 700 !important;
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
  border-top: 1px solid rgba(44, 44, 44, 0.08) !important;
  height: auto !important;
  line-height: 40px !important;
  padding: 12px 0 4px 0 !important;
  background: rgba(44, 44, 44, 0.02);
  border-radius: 0 0 20px 24px;
}

.flatpickr-time input {
  font-weight: 800 !important;
  font-size: 1.2rem !important;
  color: #2c2c2c !important;
  background: transparent !important;
  border-radius: 8px !important;
  padding: 4px 0 !important;
}

.flatpickr-time .numInputWrapper {
  height: 40px !important;
  flex: 1;
}

.flatpickr-time .numInputWrapper span {
  border: none !important;
  background: rgba(44, 44, 44, 0.05) !important;
  border-radius: 4px;
  margin: 2px;
}

.flatpickr-time .numInputWrapper span:hover {
  background: rgba(217, 119, 6, 0.1) !important;
}

.flatpickr-time .numInputWrapper span.arrowUp:after {
  border-bottom-color: #2c2c2c !important;
}

.flatpickr-time .numInputWrapper span.arrowDown:after {
  border-top-color: #2c2c2c !important;
}

.flatpickr-time .flatpickr-time-separator {
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  opacity: 0.2;
}

.flatpickr-am-pm {
  font-weight: 800 !important;
  font-size: 0.9rem !important;
  height: 40px !important;
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
