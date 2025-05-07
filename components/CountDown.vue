<script setup lang="ts">
  interface Props {
    limit: number;
  }

  const props = defineProps<Props>();

  const displayCount = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const animateCountdown = () => {
    let currentCount = 0;
    const stepTime = 0.1; // 0.1 millisecond

    const incrementCount = () => {
      if (currentCount < props.limit) {
        currentCount++;
        displayCount.value = currentCount;
      } else {
        if (timer !== null) {
          clearInterval(timer);
        }
      }
    };

    timer = setInterval(incrementCount, stepTime);
  };

  onMounted(() => {
    animateCountdown();
  });

  onBeforeUnmount(() => {
    if (timer !== null) {
      clearInterval(timer);
    }
  });
</script>

<template>
  <AStatistic title="Sales Daily" :value="displayCount"></AStatistic>
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