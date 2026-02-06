
# 加餐：Redis 分布式锁与 Redlock

---

# 一、为什么需要分布式锁

## 1.1 单机锁的局限

```go
// 单机锁 - 只在当前进程有效
var mu sync.Mutex

func process() {
    mu.Lock()
    defer mu.Unlock()
    // 操作共享资源
}
```

问题：微服务多实例部署时，单机锁无法跨进程同步

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ 实例 A   │      │ 实例 B   │      │ 实例 C   │
│ 获得锁   │  ?   │ 也想获得 │      │ 也想获得 │
└─────────┘      └─────────┘      └─────────┘
      ↓               ↓               ↓
   都需要访问同一资源（如库存扣减、订单创建）
```

## 1.2 分布式锁要求

| 特性 | 说明 |
|------|------|
| **互斥性** | 任意时刻只有一个客户端获得锁 |
| **防死锁** | 锁有过期时间，避免永久占用 |
| **高可用** | 锁服务不能单点故障 |
| **可重入** | 同一客户端可多次获取锁（可选） |

---

# 二、Redis 单节点锁（生产推荐）

## 2.1 核心命令

```bash
SET resource_name my_random_value NX PX 30000
```

* `NX`：仅当 key 不存在时才设置（互斥）
* `PX 30000`：30秒过期（防死锁）
* `my_random_value`：唯一标识，释放时验证身份

## 2.2 为什么不用简单方案

**错误方案 1**：先 SET 再 EXPIRE
```bash
SET lock:order:123 true
EXPIRE lock:order:123 30
```
**问题**：SET 之后 EXPIRE 之前进程崩溃 → 锁永不过期

**错误方案 2**：删除时不验证身份
```bash
DEL lock:order:123
```
**问题**：可能误删别人的锁（自己的锁过期了，别人的锁刚创建）

## 2.3 正确实现（单节点版）

```go
package redislock

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	ErrLockFailed  = errors.New("failed to acquire lock")
	ErrLockNotHeld = errors.New("lock not held")
)

// Lock 分布式锁结构
type Lock struct {
	client *redis.Client
	key    string
	value  string        // 唯一标识，UUID
	expiry time.Duration // 锁过期时间
}

// NewLock 创建锁实例
func NewLock(client *redis.Client, key string, expiry time.Duration) *Lock {
	return &Lock{
		client: client,
		key:    fmt.Sprintf("lock:%s", key),
		value:  generateUniqueID(),
		expiry: expiry,
	}
}

// TryLock 尝试获取锁
func (l *Lock) TryLock(ctx context.Context) (bool, error) {
	// SET key value NX PX expiry
	ok, err := l.client.SetNX(ctx, l.key, l.value, l.expiry).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

// Lock 阻塞获取锁（带重试）
func (l *Lock) Lock(ctx context.Context) error {
	for {
		ok, err := l.TryLock(ctx)
		if err != nil {
			return err
		}
		if ok {
			return nil
		}
		
		// 短暂等待后重试
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(100 * time.Millisecond):
			continue
		}
	}
}

// Unlock 释放锁 - 使用 Lua 保证原子性
var unlockScript = redis.NewScript(`
	if redis.call("get", KEYS[1]) == ARGV[1] then
		return redis.call("del", KEYS[1])
	else
		return 0
	end
`)

func (l *Lock) Unlock(ctx context.Context) error {
	result, err := unlockScript.Run(ctx, l.client, []string{l.key}, l.value).Result()
	if err != nil {
		return err
	}
	if result.(int64) == 0 {
		return ErrLockNotHeld // 锁已过期或被别人持有
	}
	return nil
}

// Extend 续期（看门狗）
var extendScript = redis.NewScript(`
	if redis.call("get", KEYS[1]) == ARGV[1] then
		return redis.call("pexpire", KEYS[1], ARGV[2])
	else
		return 0
	end
`)

func (l *Lock) Extend(ctx context.Context, extension time.Duration) (bool, error) {
	ok, err := extendScript.Run(ctx, l.client,
		[]string{l.key},
		l.value,
		extension.Milliseconds(),
	).Bool()
	return ok, err
}

// generateUniqueID 生成唯一标识
func generateUniqueID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
```

---

# 三、看门狗自动续期

业务执行时间不确定时，需要自动续期防止锁过期：

```go
func (l *Lock) LockWithWatchdog(ctx context.Context) error {
	// 1. 先获取锁
	if err := l.Lock(ctx); err != nil {
		return err
	}
	
	// 2. 启动看门狗协程
	stop := make(chan struct{})
	go l.watchdog(ctx, stop)
	
	// 3. 将 stop 通道保存，供业务完成后调用
	l.stopWatchdog = stop
	return nil
}

