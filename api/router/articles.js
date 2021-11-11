const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, param, query, validationResult } = require('express-validator');

const { Article, User, Comment } = require('../model.js');

// Token 相关
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Node.js 原生，把最后一个参数是回调函数的 API 转换成 Promise 的方式
const sign = promisify(jwt.sign); // 生成 token
const verify = promisify(jwt.verify); // 验证 token
const decode = promisify(jwt.decode); // （不验证，直接）解析 token

// GET /api/articles 获取文章列表 Token 可选
router.get(
  '/',
  // 验证和解析 Token （看用户是否登录了，如果登录了要判断登录的用户是否收藏了此文章、是否关注了此文章的作者）
  // 解析成功后将用户 ID 挂在 req.userId 上
  async (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      next();
      return;
    }

    if (token.length !== 176) {
      console.log('无效的 Token');
      next();
      return;
    }

    console.log('有 Token');
    console.log('req.user', req.user);

    try {
      console.log('开始解析 Token');

      const decodedToken = await verify(token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        console.log('无效的 Token');
        return;
      }

      console.log('解析后', decodedToken);

      req.userId = decodedToken.userId;
      console.log('req.userId', req.userId);
      // next();
    } catch (error) {
      console.log('Token 认证失败');
      return;
    } finally {
      next();
    }
  },
  // 获取文章列表
  async function (req, res, next) {
    // 获取参数，设置一个默认值
    const {
      offset = 0, // 跳过多少条
      // 解构并设置默认值
      limit = 10, // 取多少条
      tag,
      author,
      favorited
    } = req.query;

    const options = {};

    // 标签 /api/articles?tag=tagName
    tag && (options.tagList = tag);

    // 作者 /api/articles?author=authorUsername
    if (author) {
      const user = await User.findOne({ username: author });
      options.author = user._id;
    }

    // 收藏 /api/articles?favorited=authorUsername
    if (favorited) {
      const user = await User.findOne({ username: favorited });
      options.favorites = user._id;
    }

    // 执行查询
    const articles = await Article.find(options)
      .skip(offset * 1) // 跳过多少条
      .limit(limit * 1) // 取多少条
      .sort({ createdAt: -1 }) // 倒叙排序，日期最新（时间戳最大）的拍最前面
      .populate({ path: 'author' });

    req.articles = articles;
    req.articlesCount = await Article.find(options).count();

    next();
  },
  // 筛选字段
  (req, res, next) => {
    // 遍历，添加一些需要的（数据库中没有的）字段
    const data = req.articles.map(function (article, index) {
      // mongoose 对查询出的文档对象进行了特殊处理，无法在上面添加、删除属性，使用 toJSON() 转换一下就行了
      // const article = item.toJSON();

      // 添加 favoritesCount
      article.favoritesCount = article.favorites.length;

      // 添加 favorited
      if (article.favorites.includes(req.userId)) {
        console.log('已收藏该文章');
        article.favorited = true;
      } else {
        console.log('没有收藏该文章');
        article.favorited = false;
      }

      // 添加作者的 followed
      if (article.author.follows.includes(req.userId)) {
        console.log('已关注了该文章的作者');
        article.author.following = true;
      } else {
        console.log('没有关注该文章的作者');
        article.author.following = false;
      }

      const data = {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favorited,
        favoritesCount: article.favoritesCount,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
          following: article.author.following
        }
      };

      return data;
    });

    // // 添加 articlesCount
    // newArticles.articlesCount = newArticles.length;
    // console.log(data);
    req.articles = data;
    next();
  },
  (req, res, next) => {
    // 获取成功
    res.status(200).json({
      statusCode: 200,
      message: '文章获取成功',
      data: {
        articles: req.articles,
        articlesCount: req.articlesCount
      }
    });
  }
);

