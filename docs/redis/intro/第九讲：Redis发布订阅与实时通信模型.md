# 第9讲：Redis发布订阅与实时通信模型

---

# 一、课时目标

完成本节后可以：

* 理解 Redis Pub/Sub 的通信模型
* 理解实时通信与消息队列的本质区别
* 掌握 `PUBLISH / SUBSCRIBE / PSUBSCRIBE`
* 设计合理的 Channel 命名规范
* 使用 Go 实现订阅模型（协程 + 自动重连）
* 构建基础实时通知系统
* 明确 Pub/Sub 的工程使用边界

---

# 二、什么是Redis发布订阅（Pub/Sub）

Redis Pub/Sub本质：

```
一种实时消息广播机制
```

角色：

```
发布者 Publisher
订阅者 Subscriber
频道 Channel
```

模型：

```
Publisher  ──► Channel ──► 多个 Subscriber
```

特点：

* 实时推送
* 无需轮询
* 多播模式

---

## 2.1 与传统请求响应模型对比

传统HTTP：

```
客户端请求 → 服务器响应
```

Pub/Sub：

```
发布消息 → Redis主动推送
```

本质区别：

```
由拉模型变为推模型
```

---

## 2.2 典型使用场景

适合：

* 实时通知
* 在线用户消息
* 聊天消息广播
* 系统事件通知
* 直播弹幕

不适合：

* 订单处理
* 金融交易
* 可靠任务队列

---

# 三、Pub/Sub工作原理（必须理解）

Redis内部逻辑：

```
客户端A SUBSCRIBE news
客户端B SUBSCRIBE news
客户端C PUBLISH news hello
```

流程：

```
订阅者注册channel
        │
        ▼
Redis维护订阅关系表
        │
        ▼
发布消息
        │
        ▼
Redis推送给所有订阅者
```

---

## 3.1 内部结构理解（简化）

Redis维护：

```
channel -> subscriber列表
```

发布时：

```
遍历订阅者并发送
```

---

## 3.2 最重要的特性：不存储消息

Redis Pub/Sub：

```
不会持久化消息
```

如果：

```
订阅者不在线
```

结果：

```
消息直接丢失
```

这是设计特性，不是缺陷。

---

# 四、基础命令（必须掌握）

---

## 4.1 订阅频道

```bash
SUBSCRIBE order
```

进入阻塞模式：

```
等待消息
```

---

## 4.2 发布消息

新开一个终端：

```bash
PUBLISH order "new order"
```

订阅端收到：

```
message
order
new order
```

---

## 4.3 多频道订阅

```bash
SUBSCRIBE order user system
```

---

## 4.4 模式订阅（PSUBSCRIBE）

支持通配符：

```bash
PSUBSCRIBE user:*
```

示例：

```
user:login
user:logout
```

---

## 4.5 取消订阅

```bash
UNSUBSCRIBE
```

---

# 五、Channel设计规范（工程重点）

错误设计：

```
login
message
data
```

问题：

* 无法扩展
* 无法区分业务
* 易冲突

---

## 5.1 推荐命名规则

建议结构：

```
业务:模块:动作
```

示例：

```
user:login:event
chat:room:message
order:create:event
system:notice:push
```

---

## 5.2 多环境隔离

建议：

```
dev:user:login
test:user:login
prod:user:login
```

---

## 5.3 多服务协作设计

示例：

```
api:notification
ws:push
email:send
```

---

# 六、Go实现Pub/Sub模型（核心）

---

## 6.1 发布消息

```go
func Publish(ctx context.Context, rdb *redis.Client, ch string, msg string) error {
	return rdb.Publish(ctx, ch, msg).Err()
}
```

---

## 6.2 创建订阅者

```go
func Subscribe(ctx context.Context, rdb *redis.Client, ch string) {
	sub := rdb.Subscribe(ctx, ch)

	for msg := range sub.Channel() {
		fmt.Println("receive:", msg.Channel, msg.Payload)
	}
}
```

---

## 6.3 为什么必须使用协程

原因：

```
订阅是阻塞行为
```

工程写法：

```go
go Subscribe(ctx, rdb, "order:event")
```

---

## 6.4 完整示例（课堂主代码）

```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	go func() {
		sub := rdb.Subscribe(ctx, "demo:channel")

		for msg := range sub.Channel() {
			fmt.Println("recv:", msg.Payload)
		}
	}()

	time.Sleep(time.Second)

	rdb.Publish(ctx, "demo:channel", "hello redis")

	time.Sleep(3 * time.Second)
}
```

---

# 七、自动重连机制（工程必备）

现实问题：

```
网络断开
Redis重启
连接关闭
```

解决思路：

```
循环订阅 + 错误重试
```

---

## 7.1 简单重连模型

```go
func SafeSubscribe(rdb *redis.Client, ch string) {
	ctx := context.Background()

	for {
		sub := rdb.Subscribe(ctx, ch)

		for msg := range sub.Channel() {
			fmt.Println("recv:", msg.Payload)
		}

		time.Sleep(time.Second)
	}
}
```

---

# 八、Pub/Sub vs Stream vs MQ（必须讲清）

---

## 8.1 Pub/Sub特点

```
实时推送
无持久化
无确认机制
无重试
```

---

## 8.2 Stream特点

```
可回放
消费者组
可确认
可靠性高
```

---

## 8.3 专业MQ特点（Kafka/RabbitMQ）

```
高可靠
高吞吐
复杂路由
事务支持
```

---

## 8.4 使用建议

实时通知：

```
Pub/Sub
```

可靠消息：

```
Stream 或 MQ
```

---

# 九、应用实战：实时通知系统（本节核心）

---

## 9.1 需求

实现：

* 发布系统通知
* 实时推送用户
* 多订阅者同时接收

---

## 9.2 Channel设计

```
system:notify
```

---

## 9.3 发布通知

```go
func SendNotify(ctx context.Context, rdb *redis.Client, msg string) {
	rdb.Publish(ctx, "system:notify", msg)
}
```

---

## 9.4 订阅通知

```go
func ListenNotify(ctx context.Context, rdb *redis.Client) {
	sub := rdb.Subscribe(ctx, "system:notify")

	for m := range sub.Channel() {
		fmt.Println("通知:", m.Payload)
	}
}
```

---

## 9.5 模拟多客户端

启动多个程序：

```
多个订阅者同时收到消息
```

---

# 十、本节课堂任务

必须完成：

1. 使用CLI测试 SUBSCRIBE
2. 使用CLI测试 PUBLISH
3. 编写Go发布函数
4. 编写Go订阅函数
5. 使用协程实现订阅
6. 实现自动重连
7. 完成实时通知系统

---

# 十一、本节常见陷阱（非常重要）

---

## 11.1 把Pub/Sub当可靠队列

错误：

```
订单处理
支付消息
库存扣减
```

原因：

```
消息可能丢失
```

---

## 11.2 忘记协程导致主线程阻塞

订阅：

```
永远阻塞
```

---

## 11.3 Channel设计混乱

后果：

```
系统无法扩展
```

---

# 十二、本节总结

你已经掌握：

* Redis Pub/Sub通信模型
* Channel设计规范
* Go订阅模型实现
* 自动重连机制
* 实时通知系统开发
* Pub/Sub与Stream/MQ边界

---

# 下节课

第10讲：

* RDB与AOF持久化机制
* Redis事务模型
* WATCH乐观锁
* Lua与事务关系
* 库存扣减示例
* 数据恢复实战
