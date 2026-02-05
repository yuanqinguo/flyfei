
# 第1讲：Redis入门与Go生态对接（工程精简版）

---

# 一、课时目标

完成本节后可以：

* 理解 Redis 在 Go 后端中的作用
* 理解 Redis 单线程 + IO多路复用模型
* 使用 docker-compose 部署 Redis
* 使用宿主机 redis-cli 验证服务
* 在 Go 中接入 go-redis
* 完成 Redis Ping 检测

---

# 二、Redis在Go后端中的位置

典型架构：

```
        Client
          │
          ▼
      Go API 服务
       │      │
       │      ▼
       │    MySQL
       ▼
     Redis
```

Redis职责：

* 高频读取
* 状态共享
* 实时计数
* 排名计算
* 限流控制

Redis不是：

* 关系数据库替代品
* 永久数据中心

---

# 三、Redis执行模型（单线程）

Redis执行规则：

* 同一时间只执行一个命令
* 无锁
* 天然原子性

执行流程：

```
客户端1 ─┐
客户端2 ─┼──► 请求队列 ─► Redis主线程 ─► 执行命令 ─► 返回结果
客户端3 ─┘
```

优势：

* 无锁竞争
* 无线程切换
* 延迟稳定

---

# 四、IO多路复用模型

Redis的单线程模型：

```
多个客户端连接
        │
        ▼
   IO事件监听器
        │
        ▼
     事件队列
        │
        ▼
    单线程执行
        │
        ▼
      返回结果
```

流程：

1. 多客户端发送请求
2. IO监听器检测事件
3. 加入执行队列
4. 主线程顺序执行

---

# 五、Redis为什么快

核心原因：

* 内存操作
* 单线程无锁
* IO多路复用
* 原子指令执行

---

# 六、什么操作会拖慢Redis

本质：

> 阻塞主线程

危险行为：

* KEYS *
* 大集合全量扫描
* 超大range
* 大Key操作

后果：

* 所有请求排队
* 服务延迟暴涨

---

# 七、使用docker-compose部署Redis

## docker-compose.yml

```yaml
version: '3.9'

services:
  redis:
    image: redis:7
    container_name: redis-dev
    ports:
      - "6379:6379"
    command: ["redis-server", "--appendonly", "no"]
    restart: always
```

---

## 启动Redis

```bash
docker-compose up -d
```

查看：

```bash
docker ps
```

---

# 八、使用宿主机 redis-cli 连接Redis

确认redis-cli：

```bash
redis-cli --version
```

连接：

```bash
redis-cli -h 127.0.0.1 -p 6379
```

成功后：

```
127.0.0.1:6379>
```

---

## 验证Redis运行

```bash
PING
```

返回：

```
PONG
```

---

## 基础读写测试

```bash
SET demo hello
GET demo
DEL demo
```

---

## 连接流程理解

```
宿主机 redis-cli
        │
        ▼
  6379端口映射
        │
        ▼
 Docker Redis容器
```

---

# 九、Go接入Redis

## 初始化项目

```bash
go mod init redis-course
```

安装客户端：

```bash
go get github.com/redis/go-redis/v9
```

---

## 客户端设计原则

* client 全局复用
* client 线程安全
* 不要每次创建连接
* 使用 context 控制请求

结构建议：

```
project/
 ├── cmd/
 ├── internal/
 ├── pkg/redis/
 └── main.go
```

---

# 十、初始化Redis客户端

```go
package redisclient

import "github.com/redis/go-redis/v9"

func New() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		DB:   0,
	})
}
```

---

# 十一、Ping检测实战（本节核心）

```go
package main

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	res, err := rdb.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}

	fmt.Println("redis ok:", res)
}
```

运行：

```bash
go run main.go
```

输出：

```
redis ok: PONG
```

---

# 十二、本节课堂任务

必须完成：

1. docker-compose 启动 Redis
2. 宿主机 redis-cli 连接
3. 执行 PING
4. 创建 Go 项目
5. 初始化 go-redis
6. 完成 Ping 检测

---

# 本节总结

你已经完成：

* Redis执行模型理解
* IO多路复用理解
* docker-compose部署
* 宿主机CLI连接
* Go接入Redis
* Ping检测实战

---

# 下节课

第2讲：

* String底层原理
* SDS结构
* 原子INCR实现
* 缓存模型
* 阅读量计数系统
