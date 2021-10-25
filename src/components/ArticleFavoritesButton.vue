<template>
  <button
    @click="favoriteEvent"
    class="btn btn-sm pull-xs-right"
    :class="[
      article.favorited ? 'btn-primary' : 'btn-outline-primary',
      {
        disabled: favoriteLoading
      }
    ]"
  >
    <i class="ion-heart"></i>
    {{ this.article.favoritesCount }}
  </button>
</template>

<script>
import request from '@/utils/request.js';

import token from '@/utils/token.js';

export default {
  name: 'ArticleFavoritesButton',
  props: ['article'],
  data() {
    return {
      favoriteLoading: false
    };
  },
  methods: {
    async favoriteEvent() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/register');
        return;
      }

      this.favoriteLoading = true;

      let method = this.article.favorited ? 'delete' : 'post';

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
