<script setup lang="ts">
defineProps<{
  filtered: boolean
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <section
    class="news-state"
    aria-live="polite"
  >
    <h2 class="news-state__title">
      Новости не найдены
    </h2>
    <p class="news-state__text">
      {{ filtered
        ? 'Попробуйте изменить запрос или сбросить фильтры.'
        : 'В источниках пока нет доступных публикаций.' }}
    </p>
    <button
      v-if="filtered"
      class="news-state__action"
      type="button"
      @click="emit('reset')"
    >
      Сбросить фильтры
    </button>
  </section>
</template>
