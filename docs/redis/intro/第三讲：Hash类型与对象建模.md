# 第3讲:Hash类型与对象建模

# 一、课时目标

完成本节后学员可以：

* 理解 Redis Hash 的真实底层结构
* 掌握 listpack 与 hashtable 的切换机制
* 理解 渐进式 rehash 原理
* 掌握对象建模设计原则
* 理解 Hash vs String 的工程选择
* 实现用户资料管理系统

---

# 二、Hash底层原理（工程必须掌握）


## 2.1 Hash不是传统Map

Redis Hash本质：

```
字段集合（field-value集合）
```

适合：

* 用户对象
* 商品信息
* 订单信息
* 配置对象

不是：

* 大规模KV数据库
* 复杂嵌套JSON存储

---

## 2.2 Hash内部编码（Redis7）

Redis Hash有两种结构：

```
listpack    （小对象）
hashtable   （大对象）
```

---

## 2.3 listpack结构（小Hash优化）

结构逻辑：

```
[ field1 | value1 | field2 | value2 | field3 | value3 ]
```

特点：

* 连续内存
* 无指针
* 极小内存占用
* CPU缓存友好

适合：

```
小对象
字段少
值短
```

---

### 为什么要用listpack

传统hash表问题：

* 指针多
* 内存浪费
* CPU缓存差

listpack优势：

* 紧凑存储
* 减少碎片
* 节省内存

---

## 2.4 何时转换为hashtable

触发条件：

* 字段数量过多
* value过长

转换后结构：

```
dict
 ├── bucket
 ├── hash索引
 └── 指针引用
```

特点：

* O(1)查找
* 扩容支持
* 大数据支持

---

## 2.5 渐进式rehash（工程重点）

Redis不会一次性扩容。

原因：

```
一次性迁移会阻塞主线程
```

采用：

```
渐进式rehash
```

过程：

```
旧表 ----迁移----> 新表
逐步搬迁
每次操作搬一点
```

执行过程：

```
操作触发
   │
   ▼
迁移部分数据
   │
   ▼
继续处理命令
```

优势：

* 避免阻塞
* 平滑扩容
* 保证低延迟

---

## 2.6 Hash操作复杂度

```
HGET      O(1)
HSET      O(1)
HINCRBY   O(1)
HGETALL   O(n)
```

注意：

```
HGETALL 大对象非常危险
```

---

# 三、对象建模（本节核心价值）

---

## 3.1 为什么不用String存JSON

问题：

```
修改一个字段需要：
读取JSON
反序列化
修改
重新写入
```

成本：

* CPU高
* 网络大
* 并发冲突高

---

## 3.2 Hash对象建模方式

示例用户对象：

```
user:1001
 ├── name
 ├── age
 ├── city
```

存储：

```bash
HSET user:1001 name daxing age 20 city shanghai
```

---

## 3.3 Hash vs String(JSON)

| 对比   | Hash | JSON String |
| ---- | ---- | ----------- |
| 修改字段 | O(1) | 需要整体更新      |
| 网络成本 | 小    | 大           |
| 并发安全 | 高    | 低           |
| 内存效率 | 高    | 低           |

---

## 3.4 Key设计规范（工程必须）

推荐：

```
user:{id}
```

示例：

```
user:1001
```

避免：

```
user_info_1001_data_cache
```

---

## 3.5 不要把Hash当数据库

禁止：

* 超大Hash
* 上万字段
* 存日志
* 存历史记录

Hash适合：

```
中小对象
```

---

# 四、应用实战：用户资料管理系统

---

## 4.1 需求

实现：

* 创建用户
* 更新字段
* 查询单字段
* 查询全部资料

---

## 4.2 CLI创建用户

```bash
HSET user:1001 name daxing age 20 city shanghai
```

---

## 4.3 查询单字段

```bash
HGET user:1001 name
```

---

## 4.4 查询全部资料

```bash
HGETALL user:1001
```

---

## 4.5 Go实现创建用户

```go
func CreateUser(ctx context.Context, rdb *redis.Client, id int64) error {
	key := fmt.Sprintf("user:%d", id)

	return rdb.HSet(ctx, key, map[string]interface{}{
		"name": "daxing",
		"age":  20,
		"city": "shanghai",
	}).Err()
}
```

---

## 4.6 更新字段

```go
func UpdateAge(ctx context.Context, rdb *redis.Client, id int64, age int) error {
	key := fmt.Sprintf("user:%d", id)

	return rdb.HSet(ctx, key, "age", age).Err()
}
```

---

## 4.7 获取单字段

```go
func GetName(ctx context.Context, rdb *redis.Client, id int64) (string, error) {
	key := fmt.Sprintf("user:%d", id)

	return rdb.HGet(ctx, key, "name").Result()
}
```

---

## 4.8 获取全部资料

```go
func GetUser(ctx context.Context, rdb *redis.Client, id int64) (map[string]string, error) {
	key := fmt.Sprintf("user:%d", id)

	return rdb.HGetAll(ctx, key).Result()
}
```

---

# 五、本节课堂任务

必须完成：

1. CLI创建用户Hash
2. 修改单字段
3. 查询单字段
4. 编写用户创建函数
5. 编写字段更新函数
6. 编写查询接口

---

# 六、本节总结

你已经掌握：

* Hash底层结构（listpack + hashtable）
* 渐进式rehash
* Hash对象建模原则
* Hash vs String选择
* 用户资料系统实现

---

# 下节课

第4讲：

* List底层结构（quicklist）
* 队列模型
* 阻塞队列BLPOP
* Go协程任务队列系统
