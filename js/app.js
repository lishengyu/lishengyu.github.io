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

// ========== Mobile Menu ==========
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
    const mobileMenu = new MobileMenu();

    // Render latest posts on home page
    blogRenderer.renderLatestPosts();

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
