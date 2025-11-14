package admin

import (
	"context"
	"errors"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"mall/common"
	"mall/service/dto"
	"mall/utils/logger"
)

func (s *Service) GetUserInfo(ctx context.Context, adminUser *common.AdminUser) (*dto.UserInfoResp, common.Errno) {
	user, err := s.adminUser.GetUserInfo(ctx, 1)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.UserNotFoundErr
		}
		logger.Error("GetUserInfo GetUserInfo error", zap.Error(err), zap.Any("user_id", adminUser))
		return nil, common.DatabaseErr.WithErr(err)
	}
	return &dto.UserInfoResp{
		Name:   user.Name,
		UserID: user.ID,
	}, common.OK
}
