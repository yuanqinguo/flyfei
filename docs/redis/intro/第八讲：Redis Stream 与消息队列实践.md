# 第8讲：Redis Stream 与消息队列实践


# 一、本节课目标

完成本节后可以：

* 理解 Redis Stream 设计目标
* 掌握 Stream 数据模型
* 掌握 Producer / Consumer 模型
* 掌握 Consumer Group 机制
* 理解 Pending List 工作方式
* 编写可靠 Go 消息队列
* 实现消费者重启恢复
* 理解 Redis Stream 与专业 MQ 的边界

---

# 二、为什么需要 Stream


## 2.1 传统 Redis 队列的问题

### List + BRPOP

问题：

* 无消费确认
* 无失败重试
* 无消费组
* 无消息历史

---

### Pub/Sub

问题：

* 无持久化
* 消息不可追溯
* 离线消费者丢消息

---

## 2.2 Stream 的定位

Stream 是：

```
可持久化日志流
```

核心能力：

* 消息持久化
* ACK确认
* 消费组
* PendingList
* 历史重放
* 故障恢复

---

# 三、Stream 数据模型

---

## 3.1 本质结构

```
可追加日志
```

类似：

```
Kafka Partition
```

---

## 3.2 消息结构

```
ID + Field/Value
```

示例：

```
1700000000-0
```

---

## 3.3 添加消息

```bash
XADD order_stream * user 1001 price 99
```

---

# 四、Stream 核心命令

---

## 4.1 生产消息

```bash
XADD mystream * name jack age 20
```

---

## 4.2 读取消息

```bash
XREAD STREAMS mystream 0
```

---

## 4.3 阻塞读取

```bash
XREAD BLOCK 0 STREAMS mystream $
```

---

# 五、Consumer Group（核心机制）

---

## 5.1 创建消费组

```bash
XGROUP CREATE mystream group1 0
```

---

## 5.2 消费新消息

```bash
XREADGROUP GROUP group1 c1 STREAMS mystream >
```

说明：

```
> 代表新消息
```

---

## 5.3 ACK确认

```bash
XACK mystream group1 id
```

---

# 六、PendingList（可靠性的核心）

---

当消费者读取但未ACK：

```
消息进入 PendingList
```

作用：

* 防止消息丢失
* 支持失败重试
* 支持崩溃恢复

---

查看 Pending：

```bash
XPENDING mystream group1
```

---

# 七、Go实现可靠消息队列（完整版本）

---

# 七.1 生产者

```go
func Produce(ctx context.Context, rdb *redis.Client) error {

	return rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: "order_stream",
		Values: map[string]interface{}{
			"user": 1001,
			"price": 99,
		},
	}).Err()
}
```

---

# 七.2 业务处理函数（模拟）

```go
func handleBusiness(msg redis.XMessage) error {

	fmt.Println("process:", msg.Values)

	// 模拟失败
	if msg.Values["user"] == "fail" {
		return errors.New("fail")
	}

	return nil
}
```

---

# 七.3 读取新消息（只读新数据）

```go
func ConsumeNew(ctx context.Context, rdb *redis.Client) error {

	res, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    "group1",
		Consumer: "c1",
		Streams:  []string{"order_stream", ">"},
		Count:    10,
		Block:    0,
	}).Result()

	if err != nil {
		return err
	}

	for _, stream := range res {
		for _, msg := range stream.Messages {

			err := handleBusiness(msg)

			if err == nil {
				rdb.XAck(ctx, "order_stream", "group1", msg.ID)
			}
		}
	}

	return nil
}
```

---

# 七.4 读取 PendingList（消费者恢复核心）

```go
func ConsumePending(ctx context.Context, rdb *redis.Client) error {

	res, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    "group1",
		Consumer: "c1",
		Streams:  []string{"order_stream", "0"},
		Count:    10,
	}).Result()

	if err != nil {
		return err
	}

	for _, stream := range res {
		for _, msg := range stream.Messages {

			err := handleBusiness(msg)

			if err == nil {
				rdb.XAck(ctx, "order_stream", "group1", msg.ID)
			}
		}
	}

	return nil
}
```

---

# 七.5 Worker（生产级消费者模型）

```go
func Worker(ctx context.Context, rdb *redis.Client) {

	for {

		// 1 先恢复Pending
		ConsumePending(ctx, rdb)

		// 2 再处理新消息
		ConsumeNew(ctx, rdb)
	}
}
```

---

# 七.6 查看 Pending 状态

```go
func CheckPending(ctx context.Context, rdb *redis.Client) error {

	res, err := rdb.XPendingExt(ctx, &redis.XPendingExtArgs{
		Stream: "order_stream",
		Group:  "group1",
		Start:  "-",
		End:    "+",
		Count:  10,
	}).Result()

	if err != nil {
		return err
	}

	for _, p := range res {
		fmt.Println("Pending:", p.ID, p.Consumer)
	}

	return nil
}
```

---

# 七.7 崩溃消费者接管（概念讲解）

```bash
XAUTOCLAIM order_stream group1 c2 60000 0
```

作用：

```
接管超时未ACK消息
```

---

# 八、Stream VS 消息队列

---

## Redis Stream 优势

* 极低延迟
* 部署简单
* 内存级速度
* 小型系统神器
* 中型队列可用

---

## Redis Stream 不足

* 扩展能力弱于Kafka
* 不适合超大吞吐
* 长期存储成本高
* 运维工具较少

---

## 对比表

| 维度  | Redis Stream | Kafka |
| --- | ------------ | ----- |
| 延迟  | 极低           | 低     |
| 部署  | 简单           | 复杂    |
| 扩展  | 中            | 极强    |
| 数据量 | 中            | 超大    |
| 顺序  | 单流           | 分区    |

---

# 九、使用建议

---

## 推荐场景

```
订单异步处理
通知系统
任务队列
秒杀削峰
日志缓冲
```

---

## 不推荐场景

```
数据平台
大数据管道
长期日志存储
亿级消息系统
```

---

# 十、课堂任务（必须完成）

1. CLI创建Stream
2. CLI创建消费组
3. CLI生产消息
4. CLI消费消息
5. 模拟消费失败
6. 查看PendingList
7. 实现Pending恢复
8. 编写Worker循环
9. 模拟消费者崩溃
10. 验证消息恢复
11. 实现订单队列系统

---

# 十一、本节总结

你已经掌握：

* Redis Stream日志模型
* Consumer Group机制
* PendingList可靠性机制
* ACK确认流程
* Go可靠消费者实现
* Stream与专业MQ边界
