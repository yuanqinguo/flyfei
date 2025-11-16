package api

import (
	"github.com/gin-gonic/gin"
	"mall/common"
	"mall/consts"
	"net/http"
)

type Resp struct {
	Code   int    `json:"code"`
	Msg    string `json:"msg"`
	ErrMsg string `json:"err_msg"`
	Data   any    `json:"data"`
}

func WriteResp(ctx *gin.Context, data any, errno common.Errno) {
	ctx.JSON(http.StatusOK, Resp{
		Code:   errno.Code,
		Msg:    errno.Msg,
		ErrMsg: errno.ErrMsg,
		Data:   data,
	})
}

func GetUserFromCtx(ctx *gin.Context) *common.User {
	user, exist := ctx.Get(consts.CustomerUserKey)
	if !exist {
		return nil
	}
	return user.(*common.User)
}

func GetAdminUserFromCtx(ctx *gin.Context) *common.AdminUser {
	user, exist := ctx.Get(consts.AdminUserKey)
	if !exist {
		return nil
	}
	return user.(*common.AdminUser)
}
