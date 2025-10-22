package main

import (
	"encoding/json"
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"log"
	"math/rand"
	"net/http"
	_ "net/http/pprof"
	"os"
	"runtime"
	"time"

	"github.com/gogf/gf/util/gconv"
	"github.com/sirupsen/logrus"
)

var atom = zap.NewAtomicLevelAt(zap.FatalLevel)
var logger = logrus.New()
var loggerV2 *zap.Logger

// 用户结构
type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Active   bool   `json:"active"`
	CreateAt string `json:"created_at"`
}

// 内存缓存模拟
var userCache = make(map[int]*User)

// 初始化日志
func initLogger() {

	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})

	// 输出到文件和控制台
	//file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	//if err == nil {
	//	logger.SetOutput(file)
	//} else {
	//	logger.Info("无法创建日志文件，使用标准输出")
	//}

	logger.SetOutput(os.Stdout)

	// 设置日志级别
	logger.SetLevel(logrus.DebugLevel)
}

func initLoggerV2() {
	// 如果写日志文件，可以使用 配置 Lumberjack 进行日志轮转
	config := zap.Config{
		Level:       atom, // 改字段原子修改，可以动态更改日志等级
		Development: false,
		Encoding:    "json", // 指定 JSON 编码
		EncoderConfig: zapcore.EncoderConfig{
			MessageKey:    "msg",
			LevelKey:      "level",
			TimeKey:       "time",
			CallerKey:     "caller",
			StacktraceKey: "stacktrace",
			EncodeTime:    zapcore.TimeEncoderOfLayout("2006-01-02 15:04:05.000"),
			EncodeLevel:   zapcore.LowercaseLevelEncoder,
			EncodeCaller:  zapcore.ShortCallerEncoder,
		},
		OutputPaths:      []string{"stdout"},
		ErrorOutputPaths: []string{"stderr"},
	}

	tempLogger, err := config.Build()
	if err != nil {
		panic(err)
	}

	loggerV2 = tempLogger.WithOptions(zap.AddCaller(), zap.AddStacktrace(zap.ErrorLevel))
}

func updateLevel(level int8) {
	atom.SetLevel(zapcore.Level(level))
	loggerV2.Debug("V2日志级别已更新",
		zap.Int8("level", level))
}

// 模拟数据库查询
func getUserFromDB(id int) (*User, error) {
	// 模拟查询延迟
	time.Sleep(time.Millisecond * time.Duration(rand.Intn(100)))

	user := &User{
		ID:       id,
		Name:     fmt.Sprintf("用户%d", id),
		Email:    fmt.Sprintf("user%d@example.com", id),
		Active:   id%2 == 0,
		CreateAt: time.Now().Format("2006-01-02 15:04:05"),
	}

	logger.WithFields(logrus.Fields{
		"user_id": id,
		"action":  "db_query",
	}).Debug("数据库查询完成")

	loggerV2.Info("V2数据库查询完成",
		zap.String("user_id", gconv.String(id)),
		zap.String("action", "db_query"))

	return user, nil
}

// 获取用户信息（带缓存）
func getUserHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// 记录请求开始
	logger.WithFields(logrus.Fields{
		"method": r.Method,
		"path":   r.URL.Path,
		"ip":     r.RemoteAddr,
	}).Info("收到请求")

	loggerV2.Debug("V2收到请求",
		zap.Any("r", r))

	// 解析用户ID
	id := 1
	if r.URL.Query().Get("id") != "" {
		_, err := fmt.Sscanf(r.URL.Query().Get("id"), "%d", &id)
		if err != nil {
			logger.WithFields(logrus.Fields{
				"error": err,
				"id":    r.URL.Query().Get("id"),
			}).Warn("无效的用户ID")

			http.Error(w, `{"error": "无效的用户ID"}`, http.StatusBadRequest)
			return
		}
	}

	// 检查缓存
	if user, exists := userCache[id]; exists {
		logger.WithFields(logrus.Fields{
			"user_id": id,
			"action":  "cache_hit",
		}).Debug("缓存命中")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
		return
	}

	// 缓存未命中，查询数据库
	logger.WithFields(logrus.Fields{
		"user_id": id,
		"action":  "cache_miss",
	}).Debug("缓存未命中")

	user, err := getUserFromDB(id)
	if err != nil {
		logger.WithFields(logrus.Fields{
			"error":   err,
			"user_id": id,
		}).Error("查询用户失败")

		http.Error(w, `{"error": "用户不存在"}`, http.StatusNotFound)
		return
	}

	// 写入缓存
	userCache[id] = user

	// 记录内存使用
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)

	// 记录请求完成
	duration := time.Since(start)
	logger.Info("test", zap.Error(err))
	logger.WithFields(logrus.Fields{
		"user_id":     id,
		"duration_ms": duration.Milliseconds(),
		"alloc_mb":    m.Alloc / 1024 / 1024,
		"cache_size":  len(userCache),
	}).Info("请求处理完成")
}

// 模拟内存泄漏的函数
func simulateMemoryLeak() {
	go func() {
		var leak [][]byte
		for {
			// 每秒钟泄漏1MB内存
			leak = append(leak, make([]byte, 1024*1024))
			time.Sleep(time.Second)

			if len(leak) > 10 { // 防止无限增长影响系统
				leak = leak[:5]
			}
		}
	}()
}

// 性能测试接口
func heavyComputation(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// 模拟CPU密集型计算
	result := 0
	for i := 0; i < 1000000; i++ {
		result += i * i
	}

	// 模拟内存分配
	data := make([]int, 10000)
	for i := range data {
		data[i] = i * i
	}

	duration := time.Since(start)

	response := map[string]interface{}{
		"result":   result,
		"duration": duration.String(),
		"data_len": len(data),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	logger.WithFields(logrus.Fields{
		"action":      "heavy_computation",
		"duration_ms": duration.Milliseconds(),
	}).Info("计算完成")
}

func main() {
	// 初始化
	initLogger()
	initLoggerV2()
	rand.Seed(time.Now().UnixNano())

	logger.WithFields(logrus.Fields{
		"port": 8080,
		"version": map[string]interface{}{
			"go": runtime.Version(),
			"os": runtime.GOOS,
		},
	}).Info("应用程序启动")
	loggerV2.Info("V2应用程序启动111")

	updateLevel(int8(zap.DebugLevel))
	loggerV2.Error("V2应用程序启动222",
		zap.String("str", "this is test value"),
		zap.Any("mapp", map[string]interface{}{
			"test":  "this is test value",
			"test2": "this is test2 value",
		}))

	// 启动性能分析（默认在 /debug/pprof）
	logger.Info("性能分析端点: http://localhost:8080/debug/pprof")

	// 模拟内存泄漏（用于演示调试）
	if os.Getenv("SIMULATE_LEAK") == "1" {
		logger.Warn("模拟内存泄漏已启用")
		simulateMemoryLeak()
	}

	// 设置路由
	http.HandleFunc("/user", getUserHandler)
	http.HandleFunc("/compute", heavyComputation)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status": "healthy"}`))
	})

	// 记录启动信息
	logger.WithFields(logrus.Fields{
		"port":    8080,
		"version": "1.0.0",
	}).Info("HTTP服务器启动")

	// 启动服务器
	log.Fatal(http.ListenAndServe(":8080", nil))
}