// GET /api/articles/feed 获取所关注用户的文章列表 Token 必选
// 必须放在 获取单篇文章 之前，否则路由进不来
// 猜猜如果文章名称如果叫 feed ，后果会是什么
router.get(
  '/feed',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  async (req, res, next) => {
    // 查询关注了哪些用户
    const users = await User.find({
      follows: req.userId
    });

    if (!users.length) {
      res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {
          articles: [],
          articlesCount: 0
        }
      });
      return;
    }

    /*
      弄一个这样的数组，用于 or 条件
      [
        { author: id },
        { author: id },
        ...
      ]
    */
    const options = users.map((user) => ({ author: user._id }));

    // 获取参数，设置一个默认值
    const {
      offset = 0, // 跳过多少条
      // 解构并设置默认值
      limit = 10 // 取多少条
    } = req.query;

    // 执行查询
    const articles = await Article.find()
      .or(options)
      .skip(offset * 1) // 跳过多少条
      .limit(limit * 1) // 取多少条
      .sort({ createdAt: -1 }) // 倒叙排序，日期最新（时间戳最大）的拍最前面
      .populate({ path: 'author' });

    req.articles = articles;
    req.articlesCount = await Article.find().or(options).count();

    next();
  },
  // 筛选字段
  (req, res, next) => {
    // 遍历，添加一些需要的（数据库中没有的）字段
    const data = req.articles.map(function (article, index) {
      // mongoose 对查询出的文档对象进行了特殊处理，无法在上面添加、删除属性，使用 toJSON() 转换一下就行了
      // const article = item.toJSON();

      // 添加 favoritesCount
      article.favoritesCount = article.favorites.length;

      // 添加 favorited
      if (article.favorites.includes(req.userId)) {
        console.log('已收藏该文章');
        article.favorited = true;
      } else {
        console.log('没有收藏该文章');
        article.favorited = false;
      }

      // 添加作者的 followed
      if (article.author.follows.includes(req.userId)) {
        console.log('已关注了该文章的作者');
        article.author.following = true;
      } else {
        console.log('没有关注该文章的作者');
        article.author.following = false;
      }

      const data = {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favorited,
        favoritesCount: article.favoritesCount,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
          following: article.author.following
        }
      };

      return data;
    });

    // // 添加 articlesCount
    // newArticles.articlesCount = newArticles.length;
    // console.log(data);
    req.articles = data;
    next();
  },
  (req, res, next) => {
    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data: {
        articles: req.articles,
        articlesCount: req.articlesCount
      }
    });
  }
);

// GET /api/articles/:slug 获取单篇文章 Token 可选
router.get(
  '/:slug',
  // 验证和解析 Token （看用户是否登录了，如果登录了要判断登录的用户是否收藏了此文章、是否关注了此文章的作者）
  // 解析成功后将用户 ID 挂在 req.userId 上
  async (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      next();
      return;
    }

    if (token.length !== 176) {
      console.log('无效的 Token');
      next();
      return;
    }

    console.log('有 Token');
    console.log('req.user', req.user);

    try {
      console.log('开始解析 Token');

      const decodedToken = await verify(token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        console.log('无效的 Token');
        return;
      }

      console.log('解析后', decodedToken);

      req.userId = decodedToken.userId;
      console.log('req.userId', req.userId);
      // next();
    } catch (error) {
      console.log('Token 认证失败');
      return;
    } finally {
      next();
    }
  },
  async (req, res, next) => {
    const article = await Article.findOne({
      slug: req.params.slug
    }).populate('author');
    console.log(article);
    if (!article) {
      res.status(404).json({
        statusCode: 404,
        message: 'error',
        detail: ['该文章不存在']
      });
      return;
    }

    // 添加 favoritesCount
    article.favoritesCount = article.favorites.length;

    // 添加 favorited
    if (article.favorites.includes(req.userId)) {
      console.log('已收藏该文章');
      article.favorited = true;
    } else {
      console.log('没有收藏该文章');
      article.favorited = false;
    }

    // 添加作者的 followed
    if (article.author.follows.includes(req.userId)) {
      console.log('已关注了该文章的作者');
      article.author.following = true;
    } else {
      console.log('没有关注该文章的作者');
      article.author.following = false;
    }
    // 这里有待优化

    const data = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: article.favorited,
      favoritesCount: article.favoritesCount,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: article.author.following
      }
    };

    res.status(200).json({
      statusCode: 200,
      message: '文章获取成功',
      data
    });
  }
);

