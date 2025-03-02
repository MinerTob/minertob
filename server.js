const express = require('express');
const path = require('path');
const fs = require('fs');

// 创建Express应用
const app = express();

// 设置MIME类型
app.use((req, res, next) => {
    const url = req.url.replace(/\\/g, '/'); // 将反斜杠替换为正斜杠
    req.url = url;
    next();
});

// 静态文件服务：将assets目录下的所有文件提供为静态资源
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 首页路由 - 提供index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理/assets及其子目录路径 - 显示目录内容
app.get('/assets*', (req, res, next) => {
    // 如果是直接访问具体文件，让静态文件中间件处理
    const reqPath = req.path;
    const localPath = path.join(__dirname, reqPath);
    
    fs.stat(localPath, (err, stats) => {
        if (err || !stats.isDirectory()) {
            return next(); // 不是目录或不存在，交给下一个处理器
        }
        
        // 是目录，列出内容
        fs.readdir(localPath, (err, files) => {
            if (err) {
                return res.status(500).send('读取目录失败');
            }
            
            let html = `<h1>${reqPath} 目录</h1>`;
            // 添加返回上级目录链接
            if (reqPath !== '/assets') {
                const parentPath = path.dirname(reqPath);
                html += `<p><a href="${parentPath}">返回上级目录</a></p>`;
            }
            
            html += '<ul>';
            files.forEach(file => {
                const filePath = path.join(localPath, file);
                let isDir = false;
                
                try {
                    isDir = fs.statSync(filePath).isDirectory();
                } catch (e) {
                    // 忽略错误
                }
                
                const displayName = isDir ? file + '/' : file;
                html += `<li><a href="${path.posix.join(reqPath, file)}">${displayName}</a></li>`;
            });
            html += '</ul>';
            
            res.send(html);
        });
    });
});

// 设置404处理
app.use((req, res) => {
    console.log(`文件未找到: ${req.url}`);
    res.status(404).send(`文件未找到: ${req.url}`);
});

// 设置端口并启动服务器
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`服务器已启动，访问 http://127.0.0.1:${PORT}`);
});