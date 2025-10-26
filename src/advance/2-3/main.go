package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type Inventory struct {
	stock   int
	rwMutex sync.RWMutex // 保护库存
}

func (v *Inventory) getStock() int {
	v.rwMutex.RLock()
	defer v.rwMutex.RUnlock()
	return v.stock
}

func (v *Inventory) deductStock(quantity int) bool {
	v.rwMutex.Lock()
	defer v.rwMutex.Unlock()
	if v.stock < quantity {
		fmt.Println("库存不足")
		return false
	}
	time.Sleep(time.Millisecond * 100)
	v.stock = v.stock - quantity
	return true
}

type Counter struct {
	value int64
}

func (v *Counter) Inc() {
	time.Sleep(time.Millisecond * 100)
	atomic.AddInt64(&v.value, 1)
}

func (v *Counter) Dec() {
	atomic.AddInt64(&v.value, -1)
}
func (v *Counter) Get() int64 {
	return atomic.LoadInt64(&v.value)
}

func main() {
	inventory := &Inventory{stock: 100}

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			inventory.deductStock(1)
		}()
	}

	for i := 0; i < 20; i++ {
		time.Sleep(time.Millisecond * 100)
		fmt.Println("剩余库存:", inventory.getStock())
	}

	wg.Wait()

	fmt.Println("最终剩余库存:", inventory.getStock())

	// 点赞
	var counter Counter
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter.Inc()
		}()
	}

	// 取消点赞
	decFunc := func() {
		defer wg.Done()
		counter.Dec()
	}
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go decFunc()
	}
	for i := 0; i < 10; i++ {
		time.Sleep(time.Millisecond * 10)
		fmt.Println("点赞数:", counter.Get())
	}
	wg.Wait()
	fmt.Println("最后： 点赞数:", counter.Get())
}
