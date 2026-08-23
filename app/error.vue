<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const title = computed(() => (
  props.error.statusCode === 404
    ? 'Страница не найдена'
    : 'Что-то пошло не так'
))
</script>

<template>
  <main class="error-page">
    <p class="error-page__code">
      {{ error.statusCode }}
    </p>
    <h1 class="error-page__title">
      {{ title }}
    </h1>
    <p class="error-page__text">
      Вернитесь к списку — свежие новости уже ждут вас там.
    </p>
    <button
      class="error-page__action"
      type="button"
      @click="clearError({ redirect: '/news/1' })"
    >
      К списку новостей
    </button>
  </main>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  width: min(680px, calc(100% - 40px));
  min-height: 100vh;
  margin: 0 auto;
  padding: 80px 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;

  &__code {
    color: $color-primary;
    font-size: 92px;
    font-weight: 700;
    line-height: 1;
  }

  &__title {
    margin-top: 16px;
    font-size: 36px;
  }

  &__text {
    margin-top: 18px;
    font-size: 18px;
  }

  &__action {
    @include interactive-reset;
    margin-top: 32px;
    padding: 14px 22px;
    background: $color-primary;
    color: $color-surface;
    font-weight: 700;
  }
}

@include mobile {
  .error-page {
    &__code {
      font-size: 64px;
    }

    &__title {
      font-size: 24px;
    }

    &__text {
      font-size: 14px;
    }
  }
}
</style>
