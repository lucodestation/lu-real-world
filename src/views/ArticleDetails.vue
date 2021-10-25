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
          v-if="show"
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
          v-if="show"
          @updateArticle="updateArticle"
          :article="article"
          :mode="mode"
        />
      </div>

      <!-- 评论 -->
      <CommonDisplay v-if="$store.state.isLoggedIn" />

      <p v-else style="text-align: center">
        <router-link to="/login" ui-sref="app.login">登录</router-link> 或
        <router-link to="/register" ui-sref="app.register">注册</router-link>
        来给这篇文章添加评论吧。
      </p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import request from '@/utils/request.js';
import marked from 'marked';

export default {
  components: {
    ArticleMeta: () => import('@/components/ArticleMeta.vue'),
    CommonDisplay: () => import('@/components/CommonDisplay.vue')
  },
  name: 'ArticlePage',
  data() {
    return {
      article: {},
      show: false,
      notFound: false
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
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      // console.log('article', vm.article);
      const article = await request({
        url: `/articles/${vm.$route.params.slug}`
      }).catch((error) => {
        // console.log(error.detail);
        if (error.statusCode === 404) {
          console.error('找不到该文章');
          vm.notFound = true;
        }
      });

      // console.log(article);

      if (article) {
        // console.log('获取文章详情');
        // console.log(article.data);
        Vue.set(vm, 'article', article.data);
        Vue.set(vm, 'show', true);
      }
    });
  },
  methods: {
    // 点击 关注/取消关注 或 收藏/取消收藏 按钮会重新加载文章
    updateArticle(article) {
      // console.log('将要更新文章详情');
      // this.show = false;
      this.article = article;
      // this.show = true;
    }
  }
};
</script>
