<script setup lang="ts">

  import UnitComponent from "~/components/settings/UnitComponent.vue";

  definePageMeta({
    layout: 'navbar',
    title: 'Unit',
    middleware: ['user-middleware', 'admin-middleware']
  });

  //This is a global state for language of the app
  const language = useLanguage();
  const activeKey = ref('1');
</script>

<template>
  <Title>{{translations[language].unit}}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <AppstoreAddOutlined />&nbsp;
    <span>{{translations[language].unit}}</span>
  </ATypographyTitle>
  <a-tabs v-model:activeKey="activeKey" centered>
    <a-tab-pane key="1" @click="() => activeKey = '1'">
      <template #tab>
        <span>
          <check-circle-filled />
          {{translations[language].active}}
        </span>
      </template>
      <Suspense>
        <template #default>
          <UnitComponent v-if="activeKey === '1'"  :active-page="'ACT'"/>
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
          <UnitComponent v-if="activeKey === '2'" :active-page="'DLT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>

</style>