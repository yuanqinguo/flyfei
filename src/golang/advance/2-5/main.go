package main

import (
	"fmt"
	"net"
	"sync"
)

type ChatRoom struct {
	clients map[net.Conn]string
	mutex   sync.RWMutex
}

func NewChatRoom() *ChatRoom {
	return &ChatRoom{
		clients: make(map[net.Conn]string),
	}
}

func (c *ChatRoom) broadcast(sender net.Conn, message string) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	for client, name := range c.clients {
		if sender == client {
			continue
		}
		client.Write([]byte(name + ": " + message))
	}
}

func (c *ChatRoom) handleConnection(conn net.Conn) {
	defer conn.Close()

	conn.Write([]byte("请输入你的昵称："))
	name := make([]byte, 1024)
	n, _ := conn.Read(name)
	userName := string(name[:n-1])

	c.mutex.Lock()
	c.clients[conn] = userName
	c.mutex.Unlock()

	c.broadcast(conn, fmt.Sprintf("系统：%s 加入聊天室\n", userName))

	for {
		readBuffer := make([]byte, 1024)
		n, err := conn.Read(readBuffer)
		if err != nil {
			break
		}
		message := string(readBuffer[:n])
		if message == "quit\n" {
			break
		}
		c.broadcast(conn, fmt.Sprintf("username: %s\n", userName, message))
	}
	c.mutex.Lock()
	delete(c.clients, conn)
	c.mutex.Unlock()
	c.broadcast(conn, fmt.Sprintf("系统：%s 离开聊天室\n", userName))
}

func main() {
	chatRoom := NewChatRoom()
	listener, err := net.Listen("tcp", ":8888")
	if err != nil {
		fmt.Println("启动Listen失败", err)
		return
	}
	defer listener.Close()
	fmt.Println("启动监听成功，监听端口：8888")
	for {
		conn, _ := listener.Accept()
		go chatRoom.handleConnection(conn)
	}
}
