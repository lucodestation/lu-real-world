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
      {{
        article.author.follows.includes($store.state.currentUser._id)
          ? '取消关注'
          : '关注'
      }}

      <span class="counter">({{ article.author.follows.length }})</span>
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
      {{
        article.favorites.includes($store.state.currentUser._id)
          ? '取消收藏'
          : '收藏'
      }}
      <span class="counter"> ({{ article.favorites.length }}) </span>
    </button>
  </div>
</template>

<script>
import request from '@/utils/request.js';
import token from '@/utils/token.js';

export default {
  name: 'ArticleMeta',
  props: ['mode', 'article'],
  data() {
    return {
      favoriteLoading: false,
      followLoading: false
    };
  },
  computed: {},
  methods: {
    // 删除文章
    async deleteArticle() {
      await request({
        url: `/articles/${this.$route.params.slug}`,
        method: 'delete',
        headers: { Authorization: token() }
      }).catch((error) => {
        console.log(error);
      });
      this.$router.push('/');
    },
    // 关注/取消关注作者
    async followButton() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/register');
        return;
      }

      this.followLoading = true;

      let method = this.article.author.follows.includes(
        this.$store.state.currentUser._id
      )
        ? 'delete'
        : 'post';

      const user = await request({
        url: `/profiles/${this.article.author.username}/follow`,
        method,
        headers: { Authorization: token() }
      }).catch((error) => {
        console.log(error);
      });

      if (user) {
        const article = await request({
          url: `/articles/${this.article.slug}`
        }).catch((error) => {
          console(error.detail);
        });

        if (article) {
          this.$emit('updateArticle', article.data);
        }
        this.favoriteLoading = false;
      }
    },
    // 收藏/取消收藏文章
    async favoritesButton() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/register');
        return;
      }

      this.favoriteLoading = true;

      let method = this.article.favorites.includes(
        this.$store.state.currentUser._id
      )
        ? 'delete'
        : 'post';

      const article = await request({
        url: `/articles/${this.article.slug}/favorite`,
        method,
        headers: { Authorization: token() }
      }).catch((error) => {
        console.log(error);
      });

      if (article) {
        this.$emit('updateArticle', article.data);
      }
      this.favoriteLoading = false;
    }
  }
};
</script>
