<script setup lang="ts">
import ExpensesComponent from "~/components/ExpensesComponent.vue";
import {translations} from "~/composables/translations";

definePageMeta({
  layout: 'navbar',
  title: 'Expenses',
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
  <Title>{{translations[language].expenses}}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <WalletOutlined/>&nbsp;
    <span>{{translations[language].expenses}}</span>&nbsp;&nbsp;
    <a-tooltip :title="translations[language].refresh" :color="'blue'">
      <SyncOutlined class="primary-color" @click="refresh"/>
    </a-tooltip>
  </ATypographyTitle>
  <a-tabs v-model:activeKey="activeKey" centered :key="refreshKey">
    <a-tab-pane key="1" @click="() => activeKey = '1'">
      <template #tab>
        <span>
          <check-circle-filled />
          {{translations[language].active}}
        </span>
      </template>
      <Suspense>
        <template #default>
          <ExpensesComponent v-if="activeKey === '1'"  :active-page="'ACT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
    <a-tab-pane key="2" @click="() => activeKey = '2'">
      <template #tab>
        <span>
          <delete-outlined/>
          {{translations[language].deleted}}
        </span>
      </template>
      <Suspense>
        <template #default>
          <ExpensesComponent v-if="activeKey === '2'" :active-page="'DLT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>

</style>