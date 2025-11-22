package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

type UserSession struct {
	UserID       string
	LoginTime    time.Time
	LastActivity time.Time
	IPAddress    string
}

type SessionManager struct {
	sessions map[string]*UserSession
	mutex    sync.RWMutex // 解决并发安全问题
}

func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]*UserSession),
	}
}

func (sm *SessionManager) AddSession(token string, userID, ipAddress string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session := &UserSession{
		UserID:       userID,
		LoginTime:    time.Now(),
		LastActivity: time.Now(),
		IPAddress:    ipAddress,
	}
	sm.sessions[token] = session
}

func (sm *SessionManager) GetSession(token string) (*UserSession, bool) {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()
	session, ok := sm.sessions[token]
	if ok {
		session.LastActivity = time.Now() // 更新最后活跃时间
	}
	return session, ok
}

func (sm *SessionManager) RemoveSession(token string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()
	delete(sm.sessions, token)
}

func (sm *SessionManager) CleanupExpiredSessions(timeout time.Duration) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	now := time.Now()
	for token, session := range sm.sessions {
		if now.Sub(session.LastActivity) > timeout {
			delete(sm.sessions, token)
		}
	}
}

func main() {
	sessionManager := NewSessionManager()
	sessionManager.AddSession("token1", "user1", "192.168.1.100")

	if session, ok := sessionManager.GetSession("token1"); ok {
		fmt.Printf("找到用户会话： %s, 登录时间： %v\n", session.UserID, session.LoginTime.Format(time.DateTime))
	}

	// 定时清理会话
	sessionManager.CleanupExpiredSessions(time.Hour)

	// 移除会话， 一个人登录以后，发现他发布了一些反党的内容，那我们就要禁用这个用户
	sessionManager.RemoveSession("token1")

	// 嵌套map
	userPreferences := map[string]map[string]string{
		"user1": {
			"language": "English",
			"theme":    "Dark",
		},
		"user2": {
			"language": "Chinese",
			"theme":    "Light",
		},
	}
	fmt.Println(userPreferences)

	// 作为集合使用
	uniqueIDs := make(map[int]bool)
	ids := []int{1, 2, 2, 3, 4, 5}
	for _, id := range ids {
		uniqueIDs[id] = true
	}
	fmt.Printf("唯一的ID数量： %d\n", len(uniqueIDs))

	// 键值反转
	originMap := map[string]int{
		"one":   1,
		"two":   2,
		"three": 3,
	}
	reversedMap := make(map[int]string)
	for key, value := range originMap {
		reversedMap[value] = key
	}
	fmt.Println(reversedMap)

	// map是 无序 的键值对
	ageMap := map[string]int{
		"Alice":   25,
		"Bob":     30,
		"Charlie": 28,
	}

	keys := make([]string, 0, len(ageMap))
	for key := range ageMap {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		fmt.Printf("Name: %s, Age: %d\n", key, ageMap[key])
	}

	// sync.Map
	var syncMap sync.Map
	syncMap.Store("key1", "value1")
	syncMap.Store("key2", "value2")

	fmt.Println(syncMap.Load("key1"))

	syncMap.Delete("key1")

	syncMap.Range(func(key, value interface{}) bool {
		fmt.Printf("Key: %s, Value: %s\n", key, value)
		return true
	})
}
