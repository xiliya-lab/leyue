document.addEventListener('DOMContentLoaded', () => {
    // 导航切换逻辑
    const navCreator = document.getElementById('nav-creator');
    const navReader = document.getElementById('nav-reader');
    const viewCreator = document.getElementById('creator-view');
    const viewReader = document.getElementById('reader-view');

    const switchView = (target) => {
        if (target === 'creator') {
            navCreator.classList.add('active');
            navReader.classList.remove('active');
            viewCreator.classList.replace('hidden', 'active');
            viewReader.classList.replace('active', 'hidden');
        } else {
            navReader.classList.add('active');
            navCreator.classList.remove('active');
            viewReader.classList.replace('hidden', 'active');
            viewCreator.classList.replace('active', 'hidden');
            loadReaderContent(); // 切换到阅读模式时拉取最新数据
        }
    };

    navCreator.addEventListener('click', () => switchView('creator'));
    navReader.addEventListener('click', () => switchView('reader'));

    // --- 模拟 AI 创作流 ---
    const btnGenerate = document.getElementById('btn-generate');
    const blocksContainer = document.getElementById('draft-blocks');

    btnGenerate.addEventListener('click', () => {
        const prompt = document.getElementById('chapter-prompt').value;
        if (!prompt) return alert('请先输入你的方向');
        
        btnGenerate.innerText = 'AI 正在生成...';
        
        // 模拟调用 LLM API，返回块级数据
        setTimeout(() => {
            blocksContainer.innerHTML = `
                <div class="draft-block" contenteditable="true" data-block-id="1">
                    风是从北边吹来的，带着一丝不易察觉的寒意。主角裹紧了斗篷，抬头看向那座隐藏在迷雾中的小镇。
                </div>
                <div class="draft-block" contenteditable="true" data-block-id="2">
                    镇口的木牌已经腐朽，上面隐约刻着“阿卡姆”。街边，一个神秘的商人正在摆弄着他那堆稀奇古怪的商品，看到有人走近，商人露出了诡异的笑容。
                </div>
            `;
            btnGenerate.innerText = 'AI 生成草稿';
            
            // 将初步生成的草稿结构异步存入草稿库
            saveToDB('workspace_drafts', { 
                chapterId: 1, 
                blocks: blocksContainer.innerHTML 
            });
        }, 1500);
    });

    // --- 封装备份到阅读区 ---
    const btnSavePublish = document.getElementById('btn-save-publish');
    btnSavePublish.addEventListener('click', async () => {
        // 提取块级编辑器中的纯文本，组合为段落
        const blocks = document.querySelectorAll('.draft-block');
        let finalHtml = '';
        blocks.forEach(block => {
            // 过滤掉占位符，转化为段落 <p>
            if (!block.classList.contains('placeholder-block')) {
                finalHtml += `<p>${block.innerText.trim()}</p >`;
            }
        });

        if (!finalHtml) return alert('没有可保存的内容');

        // 执行异步事务，写入发布表
        await saveToDB('published_chapters', {
            chapterId: 1,
            title: '第一章：初始之风',
            content: finalHtml,
            timestamp: Date.now()
        });

        alert('已固化并保存至沉浸阅读区！');
        switchView('reader');
    });

    // --- 拉取阅读器数据 ---
    const loadReaderContent = async () => {
        const readerContent = document.getElementById('reader-content');
        const data = await getFromDB('published_chapters', 1);
        
        if (data && data.content) {
            readerContent.innerHTML = data.content;
        } else {
            readerContent.innerHTML = '<p style="text-align:center; color:var(--text-muted);">暂无内容，请先在创作面板生成并保存。</p >';
        }
    };
});