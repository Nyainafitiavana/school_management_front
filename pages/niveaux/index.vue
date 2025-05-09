<script setup lang="ts">
  definePageMeta({
    layout: 'navbar',
    title: 'Gestion des niveaux',
    middleware: ['user-middleware']
  });
  const activeKey = ref('1');
</script>

<template>
  <Title>Gestion des niveaux</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <BookOutlined/>&nbsp;
    <span>Gestion des niveaux</span>
  </ATypographyTitle>
  <a-tabs v-model:activeKey="activeKey" centered>
    <a-tab-pane key="1" @click="() => activeKey = '1'">
      <template #tab>
        <span>
          <check-circle-filled />
          Actif
        </span>
      </template>
      <Suspense>
        <template #default>
          <LevelComponent v-if="activeKey === '1'"  :active-page="'ACT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
    <a-tab-pane key="2" @click="() => activeKey = '2'">
      <template #tab>
        <span>
          <delete-outlined/>
          Supprimé
        </span>
      </template>
      <Suspense>
        <template #default>
          <LevelComponent v-if="activeKey === '2'" :active-page="'DLT'"/>
        </template>
      </Suspense>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>

</style>