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
        <img
          class="news-header__refresh-background"
          src="/icons/refresh-background.svg"
          alt=""
          aria-hidden="true"
        >
        <img
          class="news-header__refresh-icon"
          :class="{ 'news-header__refresh-icon--spinning': refreshing }"
          src="/icons/refresh.svg"
          alt=""
          aria-hidden="true"
        >
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
      <img
        v-else
        class="news-header__search-icon"
        src="/icons/search.svg"
        alt=""
        aria-hidden="true"
      >
    </form>
  </header>
</template>

<style scoped lang="scss">
.news-header {
  position: relative;
  height: 78px;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    background: $color-divider;
    content: '';
  }

  &__brand {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: flex-start;
    min-width: 0;
  }

  &__title {
    font-size: 36px;
    font-weight: 700;
    line-height: normal;
    white-space: nowrap;
  }

  &__refresh {
    @include interactive-reset;
    position: relative;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    margin-left: 30px;
    border-radius: 50%;
    transition: transform $transition-fast;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.72;
    }
  }

  &__refresh-background {
    position: absolute;
    top: -3px;
    left: -4px;
    width: 48px;
    height: 49px;
    pointer-events: none;
  }

  &__refresh-icon {
    position: absolute;
    top: 12px;
    left: 10px;
    width: 20px;
    height: 16px;
    transform-origin: center;
    pointer-events: none;

    &--spinning {
      animation: refresh-rotate 900ms linear infinite;
    }
  }

  &__search {
    position: absolute;
    top: 1px;
    right: 0;
    width: 321px;
    height: 40px;
    border-radius: 3px;
    background: $color-surface;
    box-shadow: $shadow-control;

    &:focus-within {
      outline: 3px solid $color-focus;
      outline-offset: -3px;
      box-shadow: none;
    }
  }

  &__search-input {
    width: 100%;
    height: 100%;
    padding: 0 45px 0 14px;
    border: 0;
    border-radius: 3px;
    outline: 0;
    appearance: none;
    background: transparent;
    color: $color-text;
    font-size: 14px;

    &:focus-visible {
      outline: 0;
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__search-icon,
  &__search-clear {
    position: absolute;
    top: 10px;
    right: 13px;
    width: 20px;
    height: 20px;
  }

  &__search-icon {
    pointer-events: none;
  }

  &__search-clear {
    @include interactive-reset;
    display: grid;
    place-items: center;
    color: $color-muted;

    svg {
      width: 18px;
      height: 18px;
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

@keyframes refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}

@include mobile {
  .news-header {
    height: 124px;

    &::after {
      left: 2px;
    }

    &__brand {
      right: 0;
      justify-content: space-between;
    }

    &__title {
      margin-top: 9px;
      font-size: 24px;
    }

    &__refresh {
      margin-left: 0;
    }

    &__search {
      top: 60px;
      width: 100%;
    }
  }
}
</style>
