package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

var users = []User{
	{ID: 1, Name: "张三", Email: "zhangsan@example.com", Role: "admin"},
	{ID: 2, Name: "李四", Email: "lisi@example.com", Role: "user"},
	{ID: 3, Name: "王五", Email: "wangwu@example.com", Role: "user"},
}

func main() {
	// 用户相关接口
	http.HandleFunc("/users/info", getUserInfo)  // 获取用户信息
	http.HandleFunc("/users/list", getUserList)  // 获取用户列表
	http.HandleFunc("/users/create", createUser) // 创建用户
	http.HandleFunc("/users/update", updateUser) // 更新用户
	http.HandleFunc("/users/delete", deleteUser) // 删除用户

	fmt.Println("统一风格API服务器启动在 :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// 获取用户信息
func getUserInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "GET" {
		sendError(w, http.StatusMethodNotAllowed, "只支持GET方法")
		return
	}

	query := r.URL.Query()
	idStr := query.Get("id")
	if idStr == "" {
		sendError(w, http.StatusBadRequest, "缺少用户ID参数")
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		sendError(w, http.StatusBadRequest, "用户ID格式错误")
		return
	}

	for _, user := range users {
		if user.ID == id {
			sendSuccess(w, user, "获取用户信息成功")
			return
		}
	}

	sendError(w, http.StatusNotFound, "用户不存在")
}

// 获取用户列表
func getUserList(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "GET" {
		sendError(w, http.StatusMethodNotAllowed, "只支持GET方法")
		return
	}

	query := r.URL.Query()

	// 构建过滤条件
	filteredUsers := make([]User, 0)
	roleFilter := query.Get("role")
	search := query.Get("search")

	for _, user := range users {
		// 角色过滤
		if roleFilter != "" && user.Role != roleFilter {
			continue
		}

		// 搜索过滤
		if search != "" {
			if !strings.Contains(strings.ToLower(user.Name), strings.ToLower(search)) &&
				!strings.Contains(strings.ToLower(user.Email), strings.ToLower(search)) {
				continue
			}
		}

		filteredUsers = append(filteredUsers, user)
	}

	// 分页参数
	page, _ := strconv.Atoi(query.Get("page"))
	if page == 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(query.Get("page_size"))
	if pageSize == 0 {
		pageSize = 10
	}

	// 分页处理
	start := (page - 1) * pageSize
	if start >= len(filteredUsers) {
		sendSuccess(w, []User{}, "获取用户列表成功")
		return
	}
	end := start + pageSize
	if end > len(filteredUsers) {
		end = len(filteredUsers)
	}

	result := filteredUsers[start:end]

	sendSuccess(w, map[string]interface{}{
		"list": result,
		"pagination": map[string]interface{}{
			"page":       page,
			"page_size":  pageSize,
			"total":      len(filteredUsers),
			"total_page": (len(filteredUsers) + pageSize - 1) / pageSize,
		},
	}, "获取用户列表成功")
}

// 创建用户
func createUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "POST" {
		sendError(w, http.StatusMethodNotAllowed, "只支持POST方法")
		return
	}

	var newUser User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		sendError(w, http.StatusBadRequest, "解析用户数据失败")
		return
	}

	// 生成ID
	newUser.ID = len(users) + 1
	users = append(users, newUser)

	sendSuccess(w, newUser, "用户创建成功")
}

// 更新用户
func updateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "POST" {
		sendError(w, http.StatusMethodNotAllowed, "只支持POST方法")
		return
	}

	var updateData struct {
		ID    int    `json:"id"`
		Name  string `json:"name,omitempty"`
		Email string `json:"email,omitempty"`
		Role  string `json:"role,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		sendError(w, http.StatusBadRequest, "解析更新数据失败")
		return
	}

	if updateData.ID == 0 {
		sendError(w, http.StatusBadRequest, "用户ID不能为空")
		return
	}

	for i, user := range users {
		if user.ID == updateData.ID {
			if updateData.Name != "" {
				users[i].Name = updateData.Name
			}
			if updateData.Email != "" {
				users[i].Email = updateData.Email
			}
			if updateData.Role != "" {
				users[i].Role = updateData.Role
			}

			sendSuccess(w, users[i], "用户更新成功")
			return
		}
	}

	sendError(w, http.StatusNotFound, "用户不存在")
}

// 删除用户
func deleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "POST" {
		sendError(w, http.StatusMethodNotAllowed, "只支持POST方法")
		return
	}

	var deleteData struct {
		ID int `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&deleteData); err != nil {
		sendError(w, http.StatusBadRequest, "解析删除数据失败")
		return
	}

	if deleteData.ID == 0 {
		sendError(w, http.StatusBadRequest, "用户ID不能为空")
		return
	}

	for i, user := range users {
		if user.ID == deleteData.ID {
			// 从切片中删除
			users = append(users[:i], users[i+1:]...)
			sendSuccess(w, nil, "用户删除成功")
			return
		}
	}

	sendError(w, http.StatusNotFound, "用户不存在")
}

func sendSuccess(w http.ResponseWriter, data interface{}, message string) {
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func sendError(w http.ResponseWriter, code int, message string) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Error:   message,
	})
}
