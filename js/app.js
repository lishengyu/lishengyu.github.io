/**
 * Main Application Logic
 * Handles routing, theme toggle, and dynamic content rendering
 */

// ========== Router ==========
class Router {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigate(hash, false);
    }

    navigate(page, updateHash = true) {
        if (updateHash) {
            window.location.hash = page;
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target page
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.style.animation = 'none';
            targetPage.offsetHeight; // trigger reflow
            targetPage.style.animation = 'fadeInUp 0.5s ease-out';
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll(`.nav-link[href="#${page}"]`).forEach(link => {
            link.classList.add('active');
        });

        // Close mobile menu
        document.getElementById('mobile-menu')?.classList.add('hidden');

        // Update page title
        const titles = {
            home: 'My Personal Website',
            blog: '博客文章',
            projects: '项目展示',
            reading: '微信读书',
            learning: '学习计划',
            life: '日常生活',
            about: '关于我'
        };
        document.title = `${titles[page] || 'My Personal Website'} | My Personal Website`;

        this.currentPage = page;
    }
}

// ========== Theme Manager ==========
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggle());
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }
}

// ========== Blog Renderer ==========
class BlogRenderer {
    constructor() {
        this.currentTag = 'all';
        this.init();
    }

    init() {
        this.renderTags();
        this.renderPosts();
        this.setupTagFilter();
    }

    getFilteredPosts() {
        if (this.currentTag === 'all') return blogPosts;
        return blogPosts.filter(post => post.tags.includes(this.currentTag));
    }

