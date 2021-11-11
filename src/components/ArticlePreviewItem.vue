<template>
  <div class="article-preview">
    <div class="article-meta">
      <router-link :to="`/profile/${currentArticle.author.username}`">
        <!-- 文章作者头像 -->
        <img :src="currentArticle.author.image" />
      </router-link>
      <div class="info">
        <!-- 文章作者用户名 -->
        <router-link :to="`/profile/${currentArticle.author.username}`">
          {{ currentArticle.author.username }}
        </router-link>
        <!-- 文章创建日期 -->
        <span class="date">
          {{ currentArticle.createdAt.substr(0, 10) }}
        </span>
      </div>
      <!-- 收藏按钮 -->
      <ArticleFavoritesButton
        @updateArticle="updateArticle"
        :article="currentArticle"
      />
    </div>
    <router-link :to="`/article/${currentArticle.slug}`" class="preview-link">
      <!-- 文章标题 -->
      <h1>{{ currentArticle.title }}</h1>
      <!-- 文章简介 -->
      <p>{{ currentArticle.description }}</p>
      <span>阅读更多</span>
      <!-- 标签 -->
      <ul class="tag-list">
        <li
          v-for="(tag, index) in currentArticle.tagList"
          :key="index"
          class="tag-default tag-pill tag-outline"
        >
          {{ tag }}
        </li>
      </ul>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ArticlePreviewItem',
  props: ['article'],
  components: {
    ArticleFavoritesButton: () =>
      import('@/components/ArticleFavoritesButton.vue')
  },
  data() {
    return {
      currentArticle: this.article
    };
  },
  mounted() {
    // console.log(this.currentArticle);
  },
  methods: {
    updateArticle(article) {
      // console.log('更新收藏', article);
      this.currentArticle = article;
    }
  }
};
</script>
