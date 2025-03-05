const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 提供静态文件访问
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 首页路由
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>云音乐资源</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #333;
          }
          .section {
            margin-bottom: 30px;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin-bottom: 10px;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>云音乐资源</h1>
        
        <div class="section">
          <h2>歌词文件</h2>
          <ul>
            <li><a href="/assets/lyrics/Counting_Stars.lrc">Counting Stars</a></li>
            <li><a href="/assets/lyrics/Heal_The_World.lrc">Heal The World</a></li>
            <li><a href="/assets/lyrics/在银河中孤独摇摆.lrc">在银河中孤独摇摆</a></li>
            <li><a href="/assets/lyrics/花海.lrc">花海</a></li>
            <li><a href="/assets/lyrics/蒲公英的约定.lrc">蒲公英的约定</a></li>
          </ul>
        </div>
        
        <div class="section">
          <h2>音乐文件</h2>
          <p>音乐文件可通过 /assets/music/ 路径访问</p>
        </div>
        
        <p>直链格式: https://[域名]/assets/lyrics/[文件名].lrc 或 https://[域名]/assets/music/[文件名].[扩展名]</p>
      </body>
    </html>
  `);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});