<script setup lang="ts">
import type { NewsItem, NewsViewMode } from '~~/shared/types/news'
import { formatNewsDate, sourceHost } from '~~/shared/utils/news'

const props = defineProps<{
  item: NewsItem
  viewMode: NewsViewMode
}>()

const imageFailed = ref(false)
const formattedDate = computed(() => formatNewsDate(props.item.publishedAt))
const hostname = computed(() => sourceHost(props.item.source.homepage))
const showImage = computed(() => (
  props.viewMode === 'list'
  && Boolean(props.item.imageUrl)
  && !imageFailed.value
))

watch(() => props.item.id, () => {
  imageFailed.value = false
})
</script>

<template>
  <article
    class="news-card"
    :class="[
      `news-card--${viewMode}`,
      { 'news-card--without-image': !showImage },
    ]"
  >
    <div
      v-if="showImage"
      class="news-card__media"
    >
      <img
        class="news-card__image"
        :src="item.imageUrl!"
        alt=""
        width="480"
        height="240"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="imageFailed = true"
      >
    </div>

    <div class="news-card__content">
      <h2 class="news-card__title">
        <a
          class="news-card__title-link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.title }}
        </a>
      </h2>

      <p
        v-if="item.description"
        class="news-card__description"
      >
        {{ item.description }}
      </p>

      <a
        class="news-card__details"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        Подробнее<span class="visually-hidden">: {{ item.title }}</span>
      </a>
    </div>

    <footer class="news-card__footer">
      <a
        class="news-card__source"
        :href="item.source.homepage"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Перейти на сайт ${item.source.name}`"
      >
        www.{{ hostname }}
      </a>
      <time
        v-if="formattedDate"
        class="news-card__date"
        :datetime="item.publishedAt ?? undefined"
      >
        {{ formattedDate }}
      </time>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.news-card {
  @include card-shadow;
  min-width: 0;
  overflow: hidden;
  background: $color-surface;

  &__content {
    min-width: 0;
  }

  &__title {
    color: $color-primary;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.23;
  }

  &__title-link {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  &__description {
    color: $color-text;
    font-size: 20px;
    line-height: 1.45;
  }

  &__details {
    width: fit-content;
    color: $color-primary;
    font-size: 20px;
    line-height: 1.2;
    text-underline-offset: 2px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    height: 40px;
    margin: 0 -40px;
    padding: 0 40px;
    background: $color-surface-subtle;
    color: $color-meta;
    font-size: 20px;
    line-height: 1;
  }

  &__source {
    overflow: hidden;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-underline-offset: 2px;
  }

  &__date {
    flex: 0 0 auto;
    margin-left: 18px;
  }

  &__media {
    min-width: 0;
    overflow: hidden;
    background: $color-surface-subtle;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--grid {
    display: grid;
    grid-template-rows: minmax(0, 1fr) 40px;
    min-height: 368px;
    padding: 40px 40px 0;

    .news-card__content {
      display: flex;
      flex-direction: column;
      padding-bottom: 28px;
    }

    .news-card__title {
      @include line-clamp(3);
    }

    .news-card__description {
      @include line-clamp(2);
      margin-top: 34px;
    }

    .news-card__details {
      margin-top: auto;
      padding-top: 24px;
    }
  }

  &--list {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    grid-template-rows: minmax(140px, auto) 40px;
    column-gap: 40px;
    min-height: 272px;
    padding: 40px 40px 0;

    .news-card__media {
      width: 280px;
      height: 140px;
    }

    .news-card__title {
      @include line-clamp(2);
    }

    .news-card__description {
      @include line-clamp(2);
      margin-top: 25px;
    }

    .news-card__details {
      display: none;
    }

    .news-card__footer {
      grid-column: 1 / -1;
    }

    &.news-card--without-image {
      grid-template-columns: minmax(0, 1fr);

      .news-card__content {
        grid-column: 1 / -1;
      }
    }
  }
}

@include mobile {
  .news-card {
    padding-right: 20px;
    padding-left: 20px;

    &__title {
      font-size: 17px;
      line-height: 1.17;
    }

    &__description {
      font-size: 14px;
      line-height: 1.42;
    }

    &__details {
      font-size: 14px;
    }

    &__footer {
      height: 32px;
      margin: 0 -20px;
      padding: 0 20px;
      font-size: 14px;
    }

    &--grid {
      grid-template-rows: minmax(0, 1fr) 32px;
      min-height: 240px;
      padding-top: 32px;

      .news-card__content {
        padding-bottom: 16px;
      }

      .news-card__title {
        @include line-clamp(4);
      }

      .news-card__description {
        @include line-clamp(3);
        margin-top: 22px;
      }

      .news-card__details {
        padding-top: 20px;
      }
    }

    &--list,
    &--list.news-card--without-image {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto 32px;
      min-height: 0;
      padding-top: 16px;

      .news-card__media {
        grid-row: auto;
        width: 100%;
        height: auto;
        aspect-ratio: 2 / 1;
        margin-bottom: 16px;
      }

      .news-card__content {
        display: flex;
        grid-column: 1;
        flex-direction: column;
        padding-bottom: 16px;
      }

      .news-card__title {
        @include line-clamp(4);
      }

      .news-card__description {
        @include line-clamp(3);
        margin-top: 20px;
      }

      .news-card__details {
        display: inline;
        margin-top: 16px;
      }

      .news-card__footer {
        grid-column: 1;
      }
    }
  }
}
</style>
