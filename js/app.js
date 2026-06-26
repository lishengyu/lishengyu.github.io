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
        this.refreshing = false;
        this.init();
    }

    async init() {
        await this.loadData();
        if (this.data) {
            this.renderStats();
            this.renderBooks();
            this.renderSyncTime();
            this.setupTagFilter();
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
        const stats = [
            { value: s.totalBooks || 0, label: '书架总计' },
            { value: s.readingCount || 0, label: '在读' },
            { value: s.finishedCount || 0, label: '已读完' },
            { value: s.unreadCount || 0, label: '未开始' },
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-card">
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
        const all = this.getAllBooks();
        if (this.currentTag === 'all') return all;
        return all.filter(b => b.status === this.currentTag);
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

    renderBooks() {
        const container = document.getElementById('reading-list');
        if (!container) return;

        const books = this.getFilteredBooks();
        if (books.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full py-8">暂无数据</p>';
            return;
        }

        container.innerHTML = books.map(book => this.renderBookCard(book)).join('');
    }

    renderBookCard(book) {
        const pct = Math.min(100, Math.max(0, book.progress || 0));
        const statusLabel = { reading: '在读', finished: '已读完', unread: '未开始' };
        const statusClass = pct >= 100 ? 'finished' : pct > 0 ? 'reading' : 'unread';
        const actualStatus = pct >= 100 ? 'finished' : pct > 0 ? 'reading' : 'unread';

        let progressClass = 'low';
        if (pct >= 100) progressClass = 'done';
        else if (pct >= 70) progressClass = 'high';
        else if (pct >= 30) progressClass = 'mid';

        const coverChar = (book.title || '书').charAt(0);

        return `
            <div class="book-card">
                <div class="flex gap-3 mb-3">
                    <div class="book-cover">${coverChar}</div>
                    <div class="book-info">
                        <div class="book-title" title="${this.escapeHtml(book.title)}">${this.escapeHtml(book.title)}</div>
                        <div class="book-author">${this.escapeHtml(book.author || '未知作者')}</div>
                        <div class="flex items-center gap-2">
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
                if (!wasExpanded && !card.dataset.loaded) {
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
                marked.setOptions({
                    gfm: true,
                    breaks: false,
                });
                contentDiv.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
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
