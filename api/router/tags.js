const express = require('express');
const router = express.Router();

const { Article } = require('../model.js');

// GET /api/tags 获取标签  Token 不需要
router.get('/', async (req, res, next) => {
  const tags = await Article.find().select(['tagList', '-_id']);
  console.log(tags);

  /*
        [
          { tagList: [ 'vue', 'javascript' ] },
          { tagList: [ 'css', 'javascript' ] },
        ]
  */
  // 从上面的结构中提取数组项
  // flat 扁平化
  // Array.from(new Set(arr)) 去重
  const data = Array.from(new Set(tags.map((item) => item.tagList).flat(1)));

  res.status(200).json({
    statusCode: 200,
    message: 'success',
    data
  });
});

module.exports = router;
