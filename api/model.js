// 用于操作 MongoDB 数据库
const mongoose = require('mongoose');
const crypto = require('crypto'); // Node.js 原生

const md5 = (str) => {
  return crypto
    .createHash('md5')
    .update(str + 'node') // 盐值
    .digest('hex');
};

// 连接 MongoDB 数据库
mongoose.connect(
  'mongodb://administrat0r:admmin@luxiansheng-shard-00-00.bos7l.mongodb.net:27017,luxiansheng-shard-00-01.bos7l.mongodb.net:27017,luxiansheng-shard-00-02.bos7l.mongodb.net:27017/realworld?ssl=true&replicaSet=atlas-va4gcx-shard-0&authSource=admin&retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

// 当连接失败的时候
db.on('error', (err) => {
  console.log('MongoDB 数据库连接失败', err);
});

// 当连接成功的时候
db.once('open', function () {
  console.log('MongoDB 数据库连接成功');
});

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      // 对 password 的值进行处理，password 的值最终是这里的返回值
      set: (value) => md5(value),
      // 从数据库查询时不返回此项
      // 查询密码仅在登录时使用，可单独获取
      select: false
    },
    bio: {
      // 个人介绍
      type: String,
      default: ''
    },
    image: {
      // 头像
      type: String,
      required: true,
      default: 'https://lu-static.vercel.app/lu-real-world/smileAvatar.svg'
    },
    // 我关注的用户。关注或取消关注一个用户，要从这个数组中添加项或删除项
    follows: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      default: []
    },
    // 是否关注了该用户。在登录状态下获取用户信息时如果关注了该用户，将值改为 `true` ，默认值 `false`
    // following: {
    //   type: Boolean,
    //   required: true,
    //   default: false
    // },
    // // 被关注数量
    // followedCount: {
    //   type: Number,
    //   required: true,
    //   default: 0
    // },
    // // 收藏夹。收藏或取消收藏一篇文章，要从这个数组中添加项或删除项
    // favorites: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: 'Article',
    //   required: true,
    //   default: []
    // },
    createdAt: {
      // 创建时间
      type: Date,
      required: true,
      default: Date.now, // 这里不要加括号
      // 和服务器时差相差 8 小时
      set: (value) => value + 1000 * 60 * 60 * 8
    },
    updatedAt: {
      // 更新时间
      type: Date,
      required: true,
      default: Date.now,
      set: (value) => value + 1000 * 60 * 60 * 8
    }
  },
  {
    // 取消自动生成 __v 字段
    versionKey: false
  }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    // 把 title 中的空格换成短横线 -
    // 查看文章详情时它将显示在地址栏中
    // 如 my article 改成 my-article
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    // 作者，值是 User 的 _id
    author: {
      type: mongoose.Schema.Types.ObjectId, // https://mongoosejs.com/docs/populate.html
      ref: 'User',
      required: true
    },
    tagList: {
      type: [String],
      required: true,
      default: []
    },
    // favorited: {
    //   type: Boolean,
    //   required: true,
    //   default: false
    // },
    // 收藏者
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      default: []
    },
    // favoritesCount: {
    //   type: Number,
    //   required: true,
    //   default: 0
    // },
    // // 评论
    // comments: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   required: true,
    //   default: []
    // },
    createdAt: {
      // 创建时间
      type: Date,
      required: true,
      default: Date.now, // 这里不要加括号
      // 和服务器时差相差 8 小时
      set: (value) => value + 1000 * 60 * 60 * 8
    },
    updatedAt: {
      // 更新时间
      type: Date,
      required: true,
      default: Date.now,
      set: (value) => value + 1000 * 60 * 60 * 8
    }
  },
  {
    // 取消自动生成 __v 字段
    versionKey: false
  }
);

const CommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true
    },
    // 文章 ID
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true
    },
    // 作者 ID
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      // 创建时间
      type: Date,
      required: true,
      default: Date.now, // 这里不要加括号
      // 和服务器时差相差 8 小时
      set: (value) => value + 1000 * 60 * 60 * 8
    },
    updatedAt: {
      // 更新时间
      type: Date,
      required: true,
      default: Date.now,
      set: (value) => value + 1000 * 60 * 60 * 8
    }
  },
  {
    // 取消自动生成 __v 字段
    versionKey: false
  }
);

// 组织导出模型类/构造函数
module.exports = {
  // 这里取名 User 但数据库中的表名是 users
  User: mongoose.model('User', UserSchema),
  Article: mongoose.model('Article', ArticleSchema),
  Comment: mongoose.model('Comment', CommentSchema)
};
