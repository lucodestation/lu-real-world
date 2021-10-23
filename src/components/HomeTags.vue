<template>
  <div class="col-md-3">
    <div class="sidebar">
      <p>热门标签</p>

      <div class="tag-list">
        <span v-show="isLoading">正在加载标签 <i class="ion-load-a"></i></span>

        <span v-show="!tags.length && !isLoading">没有标签</span>

        <a
          v-for="(tag, index) in tags"
          :key="index"
          :data-tag="tag"
          @click="tagEvent"
          href="javascript:"
          class="tag-pill tag-default"
        >
          {{ tag }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request.js';

export default {
  name: 'HomeTags',
  data() {
    return {
      tags: [],
      isLoading: false
    };
  },
  async mounted() {
    this.isLoading = true;
    const tags = await request({
      url: '/tags'
    });
    this.tags = tags.data.tagList;
    this.isLoading = false;
  },
  methods: {
    async tagEvent(event) {
      const tag = event.target.dataset.tag;
      this.$emit('tagArticles', tag);
    }
  }
};
</script>
