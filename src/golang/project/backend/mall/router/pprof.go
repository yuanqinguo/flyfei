package router

import (
	"github.com/gin-gonic/gin"
	"net/http/pprof"
)

func SetupPprof(r *gin.Engine, prefix string) {
	group := r.Group(prefix)
	{
		group.GET("/", gin.WrapF(pprof.Index))
		group.GET("/cmdline", gin.WrapF(pprof.Cmdline))
		group.GET("/profile", gin.WrapF(pprof.Profile))
		group.GET("/symbol", gin.WrapF(pprof.Symbol))
		group.GET("/trace", gin.WrapF(pprof.Trace))
		group.GET("/heap", pprofHandler("heap"))
		group.GET("/goroutine", pprofHandler("goroutine"))
		group.GET("/block", pprofHandler("block"))
		group.GET("/mutex", pprofHandler("mutex"))
	}
}

// 统一返回 pprof 的 Profile 数据
func pprofHandler(name string) gin.HandlerFunc {
	return func(c *gin.Context) {
		pprof.Handler(name).ServeHTTP(c.Writer, c.Request)
	}
}
