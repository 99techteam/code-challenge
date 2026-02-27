<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
  
    <header class="text-center mb-12">
      <h1 class="text-6xl font-black italic tracking-tighter mb-2">
       Swap Token at <span class="text-orange-500">BEST RATES</span>
      </h1>
    </header>

    <SwapForm />
  </div>
</template>

<script lang="ts" setup>
import SwapForm from '../src/components/SwapForm/index.vue';
</script>