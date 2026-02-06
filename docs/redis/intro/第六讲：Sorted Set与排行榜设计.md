# 第6讲：Sorted Set与排行榜设计


# 一、课时目标

完成本节后可以：

* 理解 Sorted Set 的真实底层结构
* 掌握 dict + skiplist 双结构设计
* 理解 跳表（skiplist） 工作原理
* 掌握 排行榜设计模型
* 理解 Score 编码技巧
* 实现 游戏积分排行榜系统
* 理解 Sorted Set 的工程边界

---

# 二、Sorted Set 本质

---

## 2.1 什么是Sorted Set

```
可排序唯一集合
```

特点：

* 元素唯一
* 按 score 排序
* 支持排名查询
* 支持范围查询

---

## 2.2 与 Set 的区别

| 特性    | Set | Sorted Set |
| ----- | --- | ---------- |
| 唯一性   | 有   | 有          |
| 排序    | 无   | 有          |
| 排名    | 无   | 有          |
| Score | 无   | 有          |

---

## 2.3 典型应用场景

```
排行榜
热度榜
延迟队列
优先级任务
时间线排序
```

---

# 三、Sorted Set底层结构（Redis7）

---

## 3.1 双结构设计（非常关键）

Redis Sorted Set：

```
dict + skiplist
```

---

## 3.2 dict作用

结构：

```
member → score
```

作用：

```
O(1)查询元素
```

---

## 3.3 skiplist作用

作用：

```
排序
范围查询
排名计算
```

---

## 3.4 为什么不用红黑树

原因：

```
实现复杂
范围操作不友好
```

跳表优势：

```
实现简单
支持区间遍历
性能稳定
```

---

# 四、跳表（Skiplist）原理

---

## 4.1 基础思想

```
多层索引链表
```

结构逻辑：

```
Level3   ────────>
Level2   ────────>
Level1   ────────>
Level0   ───────────────>
```

---

## 4.2 查询流程

```
高层快速跳跃
逐层下降
定位元素
```

---

## 4.3 复杂度

```
平均 O(log n)
```

---

# 五、Sorted Set操作复杂度

| 操作      | 复杂度          |
| ------- | ------------ |
| ZADD    | O(log n)     |
| ZRANK   | O(log n)     |
| ZRANGE  | O(log n + m) |
| ZINCRBY | O(log n)     |
| ZREM    | O(log n)     |

---

## 危险操作

```
ZRANGE 超大范围
```

后果：

```
阻塞主线程
```

---

# 六、CLI实战：排行榜基础操作

---

## 6.1 添加玩家

```bash
ZADD rank 100 player1
ZADD rank 200 player2
```

---

## 6.2 获取排行榜

```bash
ZREVRANGE rank 0 9 WITHSCORES
```

---

## 6.3 获取排名

```bash
ZREVRANK rank player1
```

---

## 6.4 增加积分

```bash
ZINCRBY rank 50 player1
```

---

# 七、应用实战：游戏积分排行榜

---

## 7.1 需求

实现：

* 实时积分更新
* 查询Top10
* 查询玩家排名
* 查询玩家积分

---

## 7.2 Key设计

```
rank:game
```

---

## 7.3 Go实现：更新积分

```go
func AddScore(ctx context.Context, rdb *redis.Client, player string, score float64) error {
	return rdb.ZIncrBy(ctx, "rank:game", score, player).Err()
}
```

---

## 7.4 Go实现：Top10

```go
func Top10(ctx context.Context, rdb *redis.Client) ([]redis.Z, error) {
	return rdb.ZRevRangeWithScores(ctx, "rank:game", 0, 9).Result()
}
```

---

## 7.5 Go实现：查询排名

```go
func GetRank(ctx context.Context, rdb *redis.Client, player string) (int64, error) {
	return rdb.ZRevRank(ctx, "rank:game", player).Result()
}
```

---

## 7.6 Go实现：查询积分

```go
func GetScore(ctx context.Context, rdb *redis.Client, player string) (float64, error) {
	return rdb.ZScore(ctx, "rank:game", player).Result()
}
```

---

# 八、Score设计技巧

---

## 8.1 时间戳排序

```
score = timestamp
```

用于：

```
最新发布
延迟队列
```

---

## 8.2 多维度权重

示例：

```
score = 点赞*100 + 评论*10 + 浏览
```

---

## 8.3 防止分数冲突

```
score = 分数 + 微秒时间
```

---

# 九、Sorted Set vs List vs Set

| 类型         | 场景 |
| ---------- | -- |
| Sorted Set | 排名 |
| Set        | 去重 |
| List       | 队列 |

---

# 十、工程注意事项

---

## 不要ZRANGE全量

```
分页读取
```

---

## 不要频繁删除大量元素

```
批量操作
```

---

## 不要存超大member

```
存ID
```

---

## 排行榜要限制长度

```bash
ZREMRANGEBYRANK rank 10000 -1
```

---

# 十一、本节课堂任务

必须完成：

1. CLI实现排行榜
2. CLI查询排名
3. CLI增加积分
4. 编写积分更新函数
5. 编写Top10接口
6. 编写排名查询接口
7. 完成排行榜系统

---

# 十二、本节总结

你已经掌握：

* Sorted Set底层结构（dict + skiplist）
* 跳表原理
* 排行榜设计模型
* Score工程技巧
* 实时排名系统实现

---

# 下节课

第7讲：

* Bitmap原理
* HyperLogLog原理
* Geospatial
* Stream基础
* DAU统计系统
* 用户签到系统
