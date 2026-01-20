<template>
  <div class="relative w-full">
    <input 
      ref="fpInput"
      type="text" 
      :placeholder="placeholder || 'Select date & time'" 
      class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans cursor-pointer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

const props = withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
  enableTime?: boolean;
}>(), {
  enableTime: true
});

const emit = defineEmits(['update:modelValue']);
const fpInput = ref<HTMLInputElement | null>(null);
let fpInstance: any = null;

onMounted(() => {
  if (fpInput.value) {
    fpInstance = flatpickr(fpInput.value, {
      enableTime: props.enableTime,
      time_24hr: false,
      dateFormat: "Z",
      altInput: true,
      altFormat: props.enableTime ? "F j, Y at h:i K" : "F j, Y",
      altInputClass: "w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans cursor-pointer",
      defaultDate: props.modelValue,
      minDate: "today",
      monthSelectorType: "static", 
      static: true,
      animate: true,
      disableMobile: true,
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          emit('update:modelValue', selectedDates[0].toISOString());
        }
      }
    });
  }
});

watch(() => props.modelValue, (newVal) => {
  if (fpInstance && newVal) fpInstance.setDate(newVal, false);
});

onUnmounted(() => {
  if (fpInstance) fpInstance.destroy();
});
</script>

<style>
.flatpickr-calendar {
  background: #ffffff !important;
  border: 1px solid rgba(44, 44, 44, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1) !important;
  border-radius: 1.5rem !important;
  padding: 1.5rem !important;
  margin-top: 8px !important;
  font-family: 'Inter', sans-serif !important;
  width: 100% !important; 
  min-width: 300px !important;
  max-width: 400px !important;
  z-index: 50 !important;
}

.flatpickr-wrapper {
  width: 100% !important;
  display: block !important;
}

span.flatpickr-weekday {
  color: rgba(44, 44, 44, 0.3) !important;
  font-size: 10px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  font-weight: 800 !important;
}

.flatpickr-days {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}

.dayContainer {
  min-width: 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

.flatpickr-months {
  padding: 0 10px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
}

.flatpickr-months .flatpickr-month {
  color: #2c2c2c !important;
  fill: #2c2c2c !important;
  pointer-events: none !important; 
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.flatpickr-current-month {
  padding: 0 !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  top: 0 !important;
  pointer-events: none !important;
}

.flatpickr-current-month .flatpickr-monthDropdown-months {
  font-weight: 700 !important;
  font-size: 14px !important;
  pointer-events: none !important;
  padding: 0 4px !important;
}

.numInputWrapper {
  pointer-events: none !important;
  display: flex !important;
  align-items: center !important;
}

.flatpickr-day {
  border-radius: 12px !important;
  color: #2c2c2c !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.flatpickr-day.today {
  border-color: rgba(217, 119, 6, 0.2) !important;
}

.flatpickr-day.selected, .flatpickr-day.selected:hover {
  background: #2c2c2c !important;
  border-color: #2c2c2c !important;
  color: #f8f5f2 !important;
}

.flatpickr-time {
  border-top: 1px solid rgba(0,0,0,0.05) !important;
  height: 60px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

.flatpickr-time input {
  font-weight: 700 !important;
  font-size: 16px !important;
  background: rgba(44, 44, 44, 0.05) !important;
  border-radius: 8px !important;
  height: 40px !important;
  width: 50px !important;
  text-align: center !important;
  cursor: text !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease !important;
}

.flatpickr-time input:focus {
  background: #ffffff !important;
  border-color: rgba(217, 119, 6, 0.3) !important;
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.05) !important;
}

/* Hide arrow buttons for a cleaner input look */
.flatpickr-time .numInputWrapper span {
  display: none !important;
}

.flatpickr-calendar:before, .flatpickr-calendar:after { display: none !important; }

.flatpickr-months .flatpickr-prev-month, 
.flatpickr-months .flatpickr-next-month {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  color: rgba(44, 44, 44, 0.4) !important;
  fill: rgba(44, 44, 44, 0.4) !important;
  pointer-events: auto !important;
  z-index: 10 !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  top: 8px !important; /* Center within the 48px header (48-32)/2 = 8 */
}

.flatpickr-months .flatpickr-prev-month:hover, 
.flatpickr-months .flatpickr-next-month:hover {
  background: rgba(44, 44, 44, 0.05) !important;
  color: #d97706 !important;
  fill: #d97706 !important;
}

.flatpickr-months .flatpickr-prev-month {
  left: 15px !important;
}

.flatpickr-months .flatpickr-next-month {
  right: 15px !important;
}
</style>