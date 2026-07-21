# 系统设计学习

## 学习目标

- 《Unix高级环境编程》

---

## 学习路线

- [x] 3.文件IO
  - [x] 文件空洞（size + od命令确认）
  - [x] 文件操作 create/open/close/write/read/lseek
  - [x] 文件描述符标志和文件状态标志的作用范围
- [x] 进程环境

- [x] 进程控制
  - [x] sizeof和strlen的区别
  - [x] fork与缓冲区的关联
  - [x] 父子进程与文件描述符
  - [x] 子进程继承的属性
  - [x] 父子进程的差异
  - [x] vfork和fork的区别
  - [x] exit _exit 和 _Exit 的区别
  - [x] 孤儿进程和僵死进程
  - [x] wait、waitpid、waitid、wait3、wait4
  - [x] 条件竞争、轮询
  - [x] setuid/setgid setreuid/setregid seteuid/setegid
  - [x] system() == fork() + exec() + waitpid()
  - [x] nice值 nice() getpriority()  怎么统计不同程序的cpu调度，同一程序在不同cpu的调度
  - [ ] 标准io流，冲洗时机，多进程打印等。

- [ ] 进程关系
    - [ ] 终端登录、网络登录  ==> 伪终端(pseudo terminal) 软件驱动程序
    - [x] 进程组、会话首进程、控制进程、前台进程组、后台进程组、信号控制、作业控制
    - [ ] 

- [ ] 守护进程
- [ ] 进程间通信
- [ ] 网络IPC：套接字

- [ ] 高级进程间通信
- [ ] 终端、伪终端

---

## 经典系统设计题

| 题目　　　　　　　　　　　　 | 状态 | 关键点　　　　　 |
| ------------------------------| ------| ------------------|
| 多进程任务分发与结果收集系统 | ⏳　　| socket通信　　　 |
| 程序运行资源分析　　　　　　 | ⏳　　| nice/system/time |

---

## 学习资源

| 资源 | 链接 |
|------|------|
| System Design Primer | https://github.com/donnemartin/system-design-primer |
| DDIA 中文版 | https://github.com/Vonng/ddia |
| ByteByteGo | https://bytebytego.com/ |

---

## 笔记

> **2024-07-14** — 同一进程组中的各进程接收来自同一终端的各种信号。

> **2024-07-15** — 会话（session）是一个或多个进程组的集合。

> **2024-07-15** — 无论何时键入终端的`中断键（Delete或Ctrl+C）` 或 `退出键（Ctrl+\）`，都会将中断信号发送至前台进程组的所有进程。