<script setup lang="ts">
  interface Props {
    isLoading: boolean;
    size: 'small' | 'default' | 'large';
  }

  const props = defineProps<Props>();
</script>

<template>
  <a-row v-if="props.isLoading">
    <a-col class="flex justify-center items-center" style="height: 500px;" span="24">
      <a-spin tip="Loading..." :size="props.size"></a-spin>
    </a-col>
  </a-row>
</template>

<style scoped>
  .count {
    font-size: 2em;
    animation: fadeIn 1s ease-in-out infinite alternate;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>