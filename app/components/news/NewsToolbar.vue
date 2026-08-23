<script setup lang="ts">
import type { NewsSource, NewsSourceId, NewsViewMode } from '~~/shared/types/news'

defineProps<{
  sources: NewsSource[]
  activeSource: NewsSourceId | null
  viewMode: NewsViewMode
  hasFilters: boolean
}>()

const emit = defineEmits<{
  'select-source': [source: NewsSourceId | null]
  'select-view': [viewMode: NewsViewMode]
  'reset': []
}>()
</script>

<template>
  <div class="news-toolbar">
    <nav
      class="news-toolbar__sources"
      aria-label="Фильтр по источнику"
    >
      <button
        class="news-toolbar__source"
        :class="{ 'news-toolbar__source--active': activeSource === null }"
        type="button"
        :aria-pressed="activeSource === null"
        @click="emit('select-source', null)"
      >
        Все
      </button>
      <button
        v-for="source in sources"
        :key="source.id"
        class="news-toolbar__source"
        :class="{ 'news-toolbar__source--active': activeSource === source.id }"
        type="button"
        :aria-pressed="activeSource === source.id"
        @click="emit('select-source', source.id)"
      >
        {{ source.name }}
      </button>
      <button
        v-if="hasFilters"
        class="news-toolbar__reset"
        type="button"
        @click="emit('reset')"
      >
        Сбросить
      </button>
    </nav>

    <div
      class="news-toolbar__views"
      role="group"
      aria-label="Вид списка новостей"
    >
      <button
        class="news-toolbar__view"
        :class="{ 'news-toolbar__view--active': viewMode === 'list' }"
        type="button"
        :aria-pressed="viewMode === 'list'"
        aria-label="Показать новости списком"
        @click="emit('select-view', 'list')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="3"
            width="20"
            height="8"
          />
          <rect
            x="2"
            y="13"
            width="20"
            height="8"
          />
        </svg>
      </button>
      <button
        class="news-toolbar__view"
        :class="{ 'news-toolbar__view--active': viewMode === 'grid' }"
        type="button"
        :aria-pressed="viewMode === 'grid'"
        aria-label="Показать новости плиткой"
        @click="emit('select-view', 'grid')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="9"
            height="9"
          />
          <rect
            x="13"
            y="2"
            width="9"
            height="9"
          />
          <rect
            x="2"
            y="13"
            width="9"
            height="9"
          />
          <rect
            x="13"
            y="13"
            width="9"
            height="9"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin: 36px 0 34px;

  &__sources,
  &__views {
    display: flex;
    align-items: center;
  }

  &__sources {
    gap: 24px;
  }

  &__source,
  &__reset,
  &__view {
    @include interactive-reset;
  }

  &__source {
    color: $color-primary;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    transition: color $transition-fast;

    &:hover {
      color: $color-text;
    }

    &--active {
      color: $color-text;
      cursor: default;
    }
  }

  &__reset {
    color: #707070;
    font-size: 14px;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: $color-text;
    }
  }

  &__views {
    gap: 10px;
  }

  &__view {
    width: 28px;
    height: 28px;
    color: $color-muted;
    transition: color $transition-fast;

    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    &:hover,
    &--active {
      color: $color-primary;
    }
  }
}

@include mobile {
  .news-toolbar {
    min-height: 20px;
    margin: 16px 0;

    &__sources {
      min-width: 0;
      gap: 18px;
    }

    &__source {
      font-size: 14px;
    }

    &__reset {
      font-size: 12px;
    }

    &__views {
      flex: 0 0 auto;
      gap: 8px;
      margin-left: 12px;
    }

    &__view {
      width: 19px;
      height: 19px;
    }
  }
}

@media (max-width: 390px) {
  .news-toolbar__sources {
    gap: 12px;
  }
}
</style>
