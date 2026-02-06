# 第10讲：Redis核心机制（持久化与事务）

---

# 一、课时目标

完成本节后可以：

* 理解 Redis 为什么需要持久化
* 掌握 RDB 与 AOF 的工作原理
* 理解 RDB vs AOF 的工程选型
* 理解 Redis 事务机制的真实边界
* 理解 WATCH 的副作用（连接绑定、事务丢失）
* 掌握生产替代方案：Lua原子脚本
* 使用 Go + Lua 实现库存扣减
* 编写 RDB/AOF 恢复测试

---

# 二、为什么Redis需要持久化

Redis本质：

```
内存数据库
```

如果没有持久化：

```
进程退出 → 数据丢失
服务器宕机 → 数据丢失
容器重启 → 数据丢失
```

所以需要：

```
把内存数据写入磁盘
```

---

## 2.1 Redis持久化的真实目标

不是：

```
强一致数据库
```

而是：

```
减少数据丢失
快速恢复服务
```

---

# 三、RDB持久化机制（快照）

---

## 3.1 什么是RDB

RDB：

```
某一时刻Redis内存的完整快照
```

生成文件：

```
dump.rdb
```

理解：

```
Redis内存截图
```

---

## 3.2 RDB执行流程

```
Redis Fork子进程
        │
        ▼
子进程生成数据快照
        │
        ▼
写入 dump.rdb
        │
        ▼
替换旧文件
```

关键：

```
主线程不中断服务
```

---

## 3.3 RDB触发方式

自动触发配置：

```
save 900 1
save 300 10
save 60 10000
```

含义：

```
900秒1次修改
300秒10次修改
60秒10000次修改
```

---

手动触发：

```bash
SAVE
```

问题：

```
阻塞Redis
```

工程禁止。

---

```bash
BGSAVE
```

特点：

```
后台生成
```

工程推荐。

---

## 3.4 RDB优点

* 恢复速度快
* 文件体积小
* CPU开销低
* 适合备份

---

## 3.5 RDB缺点

* 可能丢失最近数据
* Fork消耗内存
* 不适合频繁写盘

---

# 四、AOF持久化机制（命令日志）

---

## 4.1 什么是AOF

AOF本质：

```
记录所有写命令
```

示例：

```
SET user jack
INCR counter
HSET profile name tom
```

恢复方式：

```
重新执行日志
```

---

## 4.2 AOF写入流程

```
写命令
   │
   ▼
写入AOF缓冲区
   │
   ▼
根据策略刷盘
```

---

## 4.3 AOF刷盘策略

---

### always

```
每次命令写盘
```

优点：

```
最安全
```

缺点：

```
最慢
```

---

### everysec（推荐）

```
每秒刷盘
```

风险：

```
最多丢1秒数据
```

---

### no

```
操作系统决定
```

风险：

```
不可控
```

---

## 4.4 AOF重写机制

问题：

```
日志无限增长
```

解决：

```
AOF Rewrite
```

原理：

```
生成最小命令集合
```

例子：

```
INCR 1000次
```

重写后：

```
SET counter 1000
```

---

## 4.5 AOF优点

* 数据安全性高
* 可回放
* 可读日志

---

## 4.6 AOF缺点

* 文件大
* 恢复慢
* 写入成本高

---

# 五、RDB vs AOF选型策略

---

## 5.1 只使用RDB

适合：

```
缓存
排行榜
统计
```

---

## 5.2 只使用AOF

适合：

```
用户状态
轻量业务数据
```

---

## 5.3 RDB + AOF（生产推荐）

```
恢复快 + 数据更安全
```

---

## 5.4 常见生产配置

```
appendonly yes
appendfsync everysec
```

---

# 六、Redis事务机制（必须理解）

---

## 6.1 Redis事务是什么

Redis事务：

```
命令批量顺序执行
```

不是：

```
数据库事务
```

---

## 6.2 基础命令

```bash
MULTI
SET a 1
INCR a
EXEC
```

执行流程：

```
进入事务模式
命令入队
EXEC执行
```

---

## 6.3 Redis事务保证什么

保证：

```
命令执行期间不会插入其他命令
```

不保证：

```
全部成功
回滚
隔离级别
```

---

## 6.4 入队错误 vs 执行错误

入队错误：

```
EXEC直接失败
```

执行错误：

```
其他命令继续执行
```

---

