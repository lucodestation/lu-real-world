<template>
  <div class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <!-- 头像 -->
            <img :src="profile.image" class="user-img" />

            <!-- 用户名 -->
            <h4>{{ profile.username }}</h4>

            <!-- 个人简介 -->
            <p>{{ profile.bio }}</p>

            <!-- 设置 -->
            <router-link
              to="/settings"
              tag="button"
              v-if="
                $store.state.isLoggedIn &&
                $store.state.currentUser.username === $route.params.username
              "
              class="btn btn-sm btn-outline-secondary action-btn"
            >
              <i class="ion-gear-a"></i>
              &nbsp; 设置
            </router-link>
            <!-- 关注 -->
            <button
              v-else
              @click="followEvent"
              class="btn btn-sm btn-outline-secondary action-btn"
              :class="{
                disabled: followLoading
              }"
            >
              <i class="ion-plus-round"></i>
              {{ this.profile.following ? '取消关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a
                  @click="myArticles"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myArticles'
                  }"
                  href="javascript:"
                  >我的文章</a
                >
              </li>
              <li class="nav-item">
                <a
                  @click="myFavorites"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myFavorites'
                  }"
                  href="javascript:"
                  >我的收藏</a
                >
              </li>
            </ul>
          </div>

          <!-- 文章列表/预览 -->
          <ArticlePreview
            v-if="currentTabCard"
            :articles="articles"
            :articlesCount="articlesCount"
            :currentTabCard="currentTabCard"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js';

export default {
  name: 'ProfilePage',
  components: {
    ArticlePreview: () => import('@/components/ArticlePreview.vue')
  },
  data() {
    return {
      profile: {
        follows: []
      },
      articles: [],
      currentTabCard: '',
      loading: false,
      followLoading: false,
      articlesCount: 0
    };
  },
  methods: {
    // 加载个人信息
    async loadProfile() {
      const username = this.$route.params.username;

      // 判断是获取自己的信息还是获取他人的信息
      const prop =
        username === this.$store.state.currentUser.username
          ? 'getCurrentUserInfo'
          : 'getProfiles';

      // 获取信息
      const user = await api[prop](username);

      if (user) {
        this.profile = user.data;
      }
    },
    async myArticles() {
      // console.log('我的文章');
      if (this.currentTabCard === 'myArticles') {
        // 如果已经处于“我的文章”
        return;
      }
      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'myArticles';
      }, 0);
    },
    async myFavorites() {
      // console.log('我的收藏');
      if (this.currentTabCard === 'myFavorites') {
        // 如果已经处于“我的收藏”
        return;
      }
      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'myFavorites';
      }, 0);
    },
    // 关注/取消关注按钮
    async followEvent() {
      if (!this.$store.state.isLoggedIn) {
        // console.log('还没登录哦');
        this.$router.push('/register');
        return;
      }

      this.followLoading = true;

      // 判断是关注还是取消关注
      const prop = this.profile.following ? 'deleteFollowUser' : 'followUser';

      const user = await api[prop](this.profile.username);

      if (user) {
        this.profile = user.data;
      }
      this.followLoading = false;
    }
  },
  watch: {
    $route(to, from) {
      // 加载个人信息
      this.loadProfile();

      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'myArticles';
      }, 0);
    }
  },
  created() {
    // 加载个人信息
    this.loadProfile();

    this.currentTabCard = 'myArticles';
  }
};
</script>
