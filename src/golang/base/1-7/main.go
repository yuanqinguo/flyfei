package main

import (
	"errors"
	"fmt"
	"os"
	"time"
)

func main() {
	userName, err := queryDatabase(-1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(userName)
	}
	userName, err = queryDatabase(100)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(userName)

	err = readFile("D:\\gocourse\\code\\flyfei\\src\\base\\1-7\\test.txt")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			// 创建文件？
		}
		fmt.Println(err)
	}

	result, err := safeAccess([]int{1, 2, 3}, 99)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(result)

	deferResult := deferReturn()
	fmt.Println("defer result ", deferResult)
}

type BusinessError struct {
	Code    int
	Message string
	Time    time.Time
}

const (
	TimeFmt = "2006-01-02 15:04:05"
)

func (e *BusinessError) Error() string {
	return fmt.Sprintf("错误代码：%d, 消息：%s,时间：%s", e.Code, e.Message, e.Time.Format(TimeFmt))
}

func queryDatabase(userID int) (string, error) {
	if userID <= 0 {
		return "", &BusinessError{
			Code:    1001,
			Message: "用户不存在",
			Time:    time.Now(),
		}
	}
	// 模拟数据库查询
	if userID == 999 {
		return "", errors.New("数据库连接超时")
	}
	return "用户数据", nil
}

func readFile(fileName string) error {
	file, err := os.Open(fileName)
	if err != nil {
		return fmt.Errorf("打开文件失败：%w", err)
	}
	defer file.Close()
	buf := make([]byte, 100)
	_, err = file.Read(buf)
	if err != nil {
		return fmt.Errorf("读取文件失败：%w", err)
	}
	return nil
}

func safeAccess(arr []int, index int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("发生panic: %v", r)
		}
	}()
	return arr[index], nil
}

func deferReturn() (result int) {
	defer func() {
		result++
	}()
	return 10
}