# 七、为什么生产中不推荐直接使用WATCH（重点）

结论：

```
WATCH理论正确
工程风险高
```

原因不是功能，而是：

```
连接绑定 + 网络风险 + 并发失败风暴
```

---

## 7.1 WATCH绑定连接

WATCH监控：

```
绑定当前TCP连接
```

但Go客户端：

```
使用连接池
```

可能导致：

```
WATCH状态丢失
```

---

## 7.2 网络问题导致事务丢失

真实生产：

```
Redis重启
网络闪断
连接断开
```

可能出现：

```
WATCH设置成功
但EXEC未执行
```

事务直接丢失。

---

## 7.3 高并发下失败风暴

WATCH本质：

```
乐观锁
```

并发高：

```
EXEC大量失败
疯狂重试
```

导致：

```
CPU飙升
Redis压力增大
```

---

# 八、生产解决方案：Lua脚本替代WATCH（核心）

生产标准：

```
使用Lua实现原子逻辑
```

原因：

```
Redis内部执行
天然原子
不依赖连接
无重试风暴
```

---

## 8.1 Lua执行模型

```
客户端发送Lua
        │
        ▼
Redis内部执行
        │
        ▼
一次完成逻辑
```

执行期间：

```
不会被打断
```

---

## 8.2 Lua与WATCH对比

| 项目    | WATCH | Lua |
| ----- | ----- | --- |
| 连接绑定  | 是     | 否   |
| 网络重试  | 复杂    | 无   |
| 并发冲突  | 高     | 低   |
| 原子性   | 部分    | 完整  |
| 工程复杂度 | 高     | 低   |

---

# 九、本节核心实战：Lua库存扣减系统

---

## 9.1 需求

实现：

```
库存扣减
禁止超卖
高并发安全
```

---

## 9.2 Key设计

```
product:stock:{id}
```

---

## 9.3 Lua脚本

```lua
local stock = tonumber(redis.call("GET", KEYS[1]))

if not stock then
    return -1
end

if stock <= 0 then
    return 0
end

redis.call("DECR", KEYS[1])

return 1
```

返回值：

```
1 成功
0 库存不足
-1 key不存在
```

---

## 9.4 Go调用Lua脚本（核心代码）

```go
var decrScript = redis.NewScript(`
local stock = tonumber(redis.call("GET", KEYS[1]))

if not stock then
    return -1
end

if stock <= 0 then
    return 0
end

redis.call("DECR", KEYS[1])

return 1
`)

func DecreaseStock(ctx context.Context, rdb *redis.Client, id int64) (int64, error) {
	key := fmt.Sprintf("product:stock:%d", id)

	return decrScript.Run(ctx, rdb, []string{key}).Int64()
}
```

---

## 9.5 CLI测试

```bash
SET product:stock:1 3
```

执行4次扣减：

```
前三次成功
第四次失败
```

---

# 十、RDB/AOF恢复测试（实战）

---

## 10.1 写入测试数据

```bash
SET user:1 jack
```

---

## 10.2 触发持久化

```bash
BGSAVE
```

---

## 10.3 停止Redis

```bash
docker stop redis-dev
```

---

## 10.4 重启Redis

```bash
docker start redis-dev
```

---

## 10.5 验证恢复

```bash
GET user:1
```

---

# 十一、本节课堂任务

必须完成：

1. 执行BGSAVE测试RDB
2. 修改AOF配置并验证
3. 重启Redis测试恢复
4. 使用MULTI执行简单事务
5. 编写Lua库存扣减
6. Go调用Lua脚本
7. 并发测试库存系统

---

# 十二、本节重点陷阱

---

## 12.1 Redis事务不是数据库事务

没有：

```
回滚
锁
隔离级别
```

---

## 12.2 WATCH工程风险高

```
连接绑定
事务丢失
高并发失败
```

---

## 12.3 Lua不能写复杂逻辑

否则：

```
阻塞主线程
```

---

# 十三、本节总结

你已经掌握：

* RDB快照机制
* AOF日志机制
* 持久化选型策略
* Redis事务真实边界
* WATCH副作用
* Lua替代WATCH方案
* Lua库存扣减系统
* Redis数据恢复流程

---

# 下节课

第11讲：

* Pipeline性能优化
* Lua性能优化
* 连接池设计
* 主从复制
* Sentinel
* Cluster分片
* 缓存雪崩/击穿/穿透

