<template>
  <div class="article-meta">
    <!-- 文章作者头像 -->
    <router-link :to="`/profile/${article.author.username}`">
      <img :src="article.author.image" />
    </router-link>

    <div class="info">
      <!-- 文章作者 -->
      <router-link :to="`/profile/${article.author.username}`" class="author">
        {{ article.author.username }}
      </router-link>

      <!-- 文章创建时间 -->
      <span class="date">{{ article.createdAt.substr(0, 10) }}</span>
    </div>

    <!-- 编辑文章 -->
    <router-link
      v-if="mode === 'myself'"
      :to="`/editor/${$route.params.slug}`"
      class="btn btn-sm btn-outline-secondary"
    >
      <i class="ion-edit"></i>
      &nbsp; 编辑文章
    </router-link>

    <button
      v-if="mode === 'other'"
      @click="followButton"
      class="btn btn-sm btn-outline-secondary"
    >
      <i class="ion-plus-round"></i>
      &nbsp;
      {{ article.author.following ? '取消关注' : '关注' }}
    </button>

    &nbsp;&nbsp;

    <button
      v-if="mode === 'myself'"
      @click="deleteArticle"
      class="btn btn-outline-danger btn-sm"
    >
      <i class="ion-trash-a"></i>
      &nbsp; 删除文章
    </button>

    <button
      v-if="mode === 'other'"
      @click="favoritesButton"
      class="btn btn-sm btn-outline-primary"
      :class="{ disabled: favoriteLoading }"
    >
      <i class="ion-heart"></i>
      &nbsp;
      {{ article.favorited ? '取消收藏' : '收藏' }}
      <span class="counter"> ({{ article.favoritesCount }}) </span>
    </button>
  </div>
</template>

<script>
import api from '@/utils/api.js';

export default {
  name: 'ArticleMeta',
  props: ['mode', 'article'],
  data() {
    return {
      favoriteLoading: false,
      followLoading: false
    };
  },
  methods: {
    // 删除文章
    async deleteArticle() {
      await api.deleteArticle(this.$route.params.slug);

      // 返回首页
      this.$router.push('/');
    },
    // 关注/取消关注作者
    async followButton() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/register');
        return;
      }

      this.followLoading = true;

      // 判断是关注还是取消关注
      const prop = this.article.author.following
        ? 'deleteFollowUser'
        : 'followUser';

      const user = await api[prop](this.article.author.username);

      if (user) {
        const article = await api.getArticle(this.article.slug);

        if (article) {
          this.$emit('updateArticle', article.data);
        }
      }

      this.favoriteLoading = false;
    },
    // 收藏/取消收藏文章
    async favoritesButton() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/register');
        return;
      }

      this.favoriteLoading = true;

      // 判断是收藏还是取消收藏
      const prop = this.article.favorited
        ? 'deleteFavoriteArticle'
        : 'favoriteArticle';

      const article = await api[prop](this.article.slug);

      if (article) {
        this.$emit('updateArticle', article.data);
      }

      this.favoriteLoading = false;
    }
  }
};
</script>
