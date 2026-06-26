# Go 微服务实战

## 学习目标

- 掌握 gRPC + Protobuf 通信模式
- 理解服务发现与负载均衡机制
- 实践分布式链路追踪
- 能够独立部署微服务到 K8s

---

## 学习路线

### ✅ 已完成

- [x] Go 基础语法复习 — 接口、并发、错误处理
- [x] net/http 标准库深入 — 路由、中间件、优雅关闭
- [x] gRPC 入门 + Protobuf 实践 — 四种通信模式
- [x] 服务注册与发现 — Consul 基础

### 🔄 进行中

- [ ] API 网关实践 — Kong / APISIX 选型与配置
- [ ] 服务间通信 — 消息队列 (NATS/Kafka)

### ⏳ 待开始

- [ ] 分布式追踪 — OpenTelemetry + Jaeger
- [ ] CI/CD 流水线 — GitHub Actions 自动化部署
- [ ] K8s 部署实践 — Deployment、Service、Ingress
- [ ] 可观测性 — Prometheus + Grafana 监控

---

## 学习资源

| 资源 | 链接 |
|------|------|
| Go 官方文档 | https://go.dev/doc/ |
| gRPC 官方教程 | https://grpc.io/docs/ |
| Microservices Patterns | https://microservices.io/ |
| OpenTelemetry 文档 | https://opentelemetry.io/docs/ |

---

## 实践项目

- [ ] **user-service** — 用户服务 (gRPC + PostgreSQL)
- [ ] **api-gateway** — API 网关 (HTTP → gRPC 转换)
- [ ] **infra** — 基础设施 (Docker Compose / K8s manifests)

---

## 笔记

> **2024-08-15** — gRPC 四种模式已全部实践完毕：Unary、Server Streaming、Client Streaming、Bidirectional Streaming。Bidirectional 最复杂但也最强大，适合聊天、实时协作等场景。

> **2024-07-20** — Consul 服务注册完成。健康检查配置需要特别注意 `interval` 和 `timeout` 的配合，否则会出现服务频繁上下线的问题。
