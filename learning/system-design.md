# 系统设计学习

## 学习目标

- 理解大规模分布式系统的设计原则
- 掌握常见系统设计题的分析框架
- 能够独立完成高并发场景的方案设计

---

## 学习路线

### ✅ 已完成

- [x] 系统设计基础概念 — CAP 理论、一致性模型
- [x] 负载均衡策略 — 轮询、加权、一致性哈希

### 🔄 进行中

- [ ] 数据库分库分表方案
- [ ] 缓存策略 — Cache-Aside、Read-Through、Write-Behind

### ⏳ 待开始

- [ ] 消息队列选型 — Kafka vs RabbitMQ vs Pulsar
- [ ] 分布式事务 — Saga、TCC、2PC
- [ ] 设计短链接系统
- [ ] 设计实时聊天系统
- [ ] 设计分布式限流器
- [ ] 设计分布式 ID 生成器

---

## 经典系统设计题

| 题目 | 状态 | 关键点 |
|------|------|--------|
| 短链接系统 (TinyURL) | ⏳ | 哈希算法、Base62、重定向 |
| 实时聊天系统 | ⏳ | WebSocket、消息可靠性、在线状态 |
| 限流器 | ⏳ | 令牌桶、滑动窗口、分布式限流 |
| Feed 流系统 | ⏳ | 推模式 vs 拉模式、Timeline 构建 |
| 分布式 ID 生成 | ⏳ | Snowflake、号段模式 |

---

## 学习资源

| 资源 | 链接 |
|------|------|
| System Design Primer | https://github.com/donnemartin/system-design-primer |
| DDIA 中文版 | https://github.com/Vonng/ddia |
| ByteByteGo | https://bytebytego.com/ |

---

## 笔记

> **2024-06-10** — 一致性哈希的核心价值在于节点动态增减时最小化数据迁移量。虚拟节点是解决数据倾斜的关键手段。
