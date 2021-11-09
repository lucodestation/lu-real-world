<template>
  <div class="row">
    <div class="col-xs-12 col-md-8 offset-md-2">
      <!-- 评论表单 -->
      <form v-if="$store.state.isLoggedIn" class="card comment-form">
        <div class="card-block">
          <textarea
            v-model="body"
            class="form-control"
            placeholder="请输入评论内容..."
            rows="3"
          ></textarea>
        </div>
        <div class="card-footer">
          <!-- 头像 -->
          <img
            :src="$store.state.currentUser.image"
            class="comment-author-img"
          />
          <button
            @click="addComment"
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="body.trim().length === 0 || loading"
          >
            发表评论
            <i v-show="loading" class="ion-load-a"></i>
          </button>
        </div>
      </form>

      <!-- 评论列表 -->
      <div v-for="(comment, index) in comments" :key="index" class="card">
        <!-- 评论内容 -->
        <div class="card-block">
          <p class="card-text">{{ comment.body }}</p>
        </div>

        <div class="card-footer">
          <!-- 评论者头像 -->
          <router-link
            to="/profile/comment.author.username"
            class="comment-author"
          >
            <img :src="comment.author.image" class="comment-author-img" />
          </router-link>
          &nbsp;
          <!-- 评论者用户名 -->
          <router-link
            to="/profile/comment.author.username"
            class="comment-author"
            >{{ comment.author.username }}</router-link
          >
          <!-- 评论日期 -->
          <span class="date-posted">{{ comment.createdAt.substr(0, 10) }}</span>

          <!-- 删除评论 -->
          <span
            @click="deleteComment(comment.id)"
            v-if="comment.author.username === $store.state.currentUser.username"
            class="mod-options"
          >
            <i class="ion-trash-a"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js';

export default {
  name: 'CommonDisplay',
  data() {
    return {
      comments: [],
      body: '',
      loading: false
    };
  },
  methods: {
    // 发表评论
    async addComment() {
      // 显示加载图标
      this.loading = true;

      const comment = await api.createComment(
        this.$route.params.slug,
        this.body
      );

      if (comment) {
        this.loadComments();
        this.body = '';
      }

      // 隐藏加载图标
      this.loading = false;
    },
    // 删除评论
    async deleteComment(id) {
      await api.deleteComment(this.$route.params.slug, id);

      this.loadComments();
    },
    // 加载评论
    async loadComments() {
      const comments = await api.getComments(this.$route.params.slug);

      if (comments) {
        this.comments = comments.data;
      }
    }
  },
  mounted() {
    this.loadComments();
  }
};
</script>
