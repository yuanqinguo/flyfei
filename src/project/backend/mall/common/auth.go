package common

type AdminUser struct {
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
}

type User struct {
	UserID   int64  `json:"user_id"`
	NickName string `json:"nick_name"`
}
