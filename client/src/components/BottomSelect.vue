<template>
  <div class="relative">
    <!-- Trigger -->
    <div @click="open = !open" class="relative cursor-pointer group">
      <div class="w-full bg-transparent border-b border-charcoal/10 py-3 text-charcoal font-sans flex justify-between items-center group-hover:border-accent/30 transition-colors">
        <span :class="modelValue ? 'text-charcoal' : 'text-charcoal/20'">{{ selectedLabel || placeholder || 'Select...' }}</span>
        <div class="text-charcoal/20 group-hover:text-accent/50 transition-colors">
          <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    <!-- Desktop Dropdown -->
    <Transition name="fade-down">
      <div v-if="open" class="hidden md:block absolute left-0 right-0 top-full mt-2 z-[60] bg-white border border-charcoal/5 rounded-2xl shadow-xl overflow-hidden py-2 backdrop-blur-xl">
        <button 
          v-for="option in options" 
          :key="option.value"
          @click="select(option.value)"
          class="w-full px-6 py-3 text-left hover:bg-charcoal/5 transition-colors flex items-center justify-between"
          :class="modelValue === option.value ? 'text-accent font-bold' : 'text-charcoal/60'"
        >
          <span class="text-sm uppercase tracking-widest">{{ option.label }}</span>
          <div v-if="modelValue === option.value" class="w-1.5 h-1.5 rounded-full bg-accent"></div>
        </button>
      </div>
    </Transition>

    <!-- Mobile Backdrop & Sheet -->
    <Teleport to="body">
      <div class="md:hidden">
        <Transition name="fade">
          <div v-if="open" @click="open = false" class="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[100]"></div>
        </Transition>
        <Transition name="slide-up">
          <div v-if="open" class="fixed bottom-0 left-0 right-0 z-[101] bg-[#f8f5f2] rounded-t-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 max-w-2xl mx-auto">
                      <div class="w-12 h-1.5 bg-charcoal/10 rounded-full mx-auto mb-8"></div>
                      
                      <div class="space-y-3 max-h-[60vh] overflow-y-auto">              <button 
                v-for="option in options" 
                :key="option.value"
                @click="select(option.value)"
                class="w-full py-4 text-left rounded-2xl transition-all duration-300 flex items-center justify-between px-6"
                :class="modelValue === option.value ? 'bg-white shadow-sm border border-charcoal/5' : 'hover:bg-white/50 border border-transparent'"
              >
                <span class="font-sans text-lg" :class="modelValue === option.value ? 'text-charcoal font-medium' : 'text-charcoal/60'">{{ option.label }}</span>
                <div v-if="modelValue === option.value" class="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </button>
            </div>
            
            <button @click="open = false" class="w-full mt-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/40 hover:text-charcoal transition-colors">
              Cancel
            </button>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
  label?: string;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const open = ref(false);

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label;
});

const select = (value: string) => {
  emit('update:modelValue', value);
  open.value = false;
};

// Close dropdown on click outside (desktop)
const closeOnOutside = (e: MouseEvent) => {
  if (open.value && !(e.target as Element).closest('.relative')) {
    open.value = false;
  }
};

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
</style>
