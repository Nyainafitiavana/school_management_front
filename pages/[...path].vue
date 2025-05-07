<script setup lang="ts">

definePageMeta({
  title: 'Page Not Found', // Optional: Set a custom title
});
</script>

<template>
  <Title>Page Not Found</Title>
  <div class="custom-404 relative h-screen">
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <a-col>
        <a-row class="flex flex-col items-center">
          <img src="/logo_466x231.png" alt="logo" class="mb-4">
          <h1 class="title text-4xl font-bold">404 - Page Not Found</h1>
          <p class="description_404 text-lg mt-2">The page you're looking for does not exist.</p>
          <NuxtLink to="/" class="go-back mt-4 text-blue-500 hover:underline">Go back to the homepage</NuxtLink>
        </a-row>
      </a-col>
    </div>
  </div>
</template>

<style scoped>
  .title {
    text-align: center;
    font-size: 30px;
    font-weight: 600;
    color: #747474;
  }
  .description_404 {
    text-align: center;
    font-size: 18px;
  }
  .go-back {
    text-align: center;
    font-size: 16px;
  }
</style>