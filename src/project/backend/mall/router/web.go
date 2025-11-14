package router

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"log"
	"mall/utils/logger"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
)

type App struct {
	server *gin.Engine
	addr   string
}

func NewApp(port int, router IRouter) *App {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	// Recover 中间件，全局捕获panic
	engine.Use(gin.Recovery())

	// 日志中间件,自定义过滤器，某些接口不需要记录日志
	engine.Use(AccessLogMiddleware(router.AccessRecordFilter))

	// 注册业务路由
	router.Register(engine)

	return &App{
		server: engine,
		addr:   ":" + strconv.Itoa(port),
	}
}

func (app *App) Run() {
	srv := &http.Server{
		Addr:    app.addr,
		Handler: app.server,
	}

	// 异步启动
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen err: %v", err)
		}
	}()

	logger.Debug(fmt.Sprintf("server started, endpoint: http://localhost%s", app.addr))
	closeCh := make(chan os.Signal, 1)
	signal.Notify(closeCh, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	msg := <-closeCh
	logger.Warn("server closing: ", zap.String("msg", msg.String()))
	srv.Shutdown(context.TODO())
}
