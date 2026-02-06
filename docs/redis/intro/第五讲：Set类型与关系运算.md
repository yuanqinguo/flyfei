# 第5讲：Set类型与关系运算

# 一、课时目标

完成本节后可以：

* 理解 Redis Set 的真实底层结构
* 掌握 intset 与 hashtable 的切换机制
* 理解 Redis 集合运算模型
* 掌握 去重、关系计算、标签系统设计
* 理解 Set 与 List / Hash 的工程选择
* 实现文章标签系统（交集查询 + 随机推荐）
* 理解 Set 的性能边界

---

# 二、Redis Set 本质

---

## 2.1 Set不是数组

Redis Set 是：

```
无序 + 唯一集合
```

特点：

* 自动去重
* 无顺序
* 支持集合运算

---

## 2.2 Set核心能力

```
唯一性
高效判断存在
集合计算
```

典型用途：

* 标签系统
* 好友关系
* 关注列表
* 抽奖去重
* 权限集合

---

# 三、Set底层结构（Redis7）

---

## 3.1 两种内部编码

Redis Set 有两种结构：

```
intset
hashtable
```

---

## 3.2 intset（小整数集合）

适合：

```
全部为整数
数量较少
```

结构：

```
连续数组
```

特点：

* 极低内存
* CPU缓存友好
* 无哈希开销

---

## 3.3 intset优势

1️⃣ 内存紧凑

```
无hash桶
无指针
```

2️⃣ 查询快

```
二分查找
```

3️⃣ 自动升级

```
int16 → int32 → int64
```

---

## 3.4 何时转换为hashtable

触发条件：

* 出现字符串元素
* 元素数量变大

转换后结构：

```
dict
 ├── bucket
 ├── hash索引
 └── 指针引用
```

特点：

```
O(1)查找
```

---

## 3.5 为什么不用hash表一开始就存

原因：

```
小集合浪费内存
```

Redis设计原则：

```
小对象优化
```

---

# 四、Set操作复杂度

| 操作        | 复杂度    |
| --------- | ------ |
| SADD      | O(1)   |
| SISMEMBER | O(1)   |
| SREM      | O(1)   |
| SCARD     | O(1)   |
| SMEMBERS  | O(n)   |
| SINTER    | O(n*m) |

---

## 危险操作

```
SMEMBERS 大集合
```

后果：

```
阻塞主线程
```

---

# 五、Redis集合运算（本节核心）

---

## 5.1 交集 SINTER

用途：

```
共同标签
共同好友
共同兴趣
```

示例：

```bash
SINTER tag:go tag:redis
```

---

## 5.2 并集 SUNION

用途：

```
推荐合集
标签汇总
```

```bash
SUNION tag:go tag:backend
```

---

## 5.3 差集 SDIFF

用途：

```
未关注的人
未读内容
```

```bash
SDIFF all_user followed_user
```

---

# 六、CLI实战：Set基础操作

---

## 6.1 添加标签

```bash
SADD tag:go article1001
SADD tag:redis article1001
```

---

## 6.2 查询标签文章

```bash
SMEMBERS tag:go
```

---

## 6.3 判断是否存在

```bash
SISMEMBER tag:go article1001
```

---

## 6.4 随机推荐

```bash
SPOP tag:go
```

---

# 七、应用实战：文章标签系统（本节核心）

---

## 7.1 需求

实现：

* 添加文章标签
* 查询标签文章
* 查询多标签交集
* 随机推荐文章

---

## 7.2 Key设计（非常关键）

```
tag:{tagName}
```

示例：

```
tag:go
tag:redis
```

---

## 7.3 数据模型

```
tag:go
 ├── article1001
 ├── article1002
 └── article1003
```

---

## 7.4 Go实现：添加标签

```go
func AddTag(ctx context.Context, rdb *redis.Client, tag string, article string) error {
	key := fmt.Sprintf("tag:%s", tag)

	return rdb.SAdd(ctx, key, article).Err()
}
```

---

## 7.5 Go实现：获取标签文章

```go
func GetTagArticles(ctx context.Context, rdb *redis.Client, tag string) ([]string, error) {
	key := fmt.Sprintf("tag:%s", tag)

	return rdb.SMembers(ctx, key).Result()
}
```

---

## 7.6 Go实现：多标签交集查询

```go
func IntersectArticles(ctx context.Context, rdb *redis.Client, tags ...string) ([]string, error) {
	var keys []string

	for _, tag := range tags {
		keys = append(keys, "tag:"+tag)
	}

	return rdb.SInter(ctx, keys...).Result()
}
```

---

## 7.7 Go实现：随机推荐

```go
func RandomArticle(ctx context.Context, rdb *redis.Client, tag string) (string, error) {
	key := fmt.Sprintf("tag:%s", tag)

	return rdb.SPop(ctx, key).Result()
}
```

---

# 八、Set vs List vs Hash（工程选择）

| 类型   | 适合场景   |
| ---- | ------ |
| Set  | 唯一关系   |
| List | 队列/时间线 |
| Hash | 对象存储   |

---

## 不要用Set的情况

* 需要顺序
* 需要排名
* 需要分页排序

这些：

```
用 Sorted Set
```

---

# 九、工程注意事项（真实踩坑）

---

## 不要直接SMEMBERS超大集合

解决：

```
SSCAN
```

---

## 不要无限增长

监控：

```
SCARD
```

---

## 不要存大对象

```
存ID
```

---

## 集合运算要控制规模

```
大集合交集非常重
```

---

# 十、本节课堂任务

必须完成：

1. CLI添加标签
2. CLI交集查询
3. CLI随机推荐
4. 编写标签添加函数
5. 编写交集查询函数
6. 编写随机推荐函数
7. 完成标签系统

---

# 十一、本节总结

你已经掌握：

* Set底层结构（intset + hashtable）
* 集合运算模型
* 标签系统设计
* 去重场景应用
* Set工程边界

---

# 下节课

第6讲：

* Sorted Set底层结构（skiplist + dict）
* 排行榜设计
* 延迟队列实现
* Score编码技巧
* 游戏积分排行榜系统
