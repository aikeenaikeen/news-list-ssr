<script setup lang="ts">
const route = useRoute()

await navigateTo(
  {
    path: '/news/1',
    query: route.query,
  },
  {
    redirectCode: 302,
    replace: true,
  },
)
</script>

<template>
  <div />
</template>
