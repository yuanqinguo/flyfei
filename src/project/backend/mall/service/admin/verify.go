package admin

import (
	"context"
	"encoding/json"
	"github.com/wenlng/go-captcha/v2/slide"
	"go.uber.org/zap"
	"mall/common"
	"mall/service/dto"
	"mall/utils/logger"
	"mall/utils/tools"
	"time"
)

func (s *Service) GetSlideCaptcha(ctx context.Context) (*dto.GetVerifyCaptchaResp, common.Errno) {
	captData, err := s.captcha.Generate()
	if err != nil {
		logger.Error("GetSlideCaptcha Generate error", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}
	dotData := captData.GetData()
	if dotData == nil {
		logger.Error("GetSlideCaptcha GetData error")
		return nil, common.ServerErr.WithMsg("GetData is nil")
	}
	dots, err := json.Marshal(dotData)
	if err != nil {
		logger.Error("GetSlideCaptcha json.Marshal error", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}

	var mBs64Data, tBs64Data string
	mBs64Data, err = captData.GetMasterImage().ToBase64()
	if err != nil {
		logger.Error("GetSlideCaptcha GetMasterImage error", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}
	tBs64Data, err = captData.GetTileImage().ToBase64()
	if err != nil {
		logger.Error("GetSlideCaptcha GetTileImage error", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}

	key := tools.UUIDHex()
	err = s.verify.SetCaptchaKey(ctx, key, string(dots), time.Minute*2)
	if err != nil {
		logger.Error("GetSlideCaptcha SetCaptchaKey error", zap.Error(err))
		return nil, common.RedisErr.WithErr(err)
	}

	return &dto.GetVerifyCaptchaResp{
		Key:            key,
		ImageBs64:      mBs64Data,
		TitleImageBs64: tBs64Data,
		TitleHeight:    dotData.Height,
		TitleWidth:     dotData.Width,
		TitleX:         dotData.TileX,
		TitleY:         dotData.TileY,
		Expire:         110,
	}, common.OK
}

func (s *Service) CheckSlideCaptcha(ctx context.Context, req *dto.CheckCaptchaReq) (*dto.CheckCaptchaDtoResp, common.Errno) {
	captData, err := s.verify.GetCaptchaKey(ctx, req.Key)
	if err != nil {
		logger.Error("CheckSlideCaptcha GetCaptchaKey error", zap.Error(err))
		return nil, common.RedisErr.WithErr(err)
	}
	if captData == "" {
		return nil, common.ParamErr.WithMsg("滑块已过期，请刷新重试")
	}
	dot := slide.Block{}
	err = json.Unmarshal([]byte(captData), &dot)
	if err != nil {
		logger.Error("CheckSlideCaptcha json.Unmarshal error", zap.Error(err))
		return nil, common.InvalidCaptchaErr
	}
	ok := slide.CheckPoint(int64(req.SlideX), int64(req.SlideY), int64(dot.X), int64(dot.Y), 5)
	if !ok {
		return nil, common.InvalidCaptchaErr
	}
	ticket := tools.UUIDHex()
	err = s.verify.SetCaptchaTicket(ctx, ticket, req.Key, time.Minute*5)
	if err != nil {
		logger.Error("CheckSlideCaptcha SetCaptchaTicket error", zap.Error(err))
		return nil, common.RedisErr.WithErr(err)
	}
	return &dto.CheckCaptchaDtoResp{
		Ticket: ticket,
		Expire: 280,
	}, common.OK

}