// POST /api/articles 发表文章 Token 必选
router.post(
  '/',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  // 验证文章标题
  body('title').trim().not().isEmpty().withMessage('文章标题不能为空'),
  // 验证文章简介
  body('description').trim().not().isEmpty().withMessage('文章简介不能为空'),
  // 验证文章内容
  body('body').trim().not().isEmpty().withMessage('文章内容不能为空'),
  // 验证失败错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '参数有误',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  // 验证文章标题是否已存在
  body('title').custom(async (title) => {
    const article = await Article.findOne({ title });

    console.log(article);
    if (article) {
      return Promise.reject('文章标题已存在');
    }
  }),
  // 验证失败错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '发表失败',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  // 发表文章
  async (req, res, next) => {
    // 将标题中的空格替换成短横线 -
    req.body.slug = req.body.title.replace(' ', '-');

    const article = new Article({
      ...req.body,
      author: req.userId
    });
    article.populate('author');
    // 保存文章
    await article.save();

    // 获取当前用户信息
    const user = await User.findById(req.userId);

    // console.log(article);

    const data = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: false,
      favoritesCount: 0,
      author: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: false
      }
    };

    // console.log(data);

    res.status(201).json({
      statusCode: 201,
      meddage: '文章发表成功',
      data
    });
  }
);

// PUT /api/articles:slug 更新文章 Token 必选
router.put(
  '/:slug',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  // 验证文章标题是否已存在且不是当前文章标题
  body('title').custom(async (title, { req }) => {
    const article = await Article.findOne({
      title,
      slug: {
        $ne: req.params.slug
      }
    });

    if (article) {
      return Promise.reject('文章标题已存在');
    }
  }),
  // 验证失败错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '更新失败',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  // 筛选字段
  async (req, res, next) => {
    const oldArticle = await Article.findOne({
      slug: req.params.slug
    });

    if (req.body.title === oldArticle.title) {
      console.log('标题没有变化');
      delete req.body.title;
    }
    if (req.body.description === oldArticle.description) {
      console.log('简介没有变化');
      delete req.body.description;
    }
    if (req.body.body === oldArticle.body) {
      console.log('内容没有变化');
      delete req.body.body;
    }

    if (
      req.body.tagList.sort().toString() ===
      oldArticle.tagList.sort().toString()
    ) {
      console.log('标签没有变化');
      delete req.body.tagList;
    }

    // 如果是空对象
    if (!Object.keys(req.body).length) {
      console.log('没有任何变化');
      res.status(400).json({
        statusCode: 400,
        message: '更新失败',
        detail: ['文章没有变化']
      });
      return;
    }
    next();
  },
  async (req, res, next) => {
    // 将标题中的空格替换成短横线 -
    if (req.body.title) {
      req.body.slug = req.body.title.replace(' ', '-');
    }

    console.log('准备更新文章');

    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );

    console.log('更新后的文章', article);

    // 获取当前用户信息
    const user = await User.findById(req.userId);

    // console.log(article);

    const data = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: article.favorites.includes(user._id),
      favoritesCount: article.favorites.length,
      author: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: false
      }
    };

    // console.log(data);

    res.status(201).json({
      statusCode: 201,
      meddage: '文章发表成功',
      data
    });
  }
);

// DELETE /api/articles:slug 删除文章 Token 必选
router.delete(
  '/:slug',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  // 删除文章
  async (req, res, next) => {
    const result = await Article.findOneAndDelete({
      slug: req.params.slug
    });
    console.log(result);

    // console.log(data);

    res.status(201).json({
      statusCode: 201,
      meddage: '文章删除成功',
      data: result
    });
  }
);

// POST /api/articles/:slug/comments 发表评论 Token 必选
router.post(
  '/:slug/comments',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  // 验证评论内容
  body('body').trim().not().isEmpty().withMessage('评论内容不能为空'),
  // 验证失败错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '评论发表失败',
        detail: errors.array()
      });
      console.log('已返回错误信息');
      return; // 如果不加 return 还会向后执行
      // 但这里已经做了响应，如果后边再有响应，会报错。一次请求只能有一个响应
    }
    next();
  },
  async (req, res, next) => {
    // 获取要评论的文章
    const article = await Article.findOne({ slug: req.params.slug });

    const comment = new Comment({
      body: req.body.body,
      article: article._id,
      author: req.userId
    });
    comment.populate('author');
    await comment.save();
    // console.log(comment);

    const data = {
      id: comment._id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: comment.author.image,
        following: false
      }
    };

    res.status(201).json({
      statusCode: 201,
      message: '评论发表成功',
      data
    });
  }
);

