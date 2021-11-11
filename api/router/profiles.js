const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const { User } = require('../model.js');

// Token 相关
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Node.js 原生，把最后一个参数是回调函数的 API 转换成 Promise 的方式
const sign = promisify(jwt.sign); // 生成 token
const verify = promisify(jwt.verify); // 验证 token
const decode = promisify(jwt.decode); // （不验证，直接）解析 token

// GET /api/profiles/:username 获取用户信息 Token 可选
router.get(
  '/:username',
  // 验证用户名
  param('username')
    .trim()
    .custom(async (value, { req }) => {
      console.log('要找', value, '的信息');
      const user = await User.findOne({
        username: value
      });
      // 这里没有筛选字段，因为要返回客户端 following 字段，而数据库中没有这个字段，要根据 follows 字段（后边要用）来决定 following 的值，而 follows 字段又不返回客户端

      console.log('找到用户 user', user);

      if (!user) {
        return Promise.reject('该用户不存在');
      } else {
        req.user = user;
      }
    }),
  // 验证错误处理
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(404).json({
        statusCode: 404,
        message: 'error',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  // 验证和解析 Token （看用户是否登录了，如果登录了要判断登录的用户是否关注了此用户）
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
  // 返回数据
  (req, res, next) => {
    // 这里要在 req.user 上添加一些数据

    // req.user 是从数据库中查到的数据，如果直接返回给客户端，那么在 req.user 上添加的属性不会被返回，可以使用 toJSON() 转换一下后再添加属性就可以返回添加的属性了
    // 但是转换后用 req.user.follows.includes(id) 去判断的时候，无论 id 是字符串还是 ObjectId ，都返回 false
    // 所以这里不用 toJSON() 转换

    // 但是不是不可以在 req.user 上添加属性，只是在使用 res.json 返回个客户端时没有添加的属性，在返回之前是可以读取的（使用 console.log 效果也一样，都看不到添加的属性）

    // 添加 following
    if (req.user.follows.includes(req.userId)) {
      console.log('已关注');
      following = true;
      req.user.following = true;
    } else {
      req.user.following = false;
    }
    // 在这里可以读取 req.user.following
    const data = {
      username: req.user.username,
      bio: req.user.bio,
      image: req.user.image,
      following: req.user.following
    };

    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data
    });
  }
);

// POST /api/profiles/:username/follow 关注用户 Token 必选
router.post(
  '/:username/follow',
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
  // 验证用户名
  param('username')
    .trim()
    .custom(async (value, { req }) => {
      console.log('要关注', value);
      const user = await User.findOne({
        username: value
      });

      // console.log('要关注用户 user', user);

      if (!user) {
        return Promise.reject('该用户不存在');
      } else {
        req.user = user;
      }
    }),
  // 验证错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: 'error',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  async (req, res, next) => {
    // req.user   要关注的用户
    // req.userId 当前登录用户的 ID

    if (req.user.follows.includes(req.userId)) {
      res.status(400).json({
        statusCode: 400,
        message: 'error',
        detail: ['您已关注了该用户，无需再次关注']
      });
      return;
    }

    // 把当前登录用户的 ID 加入要关注的用户的 follows 中
    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $push: {
          follows: req.userId
        }
      },
      { new: true }
    );

    const following = user.follows.includes(req.userId) ? true : false;

    const data = {
      username: req.user.username,
      bio: req.user.bio,
      image: req.user.image,
      following
    };

    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data
    });
  }
);

// DELETE /api/profiles/:username/follow 取消关注 Token 必选
router.delete(
  '/:username/follow',
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
  // 用户名
  param('username')
    .trim()
    .custom(async (value, { req }) => {
      console.log('要取消关注', value);
      const user = await User.findOne({
        username: value
      });

      // console.log('要关注用户 user', user);

      if (!user) {
        return Promise.reject('该用户不存在');
      } else {
        req.user = user;
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: 'error',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  async (req, res, next) => {
    // req.user   要关注的用户
    // req.userId 当前登录用户的 ID

    // 把当前登录用户的 ID 加入要关注的用户的 follows 中
    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $pull: {
          follows: req.userId
        }
      },
      { new: true }
    );

    const following = user.follows.includes(req.userId) ? true : false;

    const data = {
      username: req.user.username,
      bio: req.user.bio,
      image: req.user.image,
      following
    };

    res.status(200).json({
      statusCode: 200,
      message: 'success',
      data
    });
  }
);

module.exports = router;
