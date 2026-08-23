<script setup lang="ts">
defineProps<{
  retrying: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="news-state news-state--error"
    role="alert"
  >
    <h2 class="news-state__title">
      Не удалось загрузить новости
    </h2>
    <p class="news-state__text">
      Проверьте подключение и попробуйте ещё раз.
    </p>
    <button
      class="news-state__action"
      type="button"
      :disabled="retrying"
      @click="emit('retry')"
    >
      {{ retrying ? 'Обновляем…' : 'Повторить' }}
    </button>
  </section>
</template>
