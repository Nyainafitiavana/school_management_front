<script setup lang="ts">
  definePageMeta({
    layout: 'navbar',
    title: 'Dashboard',
    middleware: ['user-middleware', 'admin-middleware']
  });
</script>

<template>
  <DashboardComponent/>
</template>

<style scoped></style>