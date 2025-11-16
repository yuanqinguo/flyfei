package admin

import (
	"github.com/gin-gonic/gin"
	"mall/api"
	"mall/common"
	"mall/service/dto"
)

func (c *Ctrl) GetSmsCodeCaptcha(ctx *gin.Context) {
	req := &dto.GetVerifyCaptchaReq{}
	if err := ctx.BindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.GetSlideCaptcha(ctx.Request.Context())
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) CheckSmsCodeCaptcha(ctx *gin.Context) {
	req := &dto.CheckCaptchaReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithErr(err))
		return
	}
	resp, errno := c.user.CheckSlideCaptcha(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}
