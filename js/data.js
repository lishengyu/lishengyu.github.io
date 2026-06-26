/**
 * Website Data - Blog Posts & Projects
 * Easy to customize: edit this file to update your content
 */

// ========== Blog Posts Data ==========
const blogPosts = [
    {
        id: 1,
        title: "学习笔记",
        excerpt: "日常记录",
        date: "2024-09-30",
        tags: ["go", "c"],
        url: "https://github.com/lishengyu/notebook"
    }
];

// ========== Projects Data ==========
const projects = [
    {
        id: 1,
        title: "toDo",
        description: "xxxx",
        icon: "📋",
        tags: [],
        demoUrl: "#",
        codeUrl: "#"
    }
];

// ========== Skills Data ==========
const skills = [
     "Go", "C", "Unix", "Shell"
];

// ========== WeRead Data Source ==========
// 数据由 scripts/fetch-weread.js + GitHub Actions 自动生成
// 如果 js/weread-data.json 不存在，使用此默认数据
const wereadDataUrl = 'js/weread-data.json';

// ========== Learning Plan Index Source ==========
const learningIndexUrl = 'learning/index.json';
