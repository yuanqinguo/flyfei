package router

import "github.com/gin-gonic/gin"

func AuthMiddleware(filter func(*gin.Context) bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if filter != nil && !filter(c) {
			c.Next()
			return
		}
		// 这里是鉴权中间件
		c.Next()
	}
}
