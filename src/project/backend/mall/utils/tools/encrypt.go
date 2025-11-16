package tools

import (
	"crypto/sha256"
	"encoding/hex"
)

func Sha256Hash(text string) string {
	// 创建一个新的sha256哈希对象
	hash := sha256.New()

	// 将字符串写入哈希对象
	hash.Write([]byte(text))

	// 从哈希对象中获取哈希值
	hashBytes := hash.Sum(nil)

	// 将字节切片转换为十六进制字符串
	return hex.EncodeToString(hashBytes)
}
