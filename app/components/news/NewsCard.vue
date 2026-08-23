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
        width="400"
        height="200"
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
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 3px;
  background: $color-surface;

  &__content {
    min-width: 0;
  }

  &__title {
    color: $color-primary;
    font-size: 18px;
    font-weight: 700;
    line-height: 22px;
    overflow-wrap: break-word;
  }

  &__title-link {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__description {
    color: $color-text;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: break-word;
  }

  &__details,
  &__source {
    color: inherit;
    text-underline-offset: auto;
  }

  &__details {
    color: $color-primary;
    font-size: 14px;
    line-height: 20px;
  }

  &__footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;
    color: $color-meta;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }

  &__source {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__date {
    flex: 0 0 auto;
    margin-left: 18px;
  }

  &__media {
    overflow: hidden;
    background: $color-surface-subtle;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--grid {
    @include card-shadow($shadow-card-grid);
    height: 256px;

    .news-card__title,
    .news-card__description,
    .news-card__details,
    .news-card__footer {
      position: absolute;
      right: 31px;
      left: 30px;
    }

    .news-card__title {
      @include line-clamp(3);
      top: 30px;
    }

    .news-card__description {
      @include line-clamp(2);
      top: 121px;
    }

    .news-card__details {
      top: 181px;
      width: fit-content;
    }

    .news-card__footer {
      top: 220px;
      height: 20px;
    }
  }

  &--list {
    @include card-shadow;
    height: 189px;

    .news-card__media {
      position: absolute;
      top: 30px;
      left: 30px;
      width: 200px;
      height: 100px;
    }

    .news-card__title,
    .news-card__description {
      position: absolute;
      right: 28px;
      left: 260px;
    }

    .news-card__title {
      @include line-clamp(2);
      top: 30px;
    }

    .news-card__description {
      @include line-clamp(2);
      top: 94px;
    }

    .news-card__details {
      display: none;
    }

    .news-card__footer {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 28px;
      padding: 4px 30px;
      background: $color-surface-subtle;
    }

    &.news-card--without-image {
      .news-card__title,
      .news-card__description {
        left: 30px;
      }
    }
  }
}

@include mobile {
  .news-card {
    display: flex;
    height: auto;
    flex-direction: column;

    &__title,
    &__description,
    &__details,
    &__footer,
    &__media {
      position: static;
    }

    &__footer {
      flex: 0 0 auto;
      width: auto;
      height: 28px;
      padding-top: 4px;
      padding-bottom: 4px;
      background: $color-surface-subtle;
    }

    &--grid {
      min-height: 256px;
      padding: 30px 23px 0 22px;

      .news-card__title,
      .news-card__description,
      .news-card__details,
      .news-card__footer {
        position: static;
      }

      .news-card__title {
        @include line-clamp(4);
      }

      .news-card__description {
        @include line-clamp(3);
        margin-top: 20px;
      }

      .news-card__details {
        display: block;
        width: fit-content;
        margin-top: 20px;
        margin-bottom: 12px;
      }

      .news-card__footer {
        height: 28px;
        margin: auto -23px 0 -22px;
        padding-right: 23px;
        padding-left: 22px;
      }
    }

    &--list,
    &--list.news-card--without-image {
      min-height: 0;
      padding: 20px 23px 0 22px;

      .news-card__media {
        position: static;
        width: calc(100% + 1px);
        height: auto;
        aspect-ratio: 338 / 166;
        margin-bottom: 20px;
      }

      .news-card__title,
      .news-card__description {
        position: static;
      }

      .news-card__title {
        @include line-clamp(4);
      }

      .news-card__description {
        @include line-clamp(3);
        margin-top: 20px;
      }

      .news-card__details {
        display: block;
        width: fit-content;
        margin-top: 20px;
        margin-bottom: 15px;
      }

      .news-card__footer {
        position: static;
        margin: auto -23px 0 -22px;
        padding-right: 23px;
        padding-left: 22px;
      }
    }
  }
}
</style>
