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
import { errorHandle } from '@/utils/index.js';
import api from '@/utils/api.js';

export default {
  name: 'ArticleEditor',
  props: ['mode'],
  components: {
    ErrorList: () => import('@/components/ErrorList.vue')
  },
  async created() {
    // 清除错误信息
    errorHandle();

    if (this.mode !== 'editor') {
      return;
    }

    const article = await api.getArticle(this.$route.params.slug);

    if (article) {
      this.formData = {
        title: article.data.title,
        description: article.data.description,
        body: article.data.body,
        tagList: article.data.tagList
      };
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

      // 判断是创建还是更新
      const prop = this.mode === 'create' ? 'createArticle' : 'updateArticle';

      const article = await api[prop](this.formData, this.$route.params.slug);

      if (article) {
        // 跳转到文章详情页
        this.$router.push(`/article/${article.data.slug}`);
      }

      // 隐藏加载图标
      this.loading = false;
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
