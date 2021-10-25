<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <!-- 错误提示 -->
          <ErrorList />

          <form>
            <fieldset>
              <!-- 标题 -->
              <fieldset class="form-group">
                <input
                  v-model="formData.title"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="文章标题"
                />
              </fieldset>
              <!-- 简介 -->
              <fieldset class="form-group">
                <input
                  v-model="formData.description"
                  type="text"
                  class="form-control"
                  placeholder="这是关于什么的文章？"
                />
              </fieldset>
              <!-- 内容 -->
              <fieldset class="form-group">
                <textarea
                  v-model="formData.body"
                  class="form-control"
                  rows="8"
                  placeholder="在这里写文章内容（支持 Markdown）"
                ></textarea>
              </fieldset>
              <!-- 标签 -->
              <fieldset class="form-group">
                <input
                  @keyup.enter="addTag"
                  type="text"
                  class="form-control"
                  placeholder="标签（按回车添加）"
                />
                <!-- 标签列表 -->
                <div class="tag-list">
                  <span
                    v-for="(tag, index) in formData.tagList"
                    :key="index"
                    class="tag-default tag-pill"
                  >
                    <i @click="deleteTag(tag)" class="ion-close-round"></i>
                    {{ tag }}
                  </span>
                </div>
              </fieldset>
              <!-- 提交按钮 -->
              <button
                @click="formSubmit"
                class="btn btn-lg pull-xs-right btn-primary"
                :class="{
                  disabled: !canSubmit
                }"
                type="button"
              >
                {{ mode === 'create' ? '发表' : '保存' }}
                <i v-show="loading" class="ion-load-a"></i>
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import request from '@/utils/request.js';
import { errorHandle } from '@/utils/index.js';
import token from '@/utils/token.js';

export default {
  name: 'ArticleEditor',
  props: ['mode'],
  components: {
    ErrorList: () => import('@/components/ErrorList.vue')
  },
  async created() {
    // 清空错误信息
    this.$store.commit('changeErrorArray', []);

    if (this.mode !== 'editor') {
      return;
    }
    const article = await request({
      url: `/articles/${this.$route.params.slug}`
    }).catch((error) => {
      errorHandle(error.detail);
    });

    console.log(article);

    if (article) {
      console.log('获取需要编辑的文章');
      Vue.set(this.formData, 'title', article.data.title);
      Vue.set(this.formData, 'description', article.data.description);
      Vue.set(this.formData, 'body', article.data.body);
      Vue.set(this.formData, 'tagList', article.data.tagList);
      Vue.set(this.formData, 'slug', article.data.slug);
      // console.table('this.article', this.formData);
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        tagList: []
      }
    };
  },
  methods: {
    // 添加标签
    addTag(event) {
      // 获取标签
      const tag = event.target.value.trim();
      // 判断是否已包含该标签
      if (!this.formData.tagList.includes(tag)) {
        this.formData.tagList.push(tag);
        event.target.value = '';
      }
    },
    // 删除标签
    deleteTag(tag) {
      this.formData.tagList.splice(this.formData.tagList.indexOf(tag), 1);
    },
    // 提交表单
    async formSubmit() {
      // 清除错误信息
      errorHandle();
      // 显示加载图标
      this.loading = true;

      const url =
        this.mode === 'create'
          ? '/articles'
          : `/articles/${this.formData.slug}`;
      const method = this.mode === 'create' ? 'post' : 'put';

      console.log('创建文章');
      const article = await request({
        url,
        method,
        headers: { Authorization: token() },
        data: this.formData
      }).catch((error) => {
        // 处理错误信息
        errorHandle(error.detail);
        // 隐藏加载图标
        this.loading = false;
      });

      if (article) {
        console.log(article);
        // 隐藏加载图标
        this.loading = false;

        // 跳转到文章详情页
        this.$router.push(`/article/${article.data.slug}`);
      }
    }
  },
  computed: {
    canSubmit: function () {
      if (
        this.mode === 'create' &&
        this.formData.title &&
        this.formData.description &&
        this.formData.body
      ) {
        return true;
      }

      if (this.mode === 'editor') {
        return true;
      }

      return false;
    }
  }
};
</script>
