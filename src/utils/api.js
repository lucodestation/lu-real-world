import request from './request.js';

const api = {};

// 注册
api.register = async (data) => {
  const result = await request({
    url: '/users',
    method: 'post',
    data
  });
  return result;
};

// 登录
api.login = async (data) => {
  const result = await request({
    url: '/users/login',
    method: 'post',
    data
  });
  return result;
};

// 获取当前用户信息
api.getCurrentUserInfo = async () => {
  const result = await request({
    url: '/user'
  });
  return result;
};

// 更新当前用户信息
api.updateCurrentUserInfo = async (data) => {
  const result = await request({
    url: '/user',
    method: 'put',
    data
  });
  return result;
};

// 获取他人用户信息
api.getProfiles = async (username) => {
  const result = await request({
    url: `/profiles/${username}`
  });
  return result;
};

// 关注用户
api.followUser = async (username) => {
  const result = await request({
    url: `/profiles/${username}/follow`,
    method: 'post'
  });
  return result;
};

// 取消关注用户
api.deleteFollowUser = async (username) => {
  const result = await request({
    url: `/profiles/${username}/follow`,
    method: 'delete'
  });
  return result;
};

// 创建文章
api.createArticle = async (data) => {
  const result = await request({
    url: '/articles',
    method: 'post',
    data
  });
  return result;
};

// 获取指定文章
api.getArticle = async (slug) => {
  const result = await request({
    url: `/articles/${slug}`
  });
  return result;
};

// 更新文章
api.updateArticle = async (data, slug) => {
  const result = await request({
    url: `/articles/${slug}`,
    method: 'put',
    data
  });
  return result;
};

// 获取文章列表
api.getArticles = async (params) => {
  const result = await request({
    url: '/articles',
    params
  });
  return result;
};

// 获取我的订阅文章列表
api.getArticlesFeed = async (params) => {
  const result = await request({
    url: '/articles/feed',
    params
  });
  return result;
};

// 删除文章
api.deleteArticle = async (slug) => {
  const result = await request({
    url: `/articles/${slug}`,
    method: 'delete'
  });
  return result;
};

// 发表评论
api.createComment = async (slug, body) => {
  const result = await request({
    url: `/articles/${slug}/comments`,
    method: 'post',
    data: {
      body
    }
  });
  return result;
};

// 删除评论
api.deleteComment = async (slug, id) => {
  const result = await request({
    url: `/articles/${slug}/comments/${id}`,
    method: 'delete'
  });
  return result;
};

// 获取评论列表
api.getComments = async (slug) => {
  const result = await request({
    url: `/articles/${slug}/comments`
  });
  return result;
};

// 收藏文章
api.favoriteArticle = async (slug) => {
  const result = await request({
    url: `/articles/${slug}/favorite`,
    method: 'post'
  });
  return result;
};

// 取消收藏文章
api.deleteFavoriteArticle = async (slug) => {
  const result = await request({
    url: `/articles/${slug}/favorite`,
    method: 'delete'
  });
  return result;
};

// 获取标签列表
api.getTagList = async () => {
  const result = await request({
    url: `/tags`
  });
  return result;
};

export default api;
