<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  refreshing: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [value: string]
  'refresh': []
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clearSearch() {
  emit('update:modelValue', '')
  emit('submit', '')
}
</script>

<template>
  <header class="news-header">
    <div class="news-header__brand">
      <h1 class="news-header__title">
        Список новостей
      </h1>

      <button
        class="news-header__refresh"
        type="button"
        :disabled="refreshing"
        :aria-label="refreshing ? 'Обновляем список новостей' : 'Обновить список новостей'"
        @click="emit('refresh')"
      >
        <svg
          class="news-header__refresh-icon"
          :class="{ 'news-header__refresh-icon--spinning': refreshing }"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.6 8.1A7.5 7.5 0 0 0 5.2 7L3 9.2V4h5.2L6.6 5.6a9.6 9.6 0 0 1 16.3 4.2l-2.1.7a7.4 7.4 0 0 0-2.2-2.4Z" />
          <path d="M5.4 15.9A7.5 7.5 0 0 0 18.8 17l2.2-2.2V20h-5.2l1.6-1.6A9.6 9.6 0 0 1 1.1 14.2l2.1-.7a7.4 7.4 0 0 0 2.2 2.4Z" />
        </svg>
      </button>
    </div>

    <form
      class="news-header__search"
      role="search"
      @submit.prevent="emit('submit', props.modelValue)"
    >
      <label
        class="visually-hidden"
        for="news-search"
      >
        Поиск по названию и содержанию новостей
      </label>
      <input
        id="news-search"
        class="news-header__search-input"
        name="q"
        type="search"
        autocomplete="off"
        :value="modelValue"
        @input="onInput"
      >
      <button
        v-if="modelValue"
        class="news-header__search-clear"
        type="button"
        aria-label="Очистить поиск"
        @click="clearSearch"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <svg
        v-else
        class="news-header__search-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="10.5"
          cy="10.5"
          r="6.5"
        />
        <path d="m15.5 15.5 5 5" />
      </svg>
    </form>
  </header>
</template>

<style scoped lang="scss">
.news-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 30.3%);
  align-items: center;
  gap: 48px;
  padding-bottom: 56px;
  border-bottom: 1px solid $color-divider;

  &__brand {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__title {
    font-size: clamp(38px, 2.5vw, 50px);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: 0.015em;
  }

  &__refresh {
    @include interactive-reset;
    display: grid;
    flex: 0 0 auto;
    width: 56px;
    height: 56px;
    margin-left: 42px;
    place-items: center;
    border-radius: 50%;
    background: $color-surface;
    color: $color-primary;
    box-shadow: $shadow-control;
    transition: transform $transition-fast, box-shadow $transition-fast;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.13);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.72;
    }
  }

  &__refresh-icon {
    width: 25px;
    height: 25px;
    fill: currentColor;

    &--spinning {
      animation: refresh-rotate 900ms linear infinite;
    }
  }

  &__search {
    position: relative;
    width: 100%;
    height: 56px;
    background: $color-surface;
    box-shadow: $shadow-control;

    &:focus-within {
      outline: 4px solid $color-focus;
      outline-offset: 0;
      box-shadow: none;
    }
  }

  &__search-input {
    width: 100%;
    height: 100%;
    padding: 0 58px 0 18px;
    border: 0;
    border-radius: 0;
    outline: 0;
    background: transparent;
    color: $color-text;
    font-size: 18px;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__search-icon,
  &__search-clear {
    position: absolute;
    top: 50%;
    right: 17px;
    width: 28px;
    height: 28px;
    transform: translateY(-50%);
  }

  &__search-icon {
    fill: none;
    stroke: $color-meta;
    stroke-linecap: round;
    stroke-width: 2;
    pointer-events: none;
  }

  &__search-clear {
    @include interactive-reset;
    display: grid;
    place-items: center;
    color: $color-muted;

    svg {
      width: 21px;
      height: 21px;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-width: 2;
    }

    &:hover {
      color: $color-text;
    }
  }
}

@media (min-width: 768px) and (max-width: 900px) {
  .news-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;

    &__search {
      width: min(100%, 460px);
      margin-left: auto;
    }
  }
}

@keyframes refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}

@include mobile {
  .news-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    padding-bottom: 20px;

    &__brand {
      justify-content: space-between;
    }

    &__title {
      font-size: 22px;
      line-height: 1.15;
      letter-spacing: 0;
    }

    &__refresh {
      width: 36px;
      height: 36px;
      margin-left: 18px;
    }

    &__refresh-icon {
      width: 16px;
      height: 16px;
    }

    &__search {
      height: 40px;
    }

    &__search-input {
      padding: 0 44px 0 12px;
      font-size: 14px;
    }

    &__search-icon,
    &__search-clear {
      right: 10px;
      width: 22px;
      height: 22px;
    }
  }
}
</style>
