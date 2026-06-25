# Personal Website

一个基于 GitHub Pages 搭建的简洁现代风格个人技术博客网站。

## 特性

- 🎨 简洁现代的 Minimal 设计风格
- 🌙 支持亮色/暗色模式切换
- 📱 完全响应式设计，适配移动端
- 📝 博客文章列表，支持标签筛选
- 💼 项目作品展示
- ⚡ 纯静态页面，无需构建，推送即部署

## 本地预览

直接用浏览器打开 `index.html` 即可预览，或使用本地服务器：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

然后访问 `http://localhost:8000`

## 部署到 GitHub Pages

1. 在 GitHub 创建名为 `yourusername.github.io` 的仓库
2. 将本目录所有文件推送到 `main` 分支
3. 访问 `https://yourusername.github.io` 查看网站

详细步骤请参考 `docs/setup-guide.md`

## 自定义内容

编辑 `js/data.js` 来更新：
- 博客文章列表（`blogPosts` 数组）
- 项目展示数据（`projects` 数组）
- 技能标签（`skills` 数组）

编辑 `index.html` 来更新：
- 个人姓名和简介
- 社交链接（GitHub、Twitter、邮箱）
- 头像（修改 Hero 区域的字母或替换为图片）

## 目录结构

```
.
├── index.html          # 主入口文件
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── data.js         # 内容数据
│   └── app.js          # 应用逻辑
├── assets/
│   └── images/         # 图片资源
├── docs/
│   └── setup-guide.md  # 搭建文档
└── README.md
```

## License

MIT
