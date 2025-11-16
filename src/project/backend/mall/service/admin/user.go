package admin

import (
	"context"
	"errors"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"mall/common"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"
)

func (s *Service) CreateUser(ctx context.Context, adminUser *common.AdminUser, req *dto.CreateUserReq) (int64, common.Errno) {
	userID, err := s.adminUser.CreateUser(ctx, &do.CreateUser{
		AdminUserID: adminUser.UserID,
		Name:        req.Name,
		NickName:    req.NickName,
		Mobile:      req.Mobile,
		Sex:         req.Sex,
	})
	if err != nil {
		logger.Error("CreateUser error", zap.Error(err), zap.Any("req", req))
		return 0, common.DatabaseErr.WithErr(err)
	}
	return userID, common.OK
}

func (s *Service) UpdateUser(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateUserReq) common.Errno {
	err := s.adminUser.UpdateUser(ctx, &do.UpdateUser{
		ID:          req.ID,
		Name:        req.Name,
		NickName:    req.NickName,
		Sex:         req.Sex,
		AdminUserID: adminUser.UserID,
	})
	if err != nil {
		logger.Error("UpdateUser error", zap.Error(err), zap.Any("req", req))
		return common.DatabaseErr.WithErr(err)
	}
	return common.OK
}

func (s *Service) UpdateUserStatus(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateUserStatusReq) common.Errno {
	err := s.adminUser.UpdateUserStatus(ctx, &do.UpdateUserStatus{
		ID:          req.ID,
		Status:      req.Status,
		AdminUserID: adminUser.UserID,
	})
	if err != nil {
		logger.Error("UpdateUserStatus error", zap.Error(err), zap.Any("req", req))
		return common.DatabaseErr.WithErr(err)
	}
	return common.OK
}

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
