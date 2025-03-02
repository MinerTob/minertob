// 客户端JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    console.log('网页已加载完成');
    
    // 添加目录浏览增强功能
    enhanceDirectoryBrowsing();
    
    // 函数：增强目录浏览体验
    function enhanceDirectoryBrowsing() {
        // 检查是否在目录浏览页面
        const isDirectoryPage = document.querySelector('h1') && 
                               document.querySelector('h1').textContent.includes('目录');
        
        if (!isDirectoryPage) {
            return; // 不是目录页面，不做处理
        }
        
        // 为目录中的链接添加样式和点击效果
        const links = document.querySelectorAll('ul a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent;
            
            // 根据链接文本判断是否为目录（以/结尾）
            if (text.endsWith('/')) {
                link.classList.add('dir-link');
            } else {
                // 根据文件扩展名添加不同的图标类
                const extension = href.split('.').pop().toLowerCase();
                link.classList.add('file-link');
                
                if (['mp3', 'flac', 'wav', 'ogg', 'm4a'].includes(extension)) {
                    link.classList.add('music-file');
                } else if (['lrc', 'txt'].includes(extension)) {
                    link.classList.add('lyrics-file');
                }
            }
        });
        
        // 为返回上级目录链接添加样式
        const parentLinks = document.querySelectorAll('p a');
        parentLinks.forEach(link => {
            if (link.textContent.includes('返回上级')) {
                link.classList.add('parent-dir');
            }
        });
        
        // 添加音乐文件预览功能
        addMusicPreview();
    }
    
    // 函数：添加音乐预览功能
    function addMusicPreview() {
        // 查找所有音乐文件链接
        const musicLinks = document.querySelectorAll('.music-file');
        
        // 为每个音乐文件添加预览功能
        musicLinks.forEach(link => {
            // 创建预览按钮
            const previewBtn = document.createElement('button');
            previewBtn.innerText = '▶';
            previewBtn.className = 'preview-btn';
            previewBtn.title = '预览';
            
            // 将按钮添加到链接旁边
            link.parentNode.appendChild(previewBtn);
            
            // 当点击预览按钮时
            previewBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 获取音乐文件路径
                const musicPath = link.getAttribute('href');
                
                // 移除之前的播放器（如果有）
                const existingPlayer = document.querySelector('.music-preview');
                if (existingPlayer) {
                    existingPlayer.remove();
                }
                
                // 创建音频播放器
                const audioPlayer = document.createElement('audio');
                audioPlayer.controls = true;
                audioPlayer.className = 'music-preview';
                audioPlayer.src = musicPath;
                
                // 添加到链接下方
                link.parentNode.appendChild(audioPlayer);
                
                // 播放音乐
                audioPlayer.play();
                
                // 尝试加载对应的歌词文件
                tryLoadLyrics(musicPath);
            });
        });
    }
    
    // 函数：尝试加载歌词文件
    function tryLoadLyrics(musicPath) {
        // 从音乐路径中提取文件名（不含扩展名）
        const fileName = musicPath.split('/').pop().split('.')[0];
        
        // 构建可能的歌词文件路径
        const possibleLyricsPaths = [
            `/assets/lyrics/${fileName}.lrc`,
            `/assets/lyrics/${fileName}.txt`,
            musicPath.replace(/\.[^/.]+$/, ".lrc") // 同目录下的同名lrc
        ];
        
        // 尝试加载第一个可用的歌词文件
        tryNextLyricsPath(possibleLyricsPaths, 0);
    }
    
    // 函数：递归尝试加载歌词文件路径
    function tryNextLyricsPath(paths, index) {
        if (index >= paths.length) {
            console.log('没有找到对应的歌词文件');
            return; // 所有路径都尝试过了，放弃
        }
        
        fetch(paths[index])
            .then(response => {
                if (!response.ok) {
                    throw new Error('歌词文件不存在');
                }
                return response.text();
            })
            .then(lyrics => {
                displayLyrics(lyrics);
            })
            .catch(error => {
                // 尝试下一个路径
                tryNextLyricsPath(paths, index + 1);
            });
    }
    
    // 函数：显示歌词
    function displayLyrics(lyricsText) {
        // 移除之前的歌词显示（如果有）
        const existingLyrics = document.querySelector('.lyrics-display');
        if (existingLyrics) {
            existingLyrics.remove();
        }
        
        // 创建歌词显示容器
        const lyricsContainer = document.createElement('div');
        lyricsContainer.className = 'lyrics-display';
        
        // 格式化歌词文本（简单实现，可以根据需要扩展为更复杂的lrc解析器）
        const formattedLyrics = lyricsText
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('[ti:') && !line.startsWith('[ar:'))
            .map(line => {
                // 移除时间戳（如果有）
                const withoutTimestamp = line.replace(/\[\d+:\d+\.\d+\]/g, '');
                return `<p>${withoutTimestamp.trim()}</p>`;
            })
            .join('');
        
        // 设置歌词内容
        lyricsContainer.innerHTML = `
            <h3>歌词</h3>
            <div class="lyrics-text">${formattedLyrics}</div>
        `;
        
        // 添加到音乐预览播放器下方
        const audioPlayer = document.querySelector('.music-preview');
        if (audioPlayer) {
            audioPlayer.parentNode.appendChild(lyricsContainer);
        }
    }
});