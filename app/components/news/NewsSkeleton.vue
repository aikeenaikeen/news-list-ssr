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
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: 20px;

  &__card {
    @include card-shadow($shadow-card-grid);
    display: flex;
    min-height: 256px;
    padding: 30px;
    border-radius: 3px;
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
    gap: 20px;

    &__card {
      min-height: 256px;
      padding: 30px 22px;
    }
  }
}
</style>
