# GitHub Pages 个人网站搭建完整指南

> 本文档将引导你从零开始，使用 GitHub Pages 搭建一个简洁现代风格的个人技术博客网站。

---

## 目录

1. [什么是 GitHub Pages](#1-什么是-github-pages)
2. [前期准备](#2-前期准备)
3. [创建 GitHub Pages 仓库](#3-创建-github-pages-仓库)
4. [部署网站文件](#4-部署网站文件)
5. [自定义域名（可选）](#5-自定义域名可选)
6. [更新与维护](#6-更新与维护)
7. [常见问题](#7-常见问题)

---

## 1. 什么是 GitHub Pages

**GitHub Pages** 是 GitHub 提供的免费静态网站托管服务，支持以下几种使用方式：

| 类型 | 仓库命名 | 访问地址 | 用途 |
|------|---------|---------|------|
| 用户/组织站点 | `username.github.io` | `https://username.github.io` | 个人主页（本教程使用） |
| 项目站点 | `projectname` | `https://username.github.io/projectname` | 项目文档 |

**优点：**
- ✅ 完全免费
- ✅ 原生支持 Jekyll 静态站点生成器
- ✅ 支持自定义域名 + 免费 HTTPS
- ✅ 通过 Git 管理，版本控制完善
- ✅ 无需服务器维护

---

## 2. 前期准备

### 2.1 所需账号与工具

- **GitHub 账号**：前往 [https://github.com](https://github.com) 注册
- **Git**：安装地址 [https://git-scm.com](https://git-scm.com)
- **文本编辑器**：推荐 VS Code [https://code.visualstudio.com](https://code.visualstudio.com)

### 2.2 验证 Git 安装

打开终端，运行以下命令验证：

```bash
git --version
# 输出类似：git version 2.40.0
```

---

## 3. 创建 GitHub Pages 仓库

### 步骤 1：创建仓库

1. 登录 GitHub，点击右上角 **+** → **New repository**
2. 仓库名称填写：`yourusername.github.io`（将 `yourusername` 替换为你的 GitHub 用户名）
3. 设置为 **Public**
4. 勾选 **Add a README file**
5. 点击 **Create repository**

> ⚠️ 仓库名必须严格为 `username.github.io`，否则无法生效！

### 步骤 2：克隆到本地

```bash
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io
```

---

## 4. 部署网站文件

### 4.1 复制网站文件

将本项目的所有文件复制到克隆的仓库目录中：

```
yourusername.github.io/
├── index.html          ← 主入口
├── css/
│   └── style.css
├── js/
│   ├── data.js         ← 内容数据（编辑此文件自定义内容）
│   └── app.js
├── assets/
│   └── images/
└── README.md
```

### 4.2 自定义内容

编辑 `js/data.js` 来更新网站内容：

**修改博客文章：**
```javascript
const blogPosts = [
    {
        title: "你的文章标题",
        excerpt: "文章摘要...",
        date: "2024-03-15",
        tags: ["前端", "React"],
        url: "#"
    },
    // 添加更多文章...
];
```

**修改项目展示：**
```javascript
const projects = [
    {
        title: "项目名称",
        description: "项目描述...",
        icon: "🚀",
        tags: ["Vue.js", "Node.js"],
        demoUrl: "https://...",
        codeUrl: "https://github.com/..."
    },
    // 添加更多项目...
];
```

**修改技能标签：**
```javascript
const skills = [
    "JavaScript", "React", "Node.js",
    // 添加你的技能...
];
```

编辑 `index.html` 修改个人信息：

- 第 47 行：修改头像字母（当前为 `Y`）
- 第 48 行：修改姓名（当前为 `开发者`）
- 第 50 行：修改个人描述
- 第 54-62 行：修改社交链接地址

### 4.3 提交并推送

```bash
# 查看文件状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: add personal website"

# 推送到 GitHub
git push origin main
```

### 4.4 访问网站

推送成功后，等待 1-2 分钟，访问：

```
https://yourusername.github.io
```

> 💡 首次部署可能需要 1-5 分钟，之后每次推送都会自动更新。

---

## 5. 自定义域名（可选）

### 5.1 购买域名

在域名注册商（如阿里云、腾讯云、Namecheap）购买你喜欢的域名，例如 `yourname.com`。

### 5.2 配置 DNS 解析

在你的域名注册商管理后台，添加以下 DNS 记录：

**方式 A：使用 apex 域名（推荐）**

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| A | @ | `185.199.108.153` | 600 |
| A | @ | `185.199.109.153` | 600 |
| A | @ | `185.199.110.153` | 600 |
| A | @ | `185.199.111.153` | 600 |

**方式 B：使用 www 子域名**

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | www | `yourusername.github.io` | 600 |

### 5.3 在 GitHub 中配置

1. 进入仓库 **Settings** → **Pages**
2. 在 **Custom domain** 输入你的域名
3. 点击 **Save**
4. 勾选 **Enforce HTTPS**（等待 DNS 生效后可勾选）

### 5.4 创建 CNAME 文件

在仓库根目录创建 `CNAME` 文件（无扩展名），内容为你的域名：

```
yourname.com
```

提交并推送：

```bash
echo "yourname.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

---

## 6. 更新与维护

### 6.1 添加新博客文章

1. 打开 `js/data.js`
2. 在 `blogPosts` 数组开头添加新文章对象
3. 提交并推送

### 6.2 添加新项目

1. 打开 `js/data.js`
2. 在 `projects` 数组开头添加新项目对象
3. 提交并推送

### 6.3 修改颜色主题

打开 `css/style.css`，修改 `:root` 中的 CSS 变量：

```css
:root {
    --color-primary: #4f46e5;    /* 主题色 */
    --color-accent: #06b6d4;     /* 强调色 */
    /* 修改其他变量... */
}
```

---

## 7. 常见问题

### Q1：网站访问 404 怎么办？

- 确认仓库名为 `username.github.io`（完全匹配）
- 确认分支为 `main`（可在 Settings → Pages 查看）
- 确认 `index.html` 在仓库根目录

### Q2：推送后网站没有更新？

- GitHub Pages 有 1-3 分钟的缓存延迟，请稍等
- 查看仓库 **Actions** 标签页，确认构建是否成功

### Q3：如何使用自己的头像图片？

将头像图片放到 `assets/images/avatar.jpg`，然后在 `index.html` 中替换：

```html
<!-- 将字母头像替换为图片头像 -->
<div class="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden">
    <img src="assets/images/avatar.jpg" alt="头像" class="w-full h-full object-cover">
</div>
```

### Q4：能否添加评论功能？

可以使用 [Giscus](https://giscus.app)（基于 GitHub Discussions，免费）或 [Utterances](https://utteranc.es) 添加评论功能。

### Q5：如何添加 Google Analytics？

在 `index.html` 的 `</head>` 前添加 GA 跟踪代码即可。

---

## 附录：常用 Git 命令速查

```bash
# 查看状态
git status

# 添加文件
git add .                # 添加所有文件
git add index.html       # 添加指定文件

# 提交
git commit -m "描述信息"

# 推送
git push origin main

# 拉取最新代码
git pull origin main

# 查看提交历史
git log --oneline
```

---

*文档生成时间：2024年*
*本网站模板基于纯 HTML/CSS/JS 构建，无框架依赖，可直接部署到 GitHub Pages。*
