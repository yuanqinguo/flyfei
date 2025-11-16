package dto

type UserInfoResp struct {
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
}

type CreateUserReq struct {
	Name     string `json:"name"`
	NickName string `json:"nick_name"`
	Mobile   string `json:"mobile"`
	Sex      int32  `json:"sex"`
}

type UpdateUserReq struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	NickName string `json:"nick_name"`
	Sex      int32  `json:"sex"`
}

type UpdateUserStatusReq struct {
	ID     int64 `json:"id"`
	Status int32 `json:"status"`
}
