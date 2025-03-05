const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 文件夹内容显示中间件
app.use('/assets/:folder', (req, res, next) => {
  const folder = req.params.folder;
  // 只处理music和lyrics文件夹的根路径请求
  if ((folder === 'music' || folder === 'lyrics') && req.path === '/') {
    const folderPath = path.join(__dirname, 'assets', folder);
    
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('读取文件夹错误:', err);
        return next();
      }
      
      // 生成HTML页面显示文件列表
      const fileLinks = files.map(file => 
        `<li><a href="/assets/${folder}/${file}">${file}</a></li>`
      ).join('');
      
      res.send(`
        <html>
          <head>
            <title>${folder === 'music' ? '音乐' : '歌词'}文件列表</title>
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
              .back {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>${folder === 'music' ? '音乐' : '歌词'}文件列表</h1>
            <ul>
              ${fileLinks}
            </ul>
            <div class="back">
              <a href="/">返回首页</a>
            </div>
          </body>
        </html>
      `);
    });
  } else {
    next();
  }
});

// 专门用于文件下载的路由
app.get('/download/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  
  // 安全检查：确保只能访问music和lyrics文件夹
  if (folder !== 'music' && folder !== 'lyrics') {
    return res.status(403).send('访问被拒绝');
  }
  
  const filePath = path.join(__dirname, 'assets', folder, filename);
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('文件不存在');
    }
    
    // 获取文件信息
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return res.status(500).send('无法获取文件信息');
      }
      
      // 设置正确的Content-Type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream'; // 默认二进制流
      
      if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.flac') contentType = 'audio/flac';
      else if (ext === '.wav') contentType = 'audio/wav';
      else if (ext === '.ogg') contentType = 'audio/ogg';
      else if (ext === '.lrc') contentType = 'text/plain';
      
      // 设置响应头
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      
      // 创建文件读取流并直接传输到响应
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // 处理错误
      fileStream.on('error', (error) => {
        console.error('文件流错误:', error);
        if (!res.headersSent) {
          res.status(500).send('文件传输错误');
        }
      });
    });
  });
});

// 提供静态文件访问 (仍然保留，但主要用于其他静态资源)
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
            <li><a href="/assets/lyrics/">查看所有歌词文件</a></li>
          </ul>
        </div>
        
        <div class="section">
          <h2>音乐文件</h2>
          <ul>
            <li><a href="/assets/music/">查看所有音乐文件</a></li>
          </ul>
        </div>
        
        <p>直链格式: https://[域名]/download/lyrics/[文件名].lrc 或 https://[域名]/download/music/[文件名].[扩展名]</p>
      </body>
    </html>
  `);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});