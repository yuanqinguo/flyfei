package admin

import (
	"github.com/gin-gonic/gin"
	"mall/api"
	"mall/common"
)

func (c *Ctrl) GetUserInfo(ctx *gin.Context) {
	// token common.AdminUser
	resp, errno := c.user.GetUserInfo(ctx.Request.Context(), &common.AdminUser{})
	api.WriteResp(ctx, resp, errno)
}
