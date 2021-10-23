<template>
  <div>
    <ArticleEditor :mode="'create'" />
  </div>
</template>

<script>
export default {
  name: 'ArticleCreate',
  components: {
    ArticleEditor: () => import('@/components/ArticleEditor.vue')
  }
};
</script>
