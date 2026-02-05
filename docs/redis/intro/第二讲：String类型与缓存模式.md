# 第2讲: String类型与缓存模式


# 一、课时目标

完成本节后可以：

* 理解 Redis String 的真实存储结构
* 掌握 SDS（Simple Dynamic String）原理
* 理解 INCR 原子实现机制
* 掌握 String 的典型工程场景
* 实现高并发文章阅读计数器
* 理解基础缓存模式 Cache-Aside

---

# 二、String底层原理（必须了解）


## 2.1 String不是传统字符串

Redis String本质：

```
二进制安全的字节数组
```

可以存：

* JSON
* 图片二进制
* protobuf
* 数字
* 序列化对象

---

## 2.2 Redis String真实存储结构：SDS

Redis没有使用C原生字符串，而是：

```
SDS（Simple Dynamic String）
```

结构（逻辑）：

```
struct SDS {
    len     // 当前长度
    alloc   // 已分配空间
    buf[]   // 数据
}
```

---

### 为什么不用C字符串

C字符串问题：

* 需要遍历计算长度 O(n)
* 容易缓冲区溢出
* 拼接效率低

---

### SDS优势

1️⃣ 获取长度 O(1)

```
直接读取 len
```

2️⃣ 自动扩容

```
避免频繁realloc
```

3️⃣ 二进制安全

```
允许 \0 存在
```

4️⃣ 减少内存拷贝

```
预分配策略
```

---

## 2.3 String的内部编码（真实性能关键）

Redis会自动选择编码：

```
整数编码      -> 数字
embstr编码    -> 短字符串
raw编码       -> 长字符串
```

---

### 整数编码

存储：

```
INCR计数器
ID
次数统计
```

优势：

* 无字符串解析
* CPU成本低

---

### embstr

条件：

```
短字符串（小于44字节） 
整个 embstr 对象 ≤ 64 字节 redisObject + sdshdr + 数据 <= 64
```

特点：

```
一次内存分配
```

优势：

* CPU缓存友好
* 内存连续

---

### raw编码

条件：

```
长字符串
```

特点：

```
分开分配
```

---

## 2.4 INCR为什么是原子的

Redis执行模型：

```
单线程执行
```

执行过程：

```
读取值
+1
写回
```

因为：

```
中途不会被打断
```

所以：

```
天然原子
```

不需要：

* 锁
* CAS
* 事务

---

## 2.5 String典型工程用途

最常见四类：

1. 缓存数据
2. 计数器
3. 状态标记
4. 分布式锁（基础版本）

---

# 三、缓存模式（工程入门）

---

## 3.1 Cache-Aside模式（最常用）

流程：

```
1. 先查Redis
2. 没有 -> 查数据库
3. 写入Redis
4. 返回数据
```

逻辑：

```
Client
  │
  ▼
Redis 查询
  │
  ├── 命中 → 返回
  │
  └── 未命中
        │
        ▼
      MySQL
        │
        ▼
     写入Redis
```

---

## 3.2 为什么必须设置过期时间

否则：

* 内存持续增长
* 数据长期过期
* 冷数据占空间

常见策略：

```
SETEX
EXPIRE
TTL
```

---

# 四、应用实战：高性能文章阅读计数器

---

## 4.1 需求

实现：

* 阅读量统计
* 高并发安全
* 自动过期

---

## 4.2 Key设计

```
article:view:{articleID}
```

示例：

```
article:view:1001
```

---

## 4.3 CLI验证原子计数

```bash
INCR article:view:1001
INCR article:view:1001
GET article:view:1001
```

---

## 4.4 设置过期时间

```bash
EXPIRE article:view:1001 86400
```

---

## 4.5 Go实现阅读量增加

```go
func IncreaseView(ctx context.Context, rdb *redis.Client, id int64) error {
	key := fmt.Sprintf("article:view:%d", id)

	return rdb.Incr(ctx, key).Err()
}
```

---

## 4.6 Go实现读取阅读量

```go
func GetView(ctx context.Context, rdb *redis.Client, id int64) (int64, error) {
	key := fmt.Sprintf("article:view:%d", id)

	return rdb.Get(ctx, key).Int64()
}
```

---

## 4.7 首次创建自动设置过期（工程技巧）

```go
func IncreaseView(ctx context.Context, rdb *redis.Client, id int64) error {
	key := fmt.Sprintf("article:view:%d", id)

	val, err := rdb.Incr(ctx, key).Result()
	if err != nil {
		return err
	}

	if val == 1 {
		rdb.Expire(ctx, key, 24*time.Hour)
	}

	return nil
}
```

---

# 五、本节课堂任务

必须完成：

1. 使用CLI测试 INCR
2. 理解整数编码
3. 编写阅读量递增函数
4. 编写读取阅读量函数
5. 实现首次创建自动过期

---

# 六、本节总结

你已经掌握：

* SDS字符串结构
* String内部编码
* INCR原子实现
* Cache-Aside模式
* 阅读量计数系统

---

# 下节课

第3讲：

* Hash底层结构（listpack + hashtable）
* 对象建模策略
* String vs Hash性能对比
* 用户资料管理系统

