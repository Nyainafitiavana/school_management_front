<script setup lang="ts">
  import NewSalesComponent from "~/components/Inventory/NewSalesComponent.vue";
  import {translations} from "~/composables/translations";

  definePageMeta({
    layout: 'navbar',
    title: 'Sales_new',
    middleware: ['user-middleware']
  });

  //This is a global state for language of the app
  const language = useLanguage();

  // State to control re-rendering of the component
  const refreshKey = ref(0);

  // Refresh function
  const refresh = () => {
    refreshKey.value++; // Increment the key to trigger component re-mount
  };
</script>

<template>
  <Title>{{ translations[language].newSales }}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <AppstoreOutlined/>&nbsp;
    <span>{{ translations[language].newSales }}</span>&nbsp;&nbsp;
    <a-tooltip :title="translations[language].refresh" :color="'blue'">
      <SyncOutlined class="primary-color" @click="refresh"/>
    </a-tooltip>
  </ATypographyTitle>
  <Suspense>
    <NewSalesComponent :key="refreshKey"/>
  </Suspense>
</template>

<style scoped>

</style>