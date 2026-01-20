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
    dateFormat: "Z", // Internal format (ISO)
    altInput: true,
    altFormat: "F j, Y at h:i K", // User friendly format
    defaultDate: props.modelValue,
    minDate: "today", // Don't allow past dates
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
/* Global overrides for Flatpickr to match MoreThanReadingClub theme */

/* Container */
.flatpickr-calendar {
  background: #f8f5f2 !important; /* Sand */
  border: 1px solid rgba(44, 44, 44, 0.1) !important;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1) !important;
  border-radius: 0px !important; /* Sharp minimalist corners */
  font-family: 'Inter', sans-serif !important;
  padding: 10px !important;
}

/* Arrow */
.flatpickr-calendar:before, .flatpickr-calendar:after {
  border-bottom-color: #f8f5f2 !important;
}

/* Month/Year Header */
.flatpickr-header {
  background: transparent !important;
  margin-bottom: 10px !important;
}

.flatpickr-current-month {
  font-family: 'Playfair Display', serif !important;
  font-size: 1.2rem !important;
  color: #2c2c2c !important; /* Charcoal */
  font-weight: 600 !important;
}

.flatpickr-current-month .numInputWrapper span.arrowUp:after {
  border-bottom-color: #2c2c2c !important;
}
.flatpickr-current-month .numInputWrapper span.arrowDown:after {
  border-top-color: #2c2c2c !important;
}

/* Weekdays */
span.flatpickr-weekday {
  color: #2c2c2c !important;
  opacity: 0.4 !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
}

/* Days */
.flatpickr-day {
  color: #2c2c2c !important;
  border-radius: 0 !important;
  border: none !important;
}

.flatpickr-day.today {
  border-bottom: 2px solid #d97706 !important; /* Accent underline */
  color: #2c2c2c !important;
}

.flatpickr-day.selected, 
.flatpickr-day.startRange, 
.flatpickr-day.endRange, 
.flatpickr-day.selected.inRange, 
.flatpickr-day.startRange.inRange, 
.flatpickr-day.endRange.inRange, 
.flatpickr-day:hover,
.flatpickr-day:focus {
  background: #2c2c2c !important; /* Charcoal */
  color: #f8f5f2 !important; /* Sand */
  border-color: #2c2c2c !important;
}

/* Time Picker */
.flatpickr-time {
  border-top: 1px solid rgba(44, 44, 44, 0.1) !important;
}

.flatpickr-time .numInputWrapper span.arrowUp:after {
  border-bottom-color: #2c2c2c !important;
}
.flatpickr-time .numInputWrapper span.arrowDown:after {
  border-top-color: #2c2c2c !important;
}

.flatpickr-time input {
  color: #2c2c2c !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: bold !important;
}

.flatpickr-time .flatpickr-time-separator {
  color: #2c2c2c !important;
}

.flatpickr-time .flatpickr-am-pm {
  color: #2c2c2c !important;
}

.flatpickr-time input:hover, .flatpickr-time .flatpickr-am-pm:hover, .flatpickr-time input:focus, .flatpickr-time .flatpickr-am-pm:focus {
  background: rgba(44, 44, 44, 0.05) !important;
}
</style>
