<script setup lang="ts">
import StockSituation from "~/components/Inventory/stockSituation.vue";
import {translations} from "~/composables/translations";

definePageMeta({
  layout: 'navbar',
  title: 'Stock situation',
  middleware: ['user-middleware', 'admin-middleware']
});

//This is a global state for language of the app
const language = useLanguage();
const activeKey = ref('1');

// State to control re-rendering of the component
const refreshKey = ref(0);

// Refresh function
const refresh = () => {
  refreshKey.value++; // Increment the key to trigger component re-mount
};
</script>

<template>
  <Title>{{ translations[language].stockSituation }}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <StockOutlined/>&nbsp;
    <span>{{ translations[language].stockSituation }}</span>&nbsp;&nbsp;
    <a-tooltip :title="translations[language].refresh" :color="'blue'">
      <SyncOutlined class="primary-color" @click="refresh"/>
    </a-tooltip>
  </ATypographyTitle>
  <a-tabs v-model:activeKey="activeKey" centered :key="refreshKey">
    <!--Outstanding tab-->
    <a-tab-pane key="1" @click="() => activeKey = '1'">
      <template #tab>
        <span>
          <HistoryOutlined />
          {{ translations[language].summarize }}
        </span>
      </template>
      <Suspense>
        <template #default>
          <StockSituation v-if="activeKey === '1'"  :active-page="'SUMMARIZE'"/>
        </template>
      </Suspense>
    </a-tab-pane>
    <!--Stock input and output tab-->
    <a-tab-pane key="2" @click="() => activeKey = '2'">
      <template #tab>
        <span>
          <CaretDownOutlined />
          {{ translations[language].input }}
          <CaretUpOutlined />
          {{ translations[language].output }}
        </span>
      </template>
      <Suspense>
        <template #default>
          <StockSituation v-if="activeKey === '2'"  :active-page="'STOCK_INPUT_OUTPUT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>

</style>