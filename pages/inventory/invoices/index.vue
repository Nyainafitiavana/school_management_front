<script setup lang="ts">

import InvoicesComponent from "~/components/Inventory/InvoicesComponent.vue";
import {translations} from "~/composables/translations";

definePageMeta({
  layout: 'navbar',
  title: 'Invoices',
  middleware: ['user-middleware', 'admin-middleware']
});

//This is a global state for language of the app
const language = useLanguage();

// State to control re-rendering of the component
const refreshKey = ref(0);

// Refresh function
const refreshInvoices = () => {
  refreshKey.value++; // Increment the key to trigger component re-mount
};
</script>

<template>
  <Title>{{ language === 'ENG' ? 'Invoices' : 'Factures' }}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <SnippetsOutlined />&nbsp;
    <span>{{ language === 'ENG' ? 'Invoices' : 'Factures' }}</span>&nbsp;&nbsp;
    <a-tooltip :title="translations[language].refresh" :color="'blue'">
      <SyncOutlined class="primary-color" @click="refreshInvoices"/>
    </a-tooltip>
  </ATypographyTitle>
  <Suspense>
    <InvoicesComponent :key="refreshKey"/>
  </Suspense>
</template>

<style scoped>

</style>