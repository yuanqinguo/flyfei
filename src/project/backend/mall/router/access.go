package router

import "github.com/gin-gonic/gin"

func AccessLogMiddleware(filter func(*gin.Context) bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if filter != nil && !filter(c) {
			c.Next()
			return
		}
		// 这里你可以记录日志
		c.Next()
	}
}
