// /api/user 路由进到这里
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const { User } = require('../model.js');

// MD5
const crypto = require('crypto'); // Node.js 原生
const md5 = (str) => {
  return crypto
    .createHash('md5')
    .update(str + 'node') // 盐值
    .digest('hex');
};

// Token 相关
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Node.js 原生，把最后一个参数是回调函数的 API 转换成 Promise 的方式
const sign = promisify(jwt.sign); // 生成 token
const verify = promisify(jwt.verify); // 验证 token
const decode = promisify(jwt.decode); // （不验证，直接）解析 token

// GET /api/user 获取当前用户信息 Token 必选
router.get(
  '/',
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
  // 验证 Token
  async (req, res, next) => {
    // 解析 token
    // 如果 Token 过期或因为其他原因可能会报错，所以最好使用 try
    try {
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
  // 返回数据
  async (req, res, next) => {
    const user = await User.findById(req.userId);

    const data = {
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
      token: req.token
    };

    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data
    });
  }
);

// PUT /api/user 更新当前用户信息 Token 必选
router.put(
  '/',
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
  body('email').trim().isEmail().withMessage('邮箱格式不正确'),
  body('image').trim().isURL().withMessage('用户头像 URL 不是正确的 URL'),
  // 验证错误处理
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
  // 验证邮箱是否已被他人注册
  body('email')
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value,
        _id: {
          $ne: req.userId // 不等于
        }
      });

      if (user) {
        return Promise.reject('该邮箱已存在');
      }
    }),
  // 验证用户名是否已被他人注册
  body('username')
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        username: value,
        _id: {
          $ne: req.userId
        }
      });

      if (user) {
        return Promise.reject('该用户名已存在');
      }
    }),
  // 验证错误处理
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
  // 字段过滤
  async (req, res, next) => {
    const user = await User.findById(req.userId).select([
      'username',
      'email',
      'bio',
      'image',
      'password'
    ]);
    if (user.username === req.body.username) {
      delete req.body.username;
    }
    if (user.email === req.body.email) {
      delete req.body.email;
    }
    if (user.bio === req.body.bio) {
      delete req.body.bio;
    }
    if (user.image === req.body.image) {
      delete req.body.image;
    }
    if (user.password === md5(req.body.password)) {
      delete req.body.password;
    }

    // 判断 req.body 是不是空对象
    if (!Object.keys(req.body).length) {
      res.status(400).json({
        statusCode: 400,
        message: '更新失败',
        detail: ['数据没有任何变化，无需更新']
      });
      return;
    }
    console.log(req.body);
    next();
  },
  // 返回数据
  async (req, res, next) => {
    const newUser = await User.findByIdAndUpdate(req.userId, req.body, {
      new: true // 返回更新后的数据（默认 false ，返回查到的数据（更新前））
    });

    console.log('更新后的 user', newUser);

    // 生成 Token
    const token = await sign(
      {
        userId: newUser._id
      },
      // 私钥
      'vue',
      {
        // 过期时间（秒）（默认永久有效）
        // 设置为 1 小时
        expiresIn: 60 * 60 * 1
      }
    );

    const data = {
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      image: newUser.image,
      token
    };

    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data
    });
  }
);

module.exports = router;
