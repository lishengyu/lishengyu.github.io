/**
 * 微信读书数据同步脚本
 * 通过官方 Skill API 拉取书架、阅读进度、阅读统计数据
 * 
 * 使用方式:
 *   node scripts/fetch-weread.js
 * 
 * 环境变量:
 *   WEREAD_API_KEY - 微信读书 API Key (在 https://weread.qq.com/r/weread-skills 获取)
 */

const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const GATEWAY_URL = 'https://i.weread.qq.com/api/agent/gateway';
const SKILL_VERSION = '1.0.3';
const OUTPUT_FILE = path.join(__dirname, '..', 'js', 'weread-data.json');

const API_KEY = process.env.WEREAD_API_KEY;

if (!API_KEY) {
    console.error('❌ 未设置 WEREAD_API_KEY 环境变量');
    console.error('   请访问 https://weread.qq.com/r/weread-skills 获取 API Key');
    process.exit(1);
}

// ========== 工具函数 ==========
async function callApi(apiName, params = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_name: apiName,
                skill_version: SKILL_VERSION,
                ...params,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errcode && data.errcode !== 0) {
            throw new Error(`API Error [${data.errcode}]: ${data.errmsg || '未知错误'}`);
        }

        return data;
    } finally {
        clearTimeout(timeout);
    }
}

// ========== 数据拉取 ==========
async function fetchShelf() {
    console.log('📚 正在获取书架数据...');
    const data = await callApi('/shelf/sync');

    const books = (data.books || []).map(book => ({
        bookId: book.bookId,
        title: book.title,
        author: book.author,
        cover: book.cover || '',
        secret: book.secret === 1,
        category: '电子书',
    }));

    const albums = (data.albums || []).map(album => ({
        bookId: album.bookId,
        title: album.title,
        author: album.author,
        cover: album.cover || '',
        secret: (album.albumInfoExtra?.secret) === 1,
        category: '有声书',
    }));

    const hasMP = data.mp && Object.keys(data.mp).length > 0;
    const totalBooks = books.length + albums.length + (hasMP ? 1 : 0);
    const publicCount = books.filter(b => !b.secret).length + albums.filter(a => !a.secret).length;

    console.log(`   ✅ 获取到 ${books.length} 本电子书, ${albums.length} 个有声书, 总计 ${totalBooks} 个条目`);

    return {
        books,
        albums,
        totalBooks,
        publicCount,
        privateCount: totalBooks - publicCount,
        hasMP,
        archive: data.archive || [],
        syncedAt: new Date().toISOString(),
    };
}

async function fetchProgress(bookIds) {
    console.log('📖 正在获取阅读进度...');
    const progressMap = {};

    // 批量获取进度（最多50本，超时时间放宽到60s）
    const ids = bookIds.slice(0, 50);
    for (const bookId of ids) {
        try {
            const data = await callApi('/book/getprogress', { bookId });
            progressMap[bookId] = {
                progress: data.progress || 0,
                chapterUid: data.chapterUid,
                chapterOffset: data.chapterOffset,
                chapterTitle: data.chapterTitle || '',
                lastRead: data.lastReadTime || data.timestamp || 0,
            };
        } catch (e) {
            // 单本书获取失败不影响整体
            progressMap[bookId] = { progress: 0, lastRead: 0 };
        }
    }

    console.log(`   ✅ 获取了 ${Object.keys(progressMap).length} 本书的阅读进度`);
    return progressMap;
}

async function fetchReadStats() {
    console.log('📊 正在获取阅读统计...');
    try {
        const data = await callApi('/readdata/detail');
        console.log('   ✅ 阅读统计获取成功');
        return data;
    } catch (e) {
        console.warn('   ⚠️ 阅读统计获取失败:', e.message);
        return null;
    }
}

// ========== 主流程 ==========
async function main() {
    console.log('🔄 开始同步微信读书数据...\n');

    try {
        // 1. 获取书架
        const shelf = await fetchShelf();

        // 2. 获取阅读进度
        const allBookIds = [
            ...shelf.books.map(b => b.bookId),
            ...shelf.albums.map(a => a.bookId),
        ];
        const progress = await fetchProgress(allBookIds);

        // 3. 合并进度到书籍数据
        const booksWithProgress = shelf.books.map(book => ({
            ...book,
            progress: progress[book.bookId]?.progress || 0,
            chapterTitle: progress[book.bookId]?.chapterTitle || '',
            lastRead: progress[book.bookId]?.lastRead || 0,
        }));
        const albumsWithProgress = shelf.albums.map(album => ({
            ...album,
            progress: progress[album.bookId]?.progress || 0,
            chapterTitle: progress[album.bookId]?.chapterTitle || '',
            lastRead: progress[album.bookId]?.lastRead || 0,
        }));

        // 4. 按进度和最近阅读排序分组
        const reading = [...booksWithProgress, ...albumsWithProgress]
            .filter(item => item.progress > 0 && item.progress < 100)
            .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));

        const finished = [...booksWithProgress, ...albumsWithProgress]
            .filter(item => item.progress >= 100)
            .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));

        const unread = [...booksWithProgress, ...albumsWithProgress]
            .filter(item => item.progress === 0)
            .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));

        // 5. 获取阅读统计
        const stats = await fetchReadStats();

        // 6. 构建输出数据
        const outputData = {
            syncedAt: shelf.syncedAt,
            summary: {
                totalBooks: shelf.totalBooks,
                publicCount: shelf.publicCount,
                privateCount: shelf.privateCount,
                readingCount: reading.length,
                finishedCount: finished.length,
                unreadCount: unread.length,
            },
            reading,
            finished,
            unread,
            stats: stats ? {
                totalReadTime: stats.totalReadTime || stats.readTime || 0,
                totalReadDays: stats.totalReadDays || stats.readDays || 0,
                readBooksCount: stats.readBooksCount || 0,
                notesCount: stats.notesCount || 0,
            } : null,
        };

        // 7. 写入文件
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
        console.log(`\n✅ 数据已写入: ${OUTPUT_FILE}`);
        console.log(`   在读书籍: ${reading.length} 本`);
        console.log(`   已读完: ${finished.length} 本`);
        console.log(`   未开始: ${unread.length} 本`);

    } catch (error) {
        console.error('\n❌ 同步失败:', error.message);
        process.exit(1);
    }
}

main();