    renderTags() {
        const tagsContainer = document.getElementById('blog-tags');
        if (!tagsContainer) return;

        const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn px-4 py-2 rounded-full text-sm font-medium transition-all';
            btn.dataset.tag = tag;
            btn.textContent = tag;
            tagsContainer.appendChild(btn);
        });
    }

    setupTagFilter() {
        document.getElementById('blog-tags')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;

            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentTag = btn.dataset.tag;
            this.renderPosts();
        });
    }

    renderPosts() {
        const listContainer = document.getElementById('blog-list');
        if (!listContainer) return;

        const posts = this.getFilteredPosts();
        listContainer.innerHTML = posts.map(post => `
            <article class="post-card">
                <div class="post-date">${this.formatDate(post.date)}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="flex flex-wrap gap-2 mt-4">
                    ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                </div>
            </article>
        `).join('');
    }

    renderLatestPosts() {
        const container = document.getElementById('latest-posts');
        if (!container) return;

        const latest = blogPosts.slice(0, 3);
        container.innerHTML = latest.map(post => `
            <article class="post-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="post-tag">${post.tags[0]}</span>
                    <span class="text-sm text-gray-500">${this.formatDate(post.date)}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt mt-2">${post.excerpt}</p>
            </article>
        `).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// ========== Projects Renderer ==========
class ProjectsRenderer {
    constructor() {
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        grid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-image">${project.icon}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.demoUrl}" target="_blank">🔗 在线预览</a>
                        <a href="${project.codeUrl}" target="_blank">💻 源代码</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ========== Skills Renderer ==========
class SkillsRenderer {
    constructor() {
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const container = document.getElementById('skills-list');
        if (!container) return;

        container.innerHTML = skills.map(skill => `
            <span class="skill-badge">${skill}</span>
        `).join('');
    }
}

// ========== Reading (WeRead) Renderer ==========
class ReadingRenderer {
    constructor() {
        this.data = null;
        this.currentTag = 'all';
        this.currentCategory = null;
        this.searchQuery = '';
        this.currentSort = 'default';
        this.refreshing = false;
        this.init();
    }

    async init() {
        await this.loadData();
        if (this.data) {
            this.renderStats();
            this.renderCategoryTags();
            this.renderBooks();
            this.renderSyncTime();
            this.setupTagFilter();
            this.setupSearch();
            this.setupSort();
        }
        this.hideLoading();
        this.setupRefresh();
    }

    async loadData() {
        try {
            // 添加时间戳避免浏览器缓存
            const url = wereadDataUrl + '?t=' + Date.now();
            const response = await fetch(url);
            if (!response.ok) throw new Error('Data file not found');
            this.data = await response.json();
        } catch (e) {
            console.warn('微信读书数据加载失败，使用空数据:', e.message);
            this.data = null;
        }
    }

    hideLoading() {
        const loading = document.getElementById('reading-loading');
        if (loading) loading.classList.add('hidden');

        if (!this.data || (this.data.reading?.length === 0 && this.data.finished?.length === 0 && this.data.unread?.length === 0)) {
            const empty = document.getElementById('reading-empty');
            if (empty) empty.classList.remove('hidden');
        }
    }

    setupRefresh() {
        const btn = document.getElementById('reading-refresh-btn');
        if (!btn) return;
        btn.addEventListener('click', () => this.refresh());
    }

    async refresh() {
        if (this.refreshing) return;
        this.refreshing = true;

        const btn = document.getElementById('reading-refresh-btn');
        const icon = btn?.querySelector('.refresh-icon');
        const text = btn?.querySelector('span');

        // 启动旋转动画
        if (icon) icon.classList.add('spinning');
        if (text) text.textContent = '同步中...';
        if (btn) btn.disabled = true;

        try {
            await this.loadData();
            if (this.data) {
                this.renderStats();
                this.renderBooks();
                this.renderSyncTime();
            }
            this.hideLoading();
        } catch (e) {
            console.error('刷新失败:', e);
        } finally {
            this.refreshing = false;
            if (icon) icon.classList.remove('spinning');
            if (text) text.textContent = '刷新';
            if (btn) btn.disabled = false;
        }
    }

    renderSyncTime() {
        const el = document.getElementById('reading-sync-time');
        if (!el) return;
        if (!this.data || !this.data.syncedAt) {
            el.textContent = '';
            return;
        }
        try {
            const date = new Date(this.data.syncedAt);
            const timeStr = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            el.textContent = '同步于 ' + timeStr;
        } catch (e) {
            el.textContent = '';
        }
    }

    renderStats() {
        const container = document.getElementById('reading-stats');
        if (!container || !this.data) return;

        const s = this.data.summary;
        const st = this.data.stats || {};
        const stats = [
            { value: s.totalBooks || 0, label: '书架总计', icon: '📚', color: 'indigo' },
            { value: s.readingCount || 0, label: '在读', icon: '📖', color: 'cyan' },
            { value: s.finishedCount || 0, label: '已读完', icon: '✅', color: 'emerald' },
            { value: s.unreadCount || 0, label: '未开始', icon: '📕', color: 'slate' },
        ];

        // 如果有阅读统计数据，追加展示
        if (st.totalReadDays) {
            stats.push({ value: st.totalReadDays, label: '阅读天数', icon: '📅', color: 'amber' });
        }
        if (st.readBooksCount) {
            stats.push({ value: st.readBooksCount, label: '读完本数', icon: '🏆', color: 'rose' });
        }
        if (st.notesCount) {
            stats.push({ value: st.notesCount, label: '笔记条数', icon: '📝', color: 'violet' });
        }

        container.className = `grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4 mb-10`;

        container.innerHTML = stats.map(stat => `
            <div class="stat-card stat-card-${stat.color}">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    getAllBooks() {
        if (!this.data) return [];
        const reading = (this.data.reading || []).map(b => ({ ...b, status: 'reading' }));
        const finished = (this.data.finished || []).map(b => ({ ...b, status: 'finished' }));
        const unread = (this.data.unread || []).map(b => ({ ...b, status: 'unread' }));
        return [...reading, ...finished, ...unread];
    }

    getFilteredBooks() {
        let all = this.getAllBooks();
        // 状态筛选
        if (this.currentTag !== 'all') {
            all = all.filter(b => b.status === this.currentTag);
        }
        // 分类筛选
        if (this.currentCategory) {
            all = all.filter(b => b.category === this.currentCategory);
        }
        // 搜索过滤
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            all = all.filter(b =>
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q))
            );
        }
        // 排序
        all = this.sortBooks(all);
        return all;
    }

    sortBooks(books) {
        switch (this.currentSort) {
            case 'title':
                // 按书名排序（忽略大小写）
                return [...books].sort((a, b) => {
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return titleA.localeCompare(titleB, 'zh-CN');
                });
            case 'progress':
                // 按阅读进度降序（进度高的在前）
                return [...books].sort((a, b) => (b.progress || 0) - (a.progress || 0));
            case 'category':
                // 按分类排序，同类内按书名排序
                return [...books].sort((a, b) => {
                    const catA = a.category || '';
                    const catB = b.category || '';
                    if (catA !== catB) return catA.localeCompare(catB, 'zh-CN');
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return titleA.localeCompare(titleB, 'zh-CN');
                });
            default:
                // 默认排序：按状态分组（在读 > 已读完 > 未开始），同状态按进度降序
                return [...books].sort((a, b) => {
                    const statusOrder = { reading: 0, finished: 1, unread: 2 };
                    const orderDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
                    if (orderDiff !== 0) return orderDiff;
                    return (b.progress || 0) - (a.progress || 0);
                });
        }
    }

    renderCategoryTags() {
        const container = document.getElementById('reading-category-tags');
        if (!container || !this.data) return;

        const categories = [...new Set(this.getAllBooks().map(b => b.category).filter(Boolean))];
        if (categories.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = categories.map(cat => `
            <button class="tag-btn px-4 py-2 rounded-full text-sm font-medium transition-all" data-category="${this.escapeAttr(cat)}">
                ${this.escapeHtml(cat)}
            </button>
        `).join('');

        // 绑定分类筛选事件
        let activeCategory = null;
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;

            // 切换：点击同一个取消选中
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                this.currentCategory = null;
            } else {
                container.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
            }
            this.renderBooks();
        });
    }

    setupSearch() {
        const input = document.getElementById('reading-search');
        const clearBtn = document.getElementById('reading-search-clear');
        if (!input) return;

        // 实时搜索（防抖 250ms）
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.searchQuery = input.value.trim();
                if (clearBtn) {
                    clearBtn.classList.toggle('hidden', !this.searchQuery);
                }
                this.renderBooks();
            }, 250);
        });

        // 清除按钮
        clearBtn?.addEventListener('click', () => {
            input.value = '';
            this.searchQuery = '';
            clearBtn.classList.add('hidden');
            this.renderBooks();
            input.focus();
        });
    }

    setupTagFilter() {
        document.getElementById('reading-tags')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;
            document.querySelectorAll('#reading-tags .tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentTag = btn.dataset.tag;
            this.renderBooks();
        });
    }

    setupSort() {
        document.getElementById('reading-sort')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.sort-btn');
            if (!btn) return;
            document.querySelectorAll('#reading-sort .sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentSort = btn.dataset.sort;
            this.renderBooks();
        });
    }

    renderBooks() {
        const container = document.getElementById('reading-list');
        const countEl = document.getElementById('reading-result-count');
        if (!container) return;

        const books = this.getFilteredBooks();
        if (countEl) {
            countEl.textContent = books.length > 0 ? `共 ${books.length} 本书` : '';
        }

        if (books.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full py-8">暂无匹配的书籍</p>';
            return;
        }

        container.innerHTML = books.map(book => this.renderBookCard(book)).join('');
    }

    renderBookCard(book) {
        const pct = Math.min(100, Math.max(0, book.progress || 0));
        const statusLabel = { reading: '在读', finished: '已读完', unread: '未开始' };
        const actualStatus = pct >= 100 ? 'finished' : pct > 0 ? 'reading' : 'unread';

        let progressClass = 'low';
        if (pct >= 100) progressClass = 'done';
        else if (pct >= 70) progressClass = 'high';
        else if (pct >= 30) progressClass = 'mid';

        const hasCover = book.cover && book.cover.startsWith('http');
        const coverChar = (book.title || '书').charAt(0);

        return `
            <div class="book-card">
                <div class="book-card-top">
                    <div class="book-cover ${hasCover ? 'has-cover' : ''}">
                        ${hasCover ? `<img src="${this.escapeAttr(book.cover)}" alt="${this.escapeAttr(book.title)}" loading="lazy" onerror="this.parentElement.classList.remove('has-cover');this.parentElement.textContent='${coverChar}'">` : coverChar}
                    </div>
                    <div class="book-info">
                        <div class="book-title" title="${this.escapeHtml(book.title)}">${this.escapeHtml(book.title)}</div>
                        <div class="book-author">${this.escapeHtml(book.author || '未知作者')}</div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="book-status ${actualStatus}">${statusLabel[actualStatus]}</span>
                            ${book.category ? `<span class="book-category">${this.escapeHtml(book.category)}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill ${progressClass}" style="width: ${pct}%"></div>
                </div>
                <div class="progress-text">
                    ${pct >= 100 ? '已读完' : `已读 ${pct}%`}
                    ${book.chapterTitle && pct > 0 && pct < 100 ? ` · ${this.escapeHtml(book.chapterTitle)}` : ''}
                </div>
            </div>
        `;
    }

    escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderLatestOnHome() {
        // 首页显示最近在读的3本书
        const container = document.getElementById('latest-reading');
        if (!container || !this.data) return;

        const latest = (this.data.reading || []).slice(0, 3);
        if (latest.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900">📚 最近在读</h2>
                <a href="#reading" class="nav-link text-cyan-600 hover:text-cyan-700 text-sm font-medium">查看全部 &rarr;</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${latest.map(book => this.renderBookCard(book)).join('')}
            </div>
        `;
    }
}

// ========== Learning Renderer ==========
class LearningRenderer {
    constructor() {
        this.plans = [];
        this.currentTag = 'all';
        this.init();
    }

    async init() {
        await this.loadIndex();
        if (this.plans.length > 0) {
            this.renderOverview();
            this.renderTags();
            this.renderPlans();
            this.setupTagFilter();
        }
        this.hideLoading();
    }

    async loadIndex() {
        try {
            const response = await fetch(learningIndexUrl);
            if (!response.ok) throw new Error('Index not found');
            this.plans = await response.json();
        } catch (e) {
            console.warn('学习计划索引加载失败:', e.message);
            this.plans = [];
        }
    }

    hideLoading() {
        const loading = document.getElementById('learning-loading');
        if (loading) loading.classList.add('hidden');

        if (this.plans.length === 0) {
            const empty = document.getElementById('learning-empty');
            if (empty) empty.classList.remove('hidden');
        }
    }

    renderOverview() {
        const container = document.getElementById('learning-overview');
        if (!container) return;

        const total = this.plans.length;
        const totalSteps = this.plans.reduce((sum, p) => sum + (p.totalSteps || 0), 0);
        const avgProgress = total > 0 ? Math.round(this.plans.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;
        const highPriority = this.plans.filter(p => p.priority === 'high').length;

        const items = [
            { value: total, label: '学习计划' },
            { value: highPriority, label: '高优先级' },
            { value: avgProgress + '%', label: '平均进度' },
        ];

        container.innerHTML = items.map(item => `
            <div class="overview-stat">
                <div class="overview-value">${item.value}</div>
                <div class="overview-label">${item.label}</div>
            </div>
        `).join('');
    }

    renderTags() {
        const container = document.getElementById('learning-tags');
        if (!container) return;

        const categories = [...new Set(this.plans.map(p => p.category).filter(Boolean))];
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn px-4 py-2 rounded-full text-sm font-medium transition-all';
            btn.dataset.tag = cat;
            btn.textContent = cat;
            container.appendChild(btn);
        });
    }

    setupTagFilter() {
        document.getElementById('learning-tags')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;
            document.querySelectorAll('#learning-tags .tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentTag = btn.dataset.tag;
            this.renderPlans();
        });
    }

    getFilteredPlans() {
        if (this.currentTag === 'all') return this.plans;
        return this.plans.filter(p => p.category === this.currentTag);
    }

    renderPlans() {
        const container = document.getElementById('learning-list');
        if (!container) return;

        const plans = this.getFilteredPlans();
        if (plans.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">暂无学习计划</p>';
            return;
        }

        container.innerHTML = plans.map(plan => this.renderPlanCard(plan)).join('');

        // Bind click handlers for expand/collapse
        container.querySelectorAll('.plan-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.plan-card');
                const wasExpanded = card.classList.contains('expanded');
                card.classList.toggle('expanded');

                // Load markdown content on first expand
                if (!wasExpanded && card.dataset.loaded !== 'true') {
                    this.loadPlanContent(card, card.dataset.planFile);
                }
            });
        });
    }

    async loadPlanContent(card, file) {
        const contentDiv = card.querySelector('.plan-content');
        if (!contentDiv || !file) return;

        contentDiv.innerHTML = '<div class="text-center py-8 text-gray-500">加载中...</div>';

        try {
            const response = await fetch(`learning/${file}`);
            if (!response.ok) throw new Error('File not found');
            const md = await response.text();

            // Use marked.js to render markdown
            if (typeof marked !== 'undefined') {
                // marked v5+ removed setOptions, use parse() second argument
                const html = marked.parse(md, {
                    gfm: true,
                    breaks: false,
                });
                contentDiv.innerHTML = `<div class="markdown-body">${html}</div>`;
            } else {
                // Fallback: escape and show as pre
                contentDiv.innerHTML = `<pre class="markdown-body">${this.escapeHtml(md)}</pre>`;
            }
            card.dataset.loaded = 'true';
        } catch (e) {
            contentDiv.innerHTML = '<div class="text-center py-8 text-gray-500">内容加载失败</div>';
            console.error('加载学习计划内容失败:', e);
        }
    }

    renderPlanCard(plan) {
        const pct = Math.min(100, Math.max(0, plan.progress || 0));
        const priorityLabel = { high: '高优先级', medium: '中优先级', low: '低优先级' };
        const deadlineDate = plan.deadline ? new Date(plan.deadline) : null;
        const isOverdue = deadlineDate && deadlineDate < new Date();
        const deadlineStr = deadlineDate
            ? deadlineDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
            : '';

        // SVG progress ring
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (pct / 100) * circumference;

        return `
            <div class="plan-card" data-plan-file="${plan.file || ''}" data-loaded="false">
                <div class="plan-header">
                    <div class="plan-info">
                        <div class="plan-title">${this.escapeHtml(plan.title)}</div>
                        <div class="plan-meta">
                            <span class="priority-badge ${plan.priority || 'medium'}">${priorityLabel[plan.priority] || '中优先级'}</span>
                            ${plan.category ? `<span class="plan-tag" style="padding:2px 10px;border-radius:999px;font-size:0.7rem;background:var(--color-bg);color:var(--color-text-secondary);">${this.escapeHtml(plan.category)}</span>` : ''}
                        </div>
                    </div>
                    <div class="progress-ring-container">
                        <svg class="progress-ring" width="56" height="56" viewBox="0 0 56 56">
                            <circle class="bg-circle" cx="28" cy="28" r="${radius}"></circle>
                            <circle class="fg-circle" cx="28" cy="28" r="${radius}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"></circle>
                        </svg>
                        <span class="progress-ring-text">${pct}%</span>
                    </div>
                    <svg class="expand-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                <div class="plan-content">
                    <!-- Markdown content loaded on expand -->
                </div>
                <div class="plan-footer">
                    ${(plan.tags || []).map(tag => `<span class="plan-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    ${deadlineStr ? `<span class="plan-deadline ${isOverdue ? 'overdue' : ''}">📅 ${deadlineStr}${isOverdue ? ' (已逾期)' : ''}</span>` : ''}
                </div>
            </div>
        `;
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
// ========== Life Renderer ==========
class LifeRenderer {
    constructor() {
        this.moments = [];
        this.exercises = [];
        this.goals = {};
        this.currentTab = 'moments';
        this.momentTag = 'all';
        this.exerciseType = 'all';
        this.chartFormat = 'line';
        this.chartInstance = null;
        this.init();
    }

    async init() {
        await Promise.all([this.loadMoments(), this.loadExercises()]);
        this.setupTabs();
        this.renderMomentsStats();
        this.renderMomentsTags();
        this.renderMoments();
        this.renderExerciseStats();
        this.renderExerciseGoals();
        this.renderExerciseFilterTags();
        this.renderExerciseList();
        this.setupChartFormat();
        this.renderChart();
        this.hideLoading();
    }

    async loadMoments() {
        try {
            const response = await fetch(lifeDataUrl + '?t=' + Date.now());
            if (!response.ok) throw new Error('Moments data not found');
            this.moments = await response.json();
            // Sort by date descending
            this.moments.sort((a, b) => b.date.localeCompare(a.date));
        } catch (e) {
            console.warn('随笔数据加载失败:', e.message);
            this.moments = [];
        }
    }

    async loadExercises() {
        try {
            const response = await fetch(exerciseDataUrl + '?t=' + Date.now());
            if (!response.ok) throw new Error('Exercise data not found');
            const data = await response.json();
            this.exercises = data.exercises || [];
            this.goals = data.goals || {};
            // Sort by date descending
            this.exercises.sort((a, b) => b.date.localeCompare(a.date));
        } catch (e) {
            console.warn('运动数据加载失败:', e.message);
            this.exercises = [];
            this.goals = {};
        }
    }

    hideLoading() {
        const loading = document.getElementById('life-loading');
        if (loading) loading.classList.add('hidden');

        if (this.moments.length === 0) {
            document.getElementById('moments-empty')?.classList.remove('hidden');
        }
        if (this.exercises.length === 0) {
            document.getElementById('exercise-empty')?.classList.remove('hidden');
        }
    }

    // ===== Tabs =====
    setupTabs() {
        document.getElementById('life-tabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.life-tab');
            if (!btn) return;

            document.querySelectorAll('.life-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentTab = btn.dataset.tab;

            // Show/hide panels
            document.getElementById('life-panel-moments').classList.toggle('hidden', this.currentTab !== 'moments');
            document.getElementById('life-panel-exercise').classList.toggle('hidden', this.currentTab !== 'exercise');

            // Re-render chart if switching to exercise tab (handles resize)
            if (this.currentTab === 'exercise') {
                setTimeout(() => this.renderChart(), 100);
            }
        });
    }

    // ===== Moments =====
    renderMomentsStats() {
        const container = document.getElementById('moments-stats');
        if (!container) return;

        const total = this.moments.length;
        const allTags = [...new Set(this.moments.flatMap(m => m.tags || []))];
        const thisMonth = this.moments.filter(m => {
            const d = new Date(m.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        const stats = [
            { value: total, label: '全部随笔', icon: '📝', color: 'green' },
            { value: thisMonth, label: '本月记录', icon: '📅', color: 'emerald' },
            { value: allTags.length, label: '话题标签', icon: '🏷️', color: 'cyan' },
            { value: this.moments.filter(m => (m.tags || []).includes('code')).length, label: '技术随笔', icon: '💻', color: 'indigo' },
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-card stat-card-${stat.color}">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    renderMomentsTags() {
        const container = document.getElementById('moments-tags');
        if (!container) return;

        const allTags = [...new Set(this.moments.flatMap(m => m.tags || []))];
        if (allTags.length === 0) return;

        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn px-4 py-2 rounded-full text-sm font-medium transition-all';
            btn.dataset.tag = tag;
            btn.textContent = tag;
            container.appendChild(btn);
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;
            document.querySelectorAll('#moments-tags .tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.momentTag = btn.dataset.tag;
            this.renderMoments();
        });
    }

    getFilteredMoments() {
        if (this.momentTag === 'all') return this.moments;
        return this.moments.filter(m => (m.tags || []).includes(this.momentTag));
    }

    renderMoments() {
        const container = document.getElementById('moments-list');
        if (!container) return;

        const moments = this.getFilteredMoments();
        if (moments.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">暂无匹配的随笔</p>';
            return;
        }

        container.innerHTML = moments.map((m, index) => {
            const date = new Date(m.date);
            const dateStr = date.toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'long', day: 'numeric',
                weekday: 'short'
            });
            return `
                <div class="moment-card" style="animation-delay: ${index * 0.05}s; animation: fadeIn 0.4s ease-out forwards; opacity: 0;">
                    <div class="moment-header">
                        <span class="moment-dot"></span>
                        <span class="moment-date">${dateStr}</span>
                        <div class="moment-tags">
                            ${(m.tags || []).map(tag => `<span class="moment-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="moment-content">${this.escapeHtml(m.content)}</div>
                </div>
            `;
        }).join('');
    }

    // ===== Exercise Stats =====
    renderExerciseStats() {
        const container = document.getElementById('exercise-stats');
        if (!container || this.exercises.length === 0) return;

        const activeEx = this.exercises.filter(e => e.type !== '休息');
        const totalDuration = activeEx.reduce((s, e) => s + (e.duration || 0), 0);
        const totalDistance = activeEx.reduce((s, e) => s + (e.distance || 0), 0);
        const totalCalories = activeEx.reduce((s, e) => s + (e.calories || 0), 0);
        const activeDays = activeEx.length;

        const stats = [
            { value: activeDays, label: '运动天数', icon: '📆', color: 'green' },
            { value: (totalDuration / 60).toFixed(1), label: '总时长(h)', icon: '⏱️', color: 'cyan' },
            { value: totalDistance.toFixed(1), label: '总距离(km)', icon: '📍', color: 'emerald' },
            { value: totalCalories, label: '总消耗(kcal)', icon: '🔥', color: 'amber' },
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-card stat-card-${stat.color}">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    // ===== Goal Progress =====
    renderExerciseGoals() {
        const container = document.getElementById('exercise-goals');
        if (!container || !this.goals) return;

        const now = new Date();
        const thisWeek = this.getWeekExercises();
        const thisMonthEx = this.exercises.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.type !== '休息';
        });

        // Calculate weekly runs
        const weeklyRuns = thisWeek.filter(e => e.type === '跑步').length;
        const weeklyExerciseDays = thisWeek.length;

        // Calculate monthly distance
        const monthlyDistance = thisMonthEx.reduce((s, e) => s + (e.distance || 0), 0);

        const goalItems = [
            {
                title: this.goals.weeklyRun?.label || '每周跑步',
                current: weeklyRuns,
                target: this.goals.weeklyRun?.target || 3,
                unit: this.goals.weeklyRun?.unit || '次'
            },
            {
                title: this.goals.weeklyExercise?.label || '每周运动',
                current: weeklyExerciseDays,
                target: this.goals.weeklyExercise?.target || 5,
                unit: this.goals.weeklyExercise?.unit || '天'
            },
            {
                title: this.goals.monthlyDistance?.label || '月跑量',
                current: monthlyDistance.toFixed(1),
                target: this.goals.monthlyDistance?.target || 40,
                unit: this.goals.monthlyDistance?.unit || '公里'
            }
        ];

        container.innerHTML = goalItems.map(g => {
            const pct = Math.min(100, Math.round((parseFloat(g.current) / g.target) * 100));
            let fillClass = '';
            if (pct >= 100) fillClass = '';
            else if (pct >= 60) fillClass = 'warning';
            else fillClass = 'danger';

            return `
                <div class="goal-card">
                    <div class="goal-header">
                        <span class="goal-title">${g.title}</span>
                        <span class="goal-meta">${g.current}/${g.target} ${g.unit} (${pct}%)</span>
                    </div>
                    <div class="goal-bar">
                        <div class="goal-fill ${fillClass}" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getWeekExercises() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        return this.exercises.filter(e => {
            const d = new Date(e.date);
            return d >= monday && e.type !== '休息';
        });
    }

    // ===== Exercise Type Filter =====
    renderExerciseFilterTags() {
        const container = document.getElementById('exercise-filter-tags');
        if (!container) return;

        const types = [...new Set(this.exercises.map(e => e.type).filter(Boolean))];
        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn px-4 py-2 rounded-full text-sm font-medium transition-all';
            btn.dataset.type = type;
            btn.textContent = type;
            container.appendChild(btn);
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag-btn');
            if (!btn) return;
            document.querySelectorAll('#exercise-filter-tags .tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.exerciseType = btn.dataset.type;
            this.renderExerciseList();
        });
    }

    getFilteredExercises() {
        if (this.exerciseType === 'all') return this.exercises;
        return this.exercises.filter(e => e.type === this.exerciseType);
    }

    renderExerciseList() {
        const container = document.getElementById('exercise-list');
        const countEl = document.getElementById('exercise-count');
        if (!container) return;

        const exercises = this.getFilteredExercises();
        if (countEl) countEl.textContent = `共 ${exercises.length} 条记录`;

        if (exercises.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">暂无匹配的运动记录</p>';
            return;
        }

        const iconMap = {
            '跑步': { icon: '🏃', cls: 'run' },
            '游泳': { icon: '🏊', cls: 'swim' },
            '骑行': { icon: '🚴', cls: 'bike' },
            '力量训练': { icon: '🏋️', cls: 'gym' },
            '瑜伽': { icon: '🧘', cls: 'yoga' },
            '篮球': { icon: '🏀', cls: 'ball' },
            '足球': { icon: '⚽', cls: 'ball' },
            '羽毛球': { icon: '🏸', cls: 'ball' },
            '休息': { icon: '😴', cls: 'rest' }
        };

        container.innerHTML = exercises.map(e => {
            const info = iconMap[e.type] || { icon: '💪', cls: 'gym' };
            const date = new Date(e.date);
            const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });

            let metricsHTML = '';
            if (e.type !== '休息') {
                const metricItems = [];
                if (e.duration) metricItems.push(`<div class="ex-metric"><span class="ex-value">${e.duration}</span><span class="ex-label">分钟</span></div>`);
                if (e.distance) metricItems.push(`<div class="ex-metric"><span class="ex-value">${e.distance}</span><span class="ex-label">公里</span></div>`);
                if (e.calories) metricItems.push(`<div class="ex-metric"><span class="ex-value">${e.calories}</span><span class="ex-label">千卡</span></div>`);
                metricsHTML = `<div class="ex-metrics">${metricItems.join('')}</div>`;
            }

            return `
                <div class="exercise-card">
                    <div class="ex-icon ${info.cls}">${info.icon}</div>
                    <div class="ex-info">
                        <div class="ex-type">${this.escapeHtml(e.type)}</div>
                        <div class="ex-date">${dateStr}</div>
                    </div>
                    ${metricsHTML}
                    ${e.note ? `<div class="ex-note" title="${this.escapeAttr(e.note)}">${this.escapeHtml(e.note)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // ===== Charts =====
    setupChartFormat() {
        document.getElementById('chart-format')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.sort-btn');
            if (!btn) return;
            document.querySelectorAll('#chart-format .sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.chartFormat = btn.dataset.format;

            // Toggle canvas vs calendar visibility
            const chartWrapper = document.getElementById('chart-wrapper');
            const calendarHeatmap = document.getElementById('calendar-heatmap');
            if (this.chartFormat === 'calendar') {
                chartWrapper.classList.add('hidden');
                calendarHeatmap.classList.remove('hidden');
                this.renderCalendarHeatmap();
            } else {
                chartWrapper.classList.remove('hidden');
                calendarHeatmap.classList.add('hidden');
                this.renderChart();
            }
        });
    }

    renderChart() {
        if (this.currentTab !== 'exercise' || this.chartFormat === 'calendar') return;
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        // Destroy previous chart instance
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }

        const canvas = document.getElementById('exercise-chart');
        if (!canvas) return;

        // Get last 14 days of active exercise data (reversed for chronological order)
        const activeExercises = this.exercises
            .filter(e => e.type !== '休息')
            .slice(0, 14)
            .reverse();

        if (activeExercises.length === 0) return;

        const labels = activeExercises.map(e => {
            const d = new Date(e.date);
            return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        });

        const typeColors = {
            '跑步': '#16a34a', '游泳': '#0ea5e9', '骑行': '#f59e0b',
            '力量训练': '#ef4444', '瑜伽': '#a855f7', '篮球': '#ec4899',
            '足球': '#84cc16', '羽毛球': '#14b8a6'
        };

        const getColor = (type) => typeColors[type] || '#6b7280';

        const ctx = canvas.getContext('2d');

        const chartConfigs = {
            line: () => ({
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '运动时长(分钟)',
                            data: activeExercises.map(e => e.duration),
                            borderColor: '#16a34a',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y',
                        },
                        {
                            label: '消耗卡路里(kcal)',
                            data: activeExercises.map(e => e.calories),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y1',
                        }
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                afterBody: (ctx) => {
                                    const ex = activeExercises[ctx[0].dataIndex];
                                    const lines = [];
                                    if (ex.distance) lines.push(`距离: ${ex.distance} km`);
                                    if (ex.note) lines.push(`备注: ${ex.note}`);
                                    return lines;
                                }
                            }
                        }
                    },
                    scales: {
                        y: { type: 'linear', position: 'left', title: { display: true, text: '分钟' }, beginAtZero: true },
                        y1: { type: 'linear', position: 'right', title: { display: true, text: 'kcal' }, grid: { drawOnChartArea: false }, beginAtZero: true }
                    }
                }
            }),

            bar: () => ({
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '运动时长(分钟)',
                            data: activeExercises.map(e => e.duration),
                            backgroundColor: activeExercises.map(e => getColor(e.type)),
                            borderRadius: 6,
                        }
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const ex = activeExercises[ctx.dataIndex];
                                    return [`${ex.type}: ${ex.duration}分钟`, ex.distance ? `距离: ${ex.distance}km` : '', `消耗: ${ex.calories}kcal`].filter(Boolean);
                                }
                            }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: '分钟' } }
                    }
                }
            }),

            radar: () => {
                // Aggregate by type for the last 30 days
                const last30 = this.exercises.filter(e => {
                    const d = new Date(e.date);
                    return (new Date() - d) / 86400000 <= 30 && e.type !== '休息';
                });

                const typeAgg = {};
                last30.forEach(e => {
                    if (!typeAgg[e.type]) typeAgg[e.type] = { count: 0, duration: 0, calories: 0 };
                    typeAgg[e.type].count++;
                    typeAgg[e.type].duration += e.duration || 0;
                    typeAgg[e.type].calories += e.calories || 0;
                });

                const types = Object.keys(typeAgg);
                return {
                    type: 'radar',
                    data: {
                        labels: types,
                        datasets: [
                            {
                                label: '运动次数',
                                data: types.map(t => typeAgg[t].count),
                                borderColor: '#16a34a',
                                backgroundColor: 'rgba(22, 163, 74, 0.2)',
                            },
                            {
                                label: '总时长(h)',
                                data: types.map(t => +(typeAgg[t].duration / 60).toFixed(1)),
                                borderColor: '#0ea5e9',
                                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                            },
                            {
                                label: '总消耗(×100kcal)',
                                data: types.map(t => Math.round(typeAgg[t].calories / 100)),
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            }
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: {
                            r: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                };
            },
        };

        const configFn = chartConfigs[this.chartFormat];
        if (!configFn) return;

        const config = configFn();
        config.options = {
            ...config.options,
            maintainAspectRatio: false,
            responsive: true,
        };

        this.chartInstance = new Chart(ctx, config);
    }

    renderCalendarHeatmap() {
        const container = document.getElementById('calendar-heatmap');
        if (!container) return;

        // Build heatmap for last 12 weeks
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 84); // 12 weeks

        // Build activity map by date string
        const activityMap = {};
        this.exercises.forEach(e => {
            if (e.type !== '休息') {
                const key = e.date;
                activityMap[key] = (activityMap[key] || 0) + (e.duration || 0);
            }
        });

        // Determine intensity levels
        const values = Object.values(activityMap);
        const maxVal = values.length > 0 ? Math.max(...values) : 60;
        const getLevel = (val) => {
            if (!val) return 0;
            const ratio = val / maxVal;
            if (ratio <= 0.25) return 1;
            if (ratio <= 0.5) return 2;
            if (ratio <= 0.75) return 3;
            return 4;
        };

        // Build calendar grid: week columns
        const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
        const weeks = [];

        // Round to Monday
        const currentDay = new Date(startDate);
        const dayOfWeek = currentDay.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentDay.setDate(currentDay.getDate() + mondayOffset);

        while (currentDay <= endDate) {
            const weekCells = [];
            for (let d = 0; d < 7; d++) {
                const cellDate = new Date(currentDay);
                cellDate.setDate(currentDay.getDate() + d);
                const dateKey = cellDate.toISOString().split('T')[0];
                const val = activityMap[dateKey] || 0;
                weekCells.push({
                    date: dateKey,
                    dateObj: new Date(cellDate),
                    value: val,
                    level: getLevel(val),
                    inRange: cellDate >= startDate && cellDate <= endDate
                });
            }
            weeks.push(weekCells);
            currentDay.setDate(currentDay.getDate() + 7);
        }

        // Render
        let html = '<div class="cal-weekdays">' + weekdays.map(d => `<span>${d}</span>`).join('') + '</div>';
        html += '<div class="cal-body">';

        // Month labels mapping
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        let lastMonth = -1;

        weeks.forEach((week) => {
            const firstDate = week[0].dateObj;
            const currentMonth = firstDate.getMonth();
            const monthLabel = lastMonth !== currentMonth ? monthNames[currentMonth] : '&nbsp;';
            lastMonth = currentMonth;

            html += `<div class="cal-month-col">
                <div class="cal-month-label">${monthLabel}</div>`;
            week.forEach(cell => {
                const title = cell.inRange && cell.value > 0
                    ? `${cell.date}: ${cell.value}分钟`
                    : cell.date;
                html += `<div class="cal-cell l${cell.level}" title="${title}" data-date="${cell.date}"></div>`;
            });
            html += '</div>';
        });

        html += '</div>';

        // Legend
        html += '<div class="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">';
        html += '<span>少</span>';
        html += '<div class="cal-cell l0" style="display:inline-block;width:16px;height:16px;"></div>';
        html += '<div class="cal-cell l1" style="display:inline-block;width:16px;height:16px;"></div>';
        html += '<div class="cal-cell l2" style="display:inline-block;width:16px;height:16px;"></div>';
        html += '<div class="cal-cell l3" style="display:inline-block;width:16px;height:16px;"></div>';
        html += '<div class="cal-cell l4" style="display:inline-block;width:16px;height:16px;"></div>';
        html += '<span>多</span>';
        html += '</div>';

        container.innerHTML = html;
    }

    // ===== Helpers =====
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        btn?.addEventListener('click', () => {
            menu?.classList.toggle('hidden');
        });
    }
}

// ========== Initialize App ==========
document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    const router = new Router();
    const blogRenderer = new BlogRenderer();
    const projectsRenderer = new ProjectsRenderer();
    const skillsRenderer = new SkillsRenderer();
    const readingRenderer = new ReadingRenderer();
    const learningRenderer = new LearningRenderer();
    const lifeRenderer = new LifeRenderer();
    const mobileMenu = new MobileMenu();

    // Render latest posts on home page
    blogRenderer.renderLatestPosts();

    // Render latest reading on home page (async, after data loads)
    readingRenderer.loadData().then(() => {
        readingRenderer.renderLatestOnHome();
    });

    // Handle nav-link clicks for SPA navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link && link.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const page = link.getAttribute('href').slice(1);
            router.navigate(page);
        }
    });
});
