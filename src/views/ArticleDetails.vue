<template>
  <div class="article-page">
    <div class="banner">
      <div class="container">
        <!-- 文章标题 -->
        <h1>{{ article.title }}</h1>

        <div v-if="notFound" style="text-align: center">
          <h1>404 NOT FOUND</h1>
          <br />
          <h5>该文章不存在 | 返回 <router-link to="/">首页</router-link></h5>
        </div>

        <!-- 文章作者 -->
        <ArticleMeta
          v-if="!notFound"
          @updateArticle="updateArticle"
          :article="article"
          :mode="mode"
        />
      </div>
    </div>

    <div class="container page">
      <div class="row article-content">
        <!-- 文章内容 -->
        <div v-html="articleBody" class="col-md-12"></div>

        <!-- 标签 -->
        <ul class="tag-list">
          <li
            v-for="(tag, index) in article.tagList"
            :key="index"
            class="tag-default tag-pill tag-outline"
          >
            {{ tag }}
          </li>
        </ul>
      </div>

      <hr />

      <div class="article-actions">
        <!-- 文章作者 -->
        <ArticleMeta
          v-if="!notFound"
          @updateArticle="updateArticle"
          :article="article"
          :mode="mode"
        />
      </div>

      <p v-if="!$store.state.isLoggedIn" style="text-align: center">
        <router-link to="/login" ui-sref="app.login">登录</router-link> 或
        <router-link to="/register" ui-sref="app.register">注册</router-link>
        来给这篇文章添加评论吧。
      </p>

      <!-- 评论 -->
      <!-- <CommonDisplay v-if="$store.state.isLoggedIn" /> -->
      <CommonDisplay />
    </div>
  </div>
</template>

<script>
import marked from 'marked';
import api from '@/utils/api.js';

export default {
  components: {
    ArticleMeta: () => import('@/components/ArticleMeta.vue'),
    CommonDisplay: () => import('@/components/CommonDisplay.vue')
  },
  name: 'ArticlePage',
  data() {
    return {
      article: {},
      notFound: true
    };
  },
  computed: {
    mode() {
      if (
        this.article.author &&
        this.article.author.username === this.$store.state.currentUser.username
      ) {
        return 'myself';
      }

      return 'other';
    },
    articleBody() {
      if (this.article.body) {
        return marked(this.article.body);
      }
    }
  },
  async created() {
    const article = await api.getArticle(this.$route.params.slug);

    if (article) {
      this.article = article.data;
      this.notFound = false;
    }
  },
  methods: {
    // 点击 关注/取消关注 或 收藏/取消收藏 按钮会重新加载文章
    updateArticle(article) {
      this.article = article;
    }
  }
};
</script>
