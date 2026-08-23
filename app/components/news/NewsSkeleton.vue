<template>
  <div
    class="news-skeleton"
    aria-label="Загружаем новости"
    role="status"
  >
    <div
      v-for="item in 4"
      :key="item"
      class="news-skeleton__card"
    >
      <span class="news-skeleton__line news-skeleton__line--title" />
      <span class="news-skeleton__line" />
      <span class="news-skeleton__line news-skeleton__line--short" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-skeleton {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;

  &__card {
    @include card-shadow;
    display: flex;
    min-height: 368px;
    padding: 40px;
    flex-direction: column;
    gap: 18px;
    background: $color-surface;
  }

  &__line {
    width: 100%;
    height: 18px;
    background: linear-gradient(90deg, #eeeeee 25%, #f8f8f8 50%, #eeeeee 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.3s infinite linear;

    &--title {
      width: 84%;
      height: 28px;
      margin-bottom: 22px;
    }

    &--short {
      width: 65%;
    }
  }
}

@keyframes skeleton-shimmer {
  to {
    background-position: -200% 0;
  }
}

@include mobile {
  .news-skeleton {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;

    &__card {
      min-height: 240px;
      padding: 28px 20px;
    }
  }
}
</style>
