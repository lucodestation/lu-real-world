const app = require('./api/index.js');

const host = 'localhost';
const port = 3030;
app.listen({ host, port }, () => {
  console.log(`服务器运行在 http://${host}:${port}`);
});
