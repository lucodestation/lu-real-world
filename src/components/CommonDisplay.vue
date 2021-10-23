<template>
  <div class="row">
    <div class="col-xs-12 col-md-8 offset-md-2">
      <!-- 评论表单 -->
      <form v-if="$store.state.isLoggedIn" class="card comment-form">
        <div class="card-block">
          <textarea
            v-model="commentContent"
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
            :disabled="commentContent.trim().length === 0 || loading"
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
          <p class="card-text">{{ comment.comment }}</p>
        </div>

        <div class="card-footer">
          <!-- 评论者头像 -->
          <a href="" class="comment-author">
            <img :src="comment.author.image" class="comment-author-img" />
          </a>
          &nbsp;
          <!-- 评论者用户名 -->
          <a href="" class="comment-author">{{ comment.author.username }}</a>
          <!-- 评论日期 -->
          <span class="date-posted">{{ comment.createdAt.substr(0, 10) }}</span>

          <!-- 删除评论 -->
          <span
            @click="deleteComment"
            v-if="comment.author._id === $store.state.currentUser._id"
            class="mod-options"
          >
            <i :data-comment="comment._id" class="ion-trash-a"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request.js';

import token from '@/utils/token.js';

export default {
  name: 'CommonDisplay',
  data() {
    return {
      comments: [],
      commentContent: '',
      loading: false
    };
  },
  methods: {
    // 发表评论
    async addComment() {
      this.loading = true;

      const comment = await request({
        url: `/articles/${this.$route.params.slug}/comments`,
        method: 'post',
        headers: { Authorization: token() },
        data: { comment: this.commentContent }
      }).catch((error) => {
        console.log(error);
      });

      if (comment) {
        console.log(comment);
        this.comments.unshift(comment.data);
        this.commentContent = '';
      }
      this.loading = false;
    },
    // 删除评论
    async deleteComment(event) {
      console.log(event.target.dataset.comment);
      console.log(event.target);

      request({
        url: `/articles/${this.$route.params.slug}/comments/${event.target.dataset.comment}`,
        method: 'delete',
        headers: { Authorization: token() }
      })
        .then((result) => {
          console.log('删除评论成功');
          this.loadComments();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 加载评论
    async loadComments() {
      const slug = this.$route.params.slug;

      const comments = await request({
        url: `/articles/${slug}/comments`
      }).catch((error) => {
        console.log(error);
      });

      if (comments) {
        // console.log('已获取文章评论', comments);
        this.comments = comments.data.comments;
      }
    }
  },
  mounted() {
    this.loadComments();
  }
};
</script>
