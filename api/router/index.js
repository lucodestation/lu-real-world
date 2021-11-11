// /api 路由进到这里

const express = require('express');
const router = express.Router();

// 过滤空字符串可选字段，如果是空字符串，会覆盖默认值，所以要过滤一下
// 如 bio、image 等字段如果是空字符串将会被 delete
// 如果是字符串，把空格也过滤掉
router.use('/', (req, res, next) => {
  // console.log('req.body.username', req.body.username);
  // delete req.body.username;
  // console.log('req.body.username', req.body.username);

  const filterEmptyField = (object) => {
    for (const prop in object) {
      if (typeof object[prop] === 'string') {
        object[prop] = object[prop].trim(); // 去除空格
      }
      if (!object[prop]) {
        delete object[prop]; // 如果值为空，将其删除
      }
    }
  };

  filterEmptyField(req.body);
  filterEmptyField(req.params);
  filterEmptyField(req.query);
  next();
});

router.use('/users', require('./users'));
router.use('/user', require('./user'));
router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));
router.use('/tags', require('./tags'));

module.exports = router;