func (l *Lock) watchdog(ctx context.Context, stop chan struct{}) {
	ticker := time.NewTicker(l.expiry / 3) // 1/3 过期时间续期一次
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			// 续期为原过期时间的 2/3
			ok, _ := l.Extend(ctx, l.expiry)
			if !ok {
				// 续期失败，锁可能已丢失，退出看门狗
				return
			}
		case <-stop:
			return
		}
	}
}

func (l *Lock) StopWatchdog() {
	if l.stopWatchdog != nil {
		close(l.stopWatchdog)
	}
}
```

---

# 四、使用示例

## 4.1 基础使用

```go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"your-project/redislock"
	"github.com/redis/go-redis/v9"
)

func main() {
	// 连接 Redis（哨兵模式获取主节点）
	rdb := redis.NewFailoverClient(&redis.FailoverOptions{
		MasterName:    "mymaster",
		SentinelAddrs: []string{"localhost:26379"},
	})
	
	ctx := context.Background()
	
	// 创建锁（10秒过期）
	lock := redislock.NewLock(rdb, "order:123", 10*time.Second)
	
	// 获取锁
	if err := lock.Lock(ctx); err != nil {
		log.Fatal("获取锁失败:", err)
	}
	
	// 确保释放
	defer lock.Unlock(ctx)
	
	// 执行业务
	if err := processOrder(123); err != nil {
		log.Fatal("处理失败:", err)
	}
	
	fmt.Println("处理完成")
}

func processOrder(orderID int) error {
	// 实际的业务逻辑
	time.Sleep(2 * time.Second)
	return nil
}
```

## 4.2 看门狗模式（长任务）

```go
func longTask(ctx context.Context, rdb *redis.Client) error {
	lock := redislock.NewLock(rdb, "heavy:job:456", 10*time.Second)
	
	// 带看门狗的锁
	if err := lock.LockWithWatchdog(ctx); err != nil {
		return err
	}
	// 停止看门狗并释放锁
	defer func() {
		lock.StopWatchdog()
		lock.Unlock(ctx)
	}()
	
	// 执行业务（可能执行 30 秒，锁会自动续期）
	return heavyComputation()
}
```

---

# 五、Redlock 原理

## 5.1 为什么需要多节点

单节点 Redis 的风险：
```
Master 宕机 → Sentinel 切换 → 可能丢失锁数据 → 两个客户端同时获得锁
```

Redlock 算法（Redis 作者提出）：
- 在 **N 个独立 Redis 节点** 同时获取锁
- 成功节点 ≥ N/2+1 且耗时 < 过期时间，才算成功
- 容忍少数节点故障

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Node 1  │    │ Node 2  │    │ Node 3  │
│  成功   │    │  成功   │     │  失败   │
└─────────┘    └─────────┘    └─────────┘
      └────────────┬────────────┘
                   ▼
              2/3 成功，获得锁
              Node 3 故障不影响
```

# 六、强一致需求：使用 etcd

## 6.1 为什么选 etcd

| 对比项 | Redis Redlock | etcd |
|--------|---------------|------|
| **一致性** | 最终一致（AP） | 强一致（CP） |
| **实现复杂度** | 高（客户端实现算法） | 低（服务端保证） |
| **可靠性证明** | 有争议 | Raft 协议严格证明 |
| **代码复杂度** | 高 | 低 |

**建议**：金融交易、库存扣减等强一致场景，**直接使用 etcd**

---

# 七、本节总结

| 方案 | 适用场景 | 课程建议 |
|------|---------|---------|
| **单节点 Redis 锁** | 绝大部分业务场景 | ✅ **推荐**，简单高效 |
| **单节点 + 看门狗** | 执行时间不确定的长任务 | ✅ **推荐**，自动续期 |
| **Redlock 多节点** | 已有多个 Redis， tolerate 复杂度 | ⚠️ 了解原理，谨慎使用 |
| **etcd** | 强一致要求（金融、库存） | ✅ **强一致首选** |

**核心观点**：
- Redis 分布式锁**单节点版够用**，配合**哨兵模式**实现高可用
- 不要自己实现 Redlock，复杂度高于收益
- **强一致需求请用 etcd**，Redis 不是做这个的最佳选择

---

# 八、课后任务

1. 实现单节点分布式锁的获取与释放
2. 实现看门狗自动续期功能
3. 对比测试：带看门狗 vs 不带看门狗，模拟业务执行 30 秒
4. **思考题**：你的业务场景需要强一致吗？
