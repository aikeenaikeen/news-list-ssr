<script setup lang="ts">
import { createPagination } from '~~/shared/utils/pagination'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const route = useRoute()
const tokens = computed(() => createPagination(props.currentPage, props.totalPages))

function pageLocation(page: number) {
  return {
    path: `/news/${page}`,
    query: route.query,
  }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="news-pagination"
    aria-label="Постраничная навигация"
  >
    <template
      v-for="token in tokens"
      :key="token"
    >
      <span
        v-if="typeof token === 'string'"
        class="news-pagination__ellipsis"
        aria-hidden="true"
      >
        ...
      </span>
      <span
        v-else-if="token === currentPage"
        class="news-pagination__link news-pagination__link--active"
        aria-current="page"
      >
        <span class="visually-hidden">Страница </span>{{ token }}
      </span>
      <NuxtLink
        v-else
        class="news-pagination__link"
        :to="pageLocation(token)"
      >
        <span class="visually-hidden">Страница </span>{{ token }}
      </NuxtLink>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.news-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
  font-size: 18px;
  font-weight: 700;
  line-height: normal;

  &__link {
    color: $color-text;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover,
    &--active {
      color: $color-primary;
    }
  }

  &__ellipsis {
    letter-spacing: 0;
  }
}

@include mobile {
  .news-pagination {
    gap: 20px;
    margin-top: 50px;
    font-size: 18px;
  }
}

@media (max-width: 370px) {
  .news-pagination {
    gap: 17px;
  }
}
</style>
