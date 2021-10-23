<template>
  <button
    @click="favoriteEvent"
    class="btn btn-sm pull-xs-right"
    :class="[
      article.favorites.includes($store.state.currentUser._id)
        ? 'btn-primary'
        : 'btn-outline-primary',
      {
        disabled: favoriteLoading
      }
    ]"
  >
    <i class="ion-heart"></i>
    {{ this.article.favorites.length }}
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
