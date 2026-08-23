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
  <div
    class="news-toolbar"
    :class="`news-toolbar--${viewMode}`"
  >
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
        class="news-toolbar__view news-toolbar__view--list"
        :class="{ 'news-toolbar__view--active': viewMode === 'list' }"
        type="button"
        :aria-pressed="viewMode === 'list'"
        aria-label="Показать новости списком"
        @click="emit('select-view', 'list')"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <button
        class="news-toolbar__view news-toolbar__view--grid"
        :class="{ 'news-toolbar__view--active': viewMode === 'grid' }"
        type="button"
        :aria-pressed="viewMode === 'grid'"
        aria-label="Показать новости плиткой"
        @click="emit('select-view', 'grid')"
      >
        <span
          v-for="part in 4"
          :key="part"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 18px;
  margin: 25px 0 27px;

  &__sources,
  &__views {
    display: flex;
    align-items: center;
  }

  &__sources {
    gap: 16px;
    min-width: 0;
  }

  &__source,
  &__reset,
  &__view {
    @include interactive-reset;
  }

  &__source {
    color: $color-primary;
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
    white-space: nowrap;
    transition: color $transition-fast;

    &:hover {
      color: $color-text;
    }

    &--active {
      color: $color-text;
    }
  }

  &__reset {
    color: #707070;
    font-size: 12px;
    line-height: normal;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: $color-text;
    }
  }

  &__views {
    flex: 0 0 auto;
    gap: 10px;
  }

  &__view {
    display: grid;
    width: 18px;
    height: 18px;
    color: $color-muted;
    transition: color $transition-fast;

    span {
      background: currentColor;
    }

    &:hover,
    &--active {
      color: $color-primary;
    }

    &--list {
      grid-template-rows: repeat(2, 8px);
      gap: 2px;
    }

    &--grid {
      grid-template: repeat(2, 8px) / repeat(2, 8px);
      gap: 2px;
    }
  }

  &--list .news-toolbar__sources {
    transform: translateY(3px);
  }
}

@include mobile {
  .news-toolbar {
    margin: 19px 0 17px 2px;

    &__sources {
      gap: 16px;
    }

    &__views {
      margin-left: 12px;
    }

    &--list {
      margin-top: 18px;
      margin-bottom: 18px;
    }

    &--list .news-toolbar__sources {
      transform: none;
    }
  }
}

@media (max-width: 390px) {
  .news-toolbar__sources {
    gap: 12px;
  }
}
</style>
