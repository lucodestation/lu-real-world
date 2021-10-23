<template>
  <div>
    <ArticleEditor :mode="'editor'" />
  </div>
</template>

<script>
export default {
  name: 'EditorArticle',
  components: {
    ArticleEditor: () => import('@/components/ArticleEditor.vue')
  }
};
</script>
