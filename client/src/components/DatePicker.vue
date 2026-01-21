<template>
  <div class="relative w-full">
    <input
      ref="fpInput"
      type="text"
      :placeholder="placeholder || 'Select date & time'"
      class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans cursor-pointer"
    />
    <!-- Mobile Backdrop -->
    <Teleport to="body">
      <div
        v-if="isOpen && isMobile"
        class="fixed inset-0 z-[9998] bg-charcoal/20 backdrop-blur-sm md:hidden"
        @click="closeCalendar"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

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
const fpInput = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const isMobile = ref(false);
let fpInstance: any = null;

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const closeCalendar = () => {
  if (fpInstance) fpInstance.close();
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  if (fpInput.value) {
    fpInstance = flatpickr(fpInput.value, {
      enableTime: props.enableTime,
      time_24hr: false,
      dateFormat: "Z",
      altInput: true,
      altFormat: props.enableTime ? "F j, Y at h:i K" : "F j, Y",
      altInputClass:
        "w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-accent transition-colors font-sans cursor-pointer",
      defaultDate: props.modelValue,
      minDate: "today",
      monthSelectorType: "static",
      static: false,
      animate: true,
      disableMobile: true,
      onOpen: () => {
        isOpen.value = true;
      },
      onClose: () => {
        isOpen.value = false;
      },
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          emit("update:modelValue", selectedDates[0].toISOString());
        }
      },
    });
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (fpInstance && newVal) fpInstance.setDate(newVal, false);
  },
);

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
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
  font-family: "Inter", sans-serif !important;
  width: 340px !important;
  z-index: 9999 !important;
}

/* Mobile Bottom Sheet Style */
@media (max-width: 767px) {
  .flatpickr-calendar {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    border-radius: 2.5rem 2.5rem 0 0 !important;
    margin: 0 !important;
    padding: 2rem 1rem 4rem 1rem !important;
    transform: translateY(0) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.1) !important;
  }

  .flatpickr-calendar.open {
    animation: slide-up 0.3s ease-out !important;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.flatpickr-wrapper {
  width: 100% !important;
  display: block !important;
}

.flatpickr-innerContainer {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}

.flatpickr-months {
  padding: 0 !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  width: 100% !important;
  margin-bottom: 8px !important;
}

.flatpickr-months .flatpickr-month {
  color: #2c2c2c !important;
  fill: #2c2c2c !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  margin: 0 !important;
  pointer-events: none !important;
}

.flatpickr-current-month {
  padding: 0 !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: static !important;
  width: auto !important;
  font-family: "Inter", sans-serif !important;
}

.flatpickr-current-month .flatpickr-monthDropdown-months,
.flatpickr-current-month span.cur-year {
  font-weight: 700 !important;
  font-size: 14px !important;
  font-family: "Inter", sans-serif !important;
  color: #2c2c2c !important;
  background: transparent !important;
  border: none !important;
  padding: 0 2px !important;
  margin: 0 !important;
  width: auto !important;
  display: inline-block !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  pointer-events: none !important;
}

.flatpickr-current-month span.cur-year {
  margin-left: 4px !important;
}

.numInputWrapper {
  display: flex !important;
  align-items: center !important;
  width: auto !important;
  pointer-events: none !important;
}

.numInputWrapper input {
  display: none !important;
}

.numInputWrapper span {
  display: none !important;
}

.flatpickr-days {
  width: auto !important;
  display: flex !important;
}

.dayContainer {
  width: 307.875px !important;
  min-width: 307.875px !important;
  max-width: 307.875px !important;
}

.flatpickr-day {
  border-radius: 12px !important;
  color: #2c2c2c !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.flatpickr-day.flatpickr-disabled, 
.flatpickr-day.flatpickr-disabled:hover,
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay {
  color: rgba(44, 44, 44, 0.15) !important;
  background: transparent !important;
  border-color: transparent !important;
}

.flatpickr-day.today {
  border-color: rgba(217, 119, 6, 0.2) !important;
}

.flatpickr-day.selected, .flatpickr-day.selected:hover {
  background: #2c2c2c !important;
  border-color: #2c2c2c !important;
  color: #f8f5f2 !important;
}

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
  z-index: 10 !important;
  transition: color 0.3s ease !important;
  cursor: pointer !important;
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

.flatpickr-months .flatpickr-prev-month:hover,
.flatpickr-months .flatpickr-next-month:hover {
  background: transparent !important;
  color: #d97706 !important;
  fill: #d97706 !important;
}

.flatpickr-months .flatpickr-prev-month {
  left: -5px !important;
}

.flatpickr-months .flatpickr-next-month {
  right: -5px !important;
}
</style>
