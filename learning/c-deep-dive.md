# C 语言深入

## 学习目标

- 深入理解 C 语言内存模型
- 掌握 Unix/Linux 系统编程
- 理解操作系统底层原理

---

## 学习路线

### ✅ 已完成

- [x] 指针与内存管理 — 堆/栈、malloc/free
- [x] 结构体与联合体 — 内存对齐
- [x] 文件 I/O — 系统调用 (open/read/write/close)
- [x] 进程管理 — fork、exec、wait
- [x] 信号处理 — signal、sigaction
- [x] 网络编程基础 — socket、bind、listen、accept

### 🔄 进行中

- [ ] 线程编程 — pthreads、互斥锁、条件变量
- [ ] 共享内存与 IPC

### ⏳ 待开始

- [ ] epoll 深入 — 边缘触发 vs 水平触发
- [ ] 内存映射 — mmap 原理与实战
- [ ] 实现一个简单的 HTTP Server

---

## 实践项目

- [x] **simple-shell** — 简易 Shell 实现
- [x] **echo-server** — TCP Echo 服务器
- [ ] **http-server** — 从零实现 HTTP/1.1 服务器
- [ ] **memory-allocator** — 简易内存分配器

---

## 学习资源

| 资源 | 链接 |
|------|------|
| The C Programming Language (K&R) | — |
| Advanced Programming in the UNIX Environment | — |
| UNIX Network Programming | — |
| Linux man pages | https://man7.org/linux/man-pages/ |

---

## 笔记

> **2024-05-20** — `fork()` 的写时拷贝 (Copy-on-Write) 机制极大优化了进程创建性能。子进程只有在真正写入时才会复制父进程的内存页。

> **2024-04-15** — `epoll` 相比 `select`/`poll` 的核心优势在于 O(1) 的事件获取和基于事件驱动而非轮询。LT（水平触发）更安全，ET（边缘触发）更高性能但需要非阻塞 I/O 配合。
