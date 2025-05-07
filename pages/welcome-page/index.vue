<script setup lang="ts">

definePageMeta({
  layout: 'navbar',
  title: 'Welcome page',
  middleware: ['user-middleware']
});
</script>

<template>
  <Title>Welcome</Title>
  <div class="custom-404 relative h-screen">
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <a-col>
        <a-row class="flex flex-col items-center">
          <img src="/Welcome.png" alt="logo" class="mb-4">
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