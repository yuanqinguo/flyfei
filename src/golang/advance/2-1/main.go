package main

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"
)

func fetchData(url string, wg *sync.WaitGroup) {
	time.Sleep(time.Millisecond * 100)

	fmt.Println("Fetching data from ", url, "delay ", 100)

	if wg != nil {
		defer wg.Done()
	}
}

func worker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("worker", id, "done")
			return
		case <-time.After(time.Second * 1):
			fmt.Println("worker", id, "working")
		}
	}
}

func limitedWorkerPool(tasks []string, max int) {
	start := time.Now()
	semaphore := make(chan struct{}, max)
	var wg sync.WaitGroup
	for i, task := range tasks {
		wg.Add(1)
		semaphore <- struct{}{}
		go func(i int, task string) {
			defer func() {
				<-semaphore
				wg.Done()
			}()
			fmt.Println("task", i, "start")
			fetchData(task, nil)
		}(i, task)
	}
	wg.Wait()
	fmt.Println("All tasks completed", time.Since(start))
}

func showGoroutineInfo() {
	fmt.Printf("当前Goroutine数量: %d\n", runtime.NumGoroutine())
	fmt.Printf("CPU核心数: %d\n", runtime.NumCPU())

	// 设置最大并行度
	runtime.GOMAXPROCS(4)
}

func main() {
	start := time.Now()

	urlSlice := []string{
		"https://www.google.com",
		"https://www.baidu.com",
		"https://www.bing.com",
		"https://www.yahoo.com",
		"https://www.yandex.com",
	}

	for _, v := range urlSlice {
		fetchData(v, nil)
	}

	fmt.Println("Total time taken: ", time.Since(start))

	start = time.Now()
	var wg sync.WaitGroup
	for _, v := range urlSlice {
		wg.Add(1)
		go fetchData(v, &wg)
	}
	wg.Wait()
	fmt.Println("go Total time taken: ", time.Since(start))

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	go worker(ctx, 1)
	go worker(ctx, 2)

	time.Sleep(time.Second * 5)

	limitedWorkerPool(urlSlice, 3)

	showGoroutineInfo()
}
