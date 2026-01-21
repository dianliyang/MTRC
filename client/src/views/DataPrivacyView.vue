<template>
  <div class="max-w-3xl mx-auto py-12 px-4 md:px-6 animate-fade-in">
    <div class="mb-16">
      <h1 class="font-serif text-4xl text-charcoal mb-4">Data Privacy</h1>
      <p class="text-charcoal/50 font-light uppercase tracking-[0.2em] text-[10px]">Your Privacy & Information</p>
    </div>

    <div class="space-y-12 text-charcoal/80 leading-relaxed">
      <section>
        <h2 class="font-serif text-2xl text-charcoal mb-4">Our Commitment</h2>
        <p>
          At MoreThan Reading Club, we believe your data should be as private as your personal library. We are committed to protecting your personal information and being transparent about what we collect and how we use it.
        </p>
      </section>

      <section>
        <h2 class="font-serif text-2xl text-charcoal mb-4">What We Collect</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-2">Account Information</h3>
            <p>Your name, email address, and encrypted password provided during registration or invitation.</p>
          </div>
          <div>
            <h3 class="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-2">Interaction Data</h3>
            <p>Information about the books you suggest, like, or comment on, and your attendance at gatherings.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="font-serif text-2xl text-charcoal mb-4">How We Use It</h2>
        <ul class="list-disc list-inside space-y-2 ml-2">
          <li>To facilitate book discussions and community interactions.</li>
          <li>To coordinate and manage event attendance.</li>
          <li>To notify you of new book selections and upcoming gatherings.</li>
          <li>We never sell your data or share it with third parties for marketing.</li>
        </ul>
      </section>

      <section>
        <h2 class="font-serif text-2xl text-charcoal mb-4">Your Rights</h2>
        <p>
          You have the right to access your personal data, correct any inaccuracies, and request the deletion of your account at any time. Account deletion is a permanent action that removes your personal identity from our records.
        </p>
      </section>

      <div class="pt-12 border-t border-charcoal/5">
        <RouterLink 
          to="/profile" 
          class="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-charcoal/40 hover:text-accent transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Return to Profile
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