// DELETE /api/articles/:slug/comments/:id 删除评论 Token 必选
router.delete(
  '/:slug/comments/:id',
  // 获取 Token
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 解析 Token
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  async (req, res, next) => {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({
      statusCode: 200,
      message: '删除发表成功',
      data: ['评论已删除']
    });
  }
);

// GET /api/articles/:slug/comments 获取文章评论 Token 可选
router.get(
  '/:slug/comments',
  // 验证和解析 Token （看用户是否登录了，如果登录了要判断登录的用户是否收藏了此文章、是否关注了此文章的作者）
  // 解析成功后将用户 ID 挂在 req.userId 上
  async (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      next();
      return;
    }

    if (token.length !== 176) {
      console.log('无效的 Token');
      next();
      return;
    }

    console.log('有 Token');
    console.log('req.user', req.user);

    try {
      console.log('开始解析 Token');

      const decodedToken = await verify(token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        console.log('无效的 Token');
        return;
      }

      console.log('解析后', decodedToken);

      req.userId = decodedToken.userId;
      console.log('req.userId', req.userId);
      // next();
    } catch (error) {
      console.log('Token 认证失败');
      return;
    } finally {
      next();
    }
  },
  async (req, res, next) => {
    // 根据 slug 获取文章
    const article = await Article.findOne({ slug: req.params.slug });
    console.log(article._id);

    // 获取评论
    const comments = await Comment.find({
      article: article._id
    })
      .sort({ createdAt: -1 }) // 倒叙排序，日期最新（时间戳最大）的拍最前面
      .populate('author');

    const data = comments.map((comment) => {
      const data = {
        id: comment._id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body,
        author: {
          username: comment.author.username,
          bio: comment.author.bio,
          image: comment.author.image,
          following: comment.author.follows.includes(req.userId)
        }
      };
      return data;
    });

    res.status(200).json({
      statusCode: 200,
      message: '获取文章评论成功',
      data
    });
  }
);

// POST /api/articles/:slug/favorite 收藏文章 Token 必选
router.post(
  '/:slug/favorite',
  // 验证是否传了 Token 及其格式是否有效
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 开始 Token 认证
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  async (req, res, next) => {
    // 收藏
    const article = await Article.findOneAndUpdate(
      {
        slug: req.params.slug
      },
      {
        $push: {
          favorites: req.userId
        }
      },
      {
        new: true
      }
    ).populate('author');

    const data = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: true,
      favoritesCount: article.favorites.length,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: article.author.follows.includes(req.userId)
      }
    };

    res.status(201).json({
      statusCode: 201,
      message: 'success',
      data
    });
  }
);

// DELETE /api/articles/:slug/favorite 取消收藏文章 Token 必选
router.delete(
  '/:slug/favorite',
  // 验证是否传了 Token 及其格式是否有效
  (req, res, next) => {
    // 从请求头获取 token 数据
    let token = req.headers.authorization;
    token = token ? token.split('Token ')[1] : null;

    console.log('Token', token);

    if (!token) {
      console.log('没有 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['没有 Token']
      });
      return;
    }
    if (token.length !== 176) {
      console.log('无效的 Token');
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }

    req.token = token;
    next();
  },
  // 开始 Token 认证
  async (req, res, next) => {
    try {
      // 解析 token
      // 解析后格式如下
      // {
      //   userId: '616d292e34ceb71b8082bfb0',
      //   iat: 1634546303,
      //   exp: 1634575103
      // }
      console.log('开始解析 Token');

      const decodedToken = await verify(req.token, 'vue'); // 传入 Token 和私钥

      if (!decodedToken) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token 认证',
          detail: ['无效的 Token']
        });
        return;
      }

      req.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Token 认证',
        detail: ['无效的 Token']
      });
      return;
    }
  },
  async (req, res, next) => {
    // 收藏
    const article = await Article.findOneAndUpdate(
      {
        slug: req.params.slug
      },
      {
        $pull: {
          favorites: req.userId
        }
      },
      {
        new: true
      }
    ).populate('author');

    const data = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: false,
      favoritesCount: article.favorites.length,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: article.author.follows.includes(req.userId)
      }
    };

    res.status(201).json({
      statusCode: 201,
      message: 'success',
      data
    });
  }
);

module.exports = router;
