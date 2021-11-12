const express = require('express');
const app = express();
const morgan = require('morgan'); // 用于输出请求日志
const cors = require('cors'); // 用于允许跨域
const util = require('util');

// 连接 MongoDB 数据库
require('./model');

// 使用中间件。输出请求日志
// 如 GET /api/profiles/tom 200 87.304 ms - 14
// 请求方法 请求路由 状态码 响应时间 响应数据大小
app.use(morgan('dev'));

// 使用中间件。允许跨域
app.use(cors());

// 使用内置中间件。用于解析请求体中的 json 数据，解析的数据使用 req.body 获取
// 提示：请求中 url 上的查询字符串使用 req.query 获取
// 请求中 url 上的 :xxx 使用 req.params.xxx （或 req.param(xxx)） 获取
app.use(express.json());

// 使用内置中间件。用于解析请求体为 application/x-www-form-urlencoded 的数据，解析的数据使用 req.body 获取
app.use(express.urlencoded({ extended: false }));

// 使用内置中间件。用于托管静态资源
// app.use(express.static('../public'));

// 挂载路由，将所有 /api 开头的请求都交给 router 路由中间件处理
app.use('/api', require('./router'));

// app.get('/test', (req, res, next) => {
//   res.status(200).json({
//     message: '返回的信息'
//   });
// });

// 挂载统一处理服务器错误中间件
// 要放到所有请求最后边
// next() 进入下一个中间件
// next('route') 跳过所在处理程序之后的同一路由的所有中间件
// next(其他内容) 进入错误处理程序
app.use((err, req, res, next) => {
  res.status(500).json({
    error: '服务器未知错误',
    detail: util.format(err)
  });
});

module.exports = app;
