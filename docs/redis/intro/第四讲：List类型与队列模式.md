# 第4讲：List类型与队列模式

---

# 一、课时目标

完成本节后可以：

* 理解 Redis List 的真实底层结构
* 掌握 quicklist 设计原理
* 理解 Redis 队列模型
* 掌握 阻塞队列 BLPOP
* 使用 Go 协程实现生产者-消费者模型
* 实现 Redis 异步任务队列系统
* 理解 Redis List 与 专业 MQ 的边界

---

# 二、Redis List 本质

---

## 2.1 List不是传统数组

Redis List 是：

```
有序可重复序列
```

支持：

* 左右插入
* 左右弹出
* 阻塞读取
* 范围读取

---

## 2.2 List核心特性

```
有序
可重复
支持头尾操作
```

典型用途：

* 队列
* 最新动态
* 异步任务

---

# 三、List底层结构（quicklist）

---

## 3.1 Redis7 List结构

Redis List 不是：

```
数组
```

也不是：

```
传统链表
```

真实结构：

```
quicklist
```

---

## 3.2 quicklist结构设计

逻辑结构：

```
quicklist
   │
   ├── listpack
   ├── listpack
   └── listpack
```

每个节点：

```
压缩数据块
```

---

## 3.3 为什么要设计 quicklist

早期Redis使用：

```
双向链表
```

问题：

* 指针多
* 内存碎片
* CPU缓存差

数组问题：

* 插入移动成本高

---

## 3.4 quicklist优势

1️⃣ 连续内存（listpack）

```
CPU缓存友好
```

2️⃣ 链式连接

```
支持快速插入
```

3️⃣ 内存节省

```
减少指针
```

4️⃣ 插入效率稳定

```
避免整体移动
```

---

# 四、List操作复杂度

| 操作     | 复杂度  |
| ------ | ---- |
| LPUSH  | O(1) |
| RPUSH  | O(1) |
| LPOP   | O(1) |
| RPOP   | O(1) |
| LLEN   | O(1) |
| LRANGE | O(n) |

---

## 危险操作

```
LRANGE 超大范围
```

后果：

```
阻塞主线程
```

---

# 五、Redis队列模型

---

## 5.1 最基础队列

生产：

```
LPUSH queue task
```

消费：

```
RPOP queue
```

结构：

```
Producer → List → Consumer
```

---

## 5.2 队列执行流程

```
生产者写入任务
        │
        ▼
    Redis List
        │
        ▼
   消费者取任务
        │
        ▼
       执行
```

---

# 六、阻塞队列

---

## 6.1 不能轮询

错误写法：

```
while true {
  RPOP
  sleep
}
```

问题：

* CPU浪费
* 延迟高
* 请求风暴

---

## 6.2 BLPOP 阻塞读取

命令：

```bash
BLPOP queue 0
```

含义：

```
没有数据就等待
```

---

## 6.3 执行流程

```
消费者等待
        │
        ▼
生产者写入
        │
        ▼
立即返回任务
```

优势：

* 零轮询
* 实时消费
* CPU友好

---

# 七、CLI实战：模拟队列

---

## 7.1 创建任务

```bash
LPUSH task_queue job1
LPUSH task_queue job2
```

---

## 7.2 消费任务

```bash
RPOP task_queue
```

---

## 7.3 阻塞消费

```bash
BLPOP task_queue 0
```

开两个终端：

终端A：

```bash
BLPOP task_queue 0
```

终端B：

```bash
LPUSH task_queue new_job
```

---

# 八、Go实现异步任务队列（本节核心实战）

---

## 8.1 队列Key设计

```
queue:task
```

---

## 8.2 生产者实现

```go
func PushTask(ctx context.Context, rdb *redis.Client, task string) error {
	return rdb.LPush(ctx, "queue:task", task).Err()
}
```

---

## 8.3 阻塞消费者

```go
func ConsumeTask(ctx context.Context, rdb *redis.Client) {
	for {
		res, err := rdb.BLPop(ctx, 0*time.Second, "queue:task").Result()
		if err != nil {
			continue
		}

		task := res[1]

		fmt.Println("consume:", task)
	}
}
```

---

## 8.4 Go协程消费者池（工程版）

```go
func StartWorkerPool(ctx context.Context, rdb *redis.Client, n int) {
	for i := 0; i < n; i++ {
		go ConsumeTask(ctx, rdb)
	}
}
```

---

## 8.5 主程序示例

```go
func main() {
	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	StartWorkerPool(ctx, rdb, 5)

	select {}
}
```

---

# 九、Redis List vs 专业MQ

---

## Redis List优势

* 部署简单
* 延迟低
* 学习成本低
* 与缓存同栈

---

## Redis List缺陷（必须讲清）

1️⃣ 无确认机制

2️⃣ 无重试机制

3️⃣ 无持久消费位点

4️⃣ 无多消费者组

---

## 什么时候必须用MQ

* 金融交易
* 订单系统
* 强一致任务
* 跨服务复杂编排

---

## Redis List适用场景

```
轻量任务
日志处理
异步通知
图片处理
非关键业务
```

---

# 十、工程注意事项（高频踩坑）

---

## 不要存超大任务

```
任务存ID
数据存DB
```

---

## 不要无限增长

```
定期监控 LLEN
```

---

## 不要使用LRANGE全量读取

```
极易阻塞
```

---

## 不要把Redis当MQ系统

```
List只是轻量队列
```

---

# 十一、本节课堂任务

必须完成：

1. CLI模拟队列生产消费
2. 使用BLPOP实现阻塞消费
3. 编写生产者函数
4. 编写消费者函数
5. 启动Go协程消费者池
6. 完成异步任务执行

---

# 十二、本节总结

你已经掌握：

* List底层结构 quicklist
* 队列模型设计
* 阻塞队列 BLPOP
* Go协程消费者池
* Redis队列适用边界

---

# 下节课

第5讲：

* Set底层结构（intset + hashtable）
* 集合运算设计
* 标签系统
* 好友关系建模
* 抽奖去重系统
