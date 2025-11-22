package router

import (
	"context"
	"github.com/gin-gonic/gin"
	"mall/common"
	"mall/consts"
	"net/http"
)

type TokenFun func(ctx context.Context, token string) (*common.User, error)
type TokenAdminFun func(ctx context.Context, token string) (*common.AdminUser, error)

// 用户侧鉴权中间件
func AuthMiddleware(filter func(*gin.Context) bool, getTokenFun TokenFun) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if filter != nil && !filter(ctx) {
			ctx.Next()
			return
		}
		token := ctx.GetHeader(consts.UserTokenKey)
		if len(token) == 0 {
			ctx.JSON(http.StatusUnauthorized, common.AuthErr)
			ctx.Abort()
			return
		}
		user, err := getTokenFun(ctx, token)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, common.AuthErr.WithErr(err))
			ctx.Abort()
			return
		}
		ctx.Set(consts.CustomerUserKey, user)
		ctx.Next()
	}
}

// 管理后台用户中间件
func AdminAuthMiddleware(filter func(*gin.Context) bool, getTokenFun TokenAdminFun) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if filter != nil && !filter(ctx) {
			ctx.Next()
			return
		}
		token := ctx.GetHeader(consts.AdminTokenKey)
		if len(token) == 0 {
			ctx.JSON(http.StatusUnauthorized, common.AuthErr)
			ctx.Abort()
			return
		}
		user, err := getTokenFun(ctx, token)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, common.AuthErr.WithErr(err))
			ctx.Abort()
			return
		}
		ctx.Set(consts.AdminUserKey, user)
		ctx.Next()
	}
}
