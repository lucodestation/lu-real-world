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

// POST /api/users 注册
router.post(
  '/',
  // 验证用户名
  body('username').trim().not().isEmpty().withMessage('用户名不能为空'),
  // 验证邮箱
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('邮箱不能为空')
    .bail() // 如果前面的验证失败，就不验证同规则后边的。例如，如果邮箱为空，就不验证邮箱格式正确不正确，但还会去验证密码
    .isEmail()
    .withMessage('邮箱格式不正确'),
  // 验证密码
  body('password').trim().not().isEmpty().withMessage('密码不能为空'),
  // 验证失败错误处理中间件
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '注册失败',
        detail: errors.array()
      });
      console.log('已返回错误信息');
      return; // 如果不加 return 还会向后执行
      // 但这里已经做了响应，如果后边再有响应，会报错。一次请求只能有一个响应
    }
    next();
  },
  // 验证用户名是否已被注册
  body('username')
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({
        username: value
      });
      if (user) {
        return Promise.reject('该用户名已被注册');
      }
    }),
  // 验证邮箱是否已被注册
  body('email')
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({
        email: value
      });
      if (user) {
        return Promise.reject('该邮箱已被注册');
      }
    }),
  // 验证错误处理
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '注册失败',
        detail: errors.array()
      });
      return;
    }

    next();
  },
  // 开始注册
  async (req, res, next) => {
    // console.log('req.body', req.body);

    // 根据模型创建文档（MongoDB 中的文档（document）相当于 MySQL 中的表（table））
    const user = new User(req.body);
    // 保存文档
    await user.save();

    // console.log('user', user);

    // 生成 Token
    const token = await sign(
      {
        userId: user._id
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
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
      token
    };

    res.status(201).json({
      statusCode: 201,
      message: '注册成功',
      data
    });
  }
);

// POST /api/users/login 登录
router.post(
  '/login',
  // 验证邮箱
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('邮箱不能为空')
    .bail()
    .isEmail()
    .withMessage('邮箱格式不正确'),
  // 验证密码
  body('password').trim().not().isEmpty().withMessage('密码不能为空'),
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '登录失败',
        detail: errors.array()
      });
      return;
    }
    next();
  },
  // 验证邮箱是否已被注册
  body('email')
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value
        // 在这里加入 password 字段查询没有用，因为模型中没有返回 password
      }).select(['username', 'email', 'bio', 'image', 'password']);

      if (!user) {
        return Promise.reject('该邮箱还未注册');
      } else {
        // 如果查到了，将用户信息放到 req 上以便后边的中间件处理程序使用
        // 放到 req 上的属性，在一个完整请求周期内可用
        req.user = user;
      }
    }),
  // 验证错误处理
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        message: '登录失败',
        detail: errors.array()
      });
      return;
    }

    next();
  },
  // 验证密码是否正确
  (req, res, next) => {
    console.log('user', req.user);

    // 判断密码
    if (md5(req.body.password) !== req.user.password) {
      res.status(400).json({
        statusCode: 400,
        message: '登录失败',
        detail: ['密码有误']
      });
      return;
    }
    next();
  },
  // 开始登录
  async (req, res, next) => {
    // 生成 Token
    const token = await sign(
      {
        userId: req.user._id
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
      username: req.user.username,
      email: req.user.email,
      bio: req.user.bio,
      image: req.user.image,
      token
    };

    res.status(200).json({
      statusCode: 200,
      message: '登录成功',
      data
    });
  }
);

module.exports = router;
