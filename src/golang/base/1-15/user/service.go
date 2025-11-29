package user

import "1-15/common"

type UserService struct {
	users []*User
}

func NewUserService() *UserService {
	return &UserService{
		users: make([]*User, 0),
	}
}

func (s *UserService) AddUser(user *User) {
	if user != nil {
		s.users = append(s.users, user)
		common.LogOperation("添加用户")
	}
}

func (s *UserService) FindUserByID(id int64) *User {
	for _, user := range s.users {
		if user.ID == id {
			return user
		}
	}
	return nil
}

func (s *UserService) ListAllUsers() {
	common.LogOperation("列出所有用户")
	for _, user := range s.users {
		user.DisplayInfo()
	}
}
