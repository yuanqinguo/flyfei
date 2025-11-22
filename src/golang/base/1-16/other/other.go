package other

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"fmt"
	"html/template"
	"io"
	"os"
	"strings"
	"time"
)

func DemoTemplate() {
	const templateText = `
	用户信息:
=========
姓名: {{.Name}}
年龄: {{.Age}}
邮箱: {{.Email}}
{{if .Active}}状态: 活跃{{else}}状态: 非活跃{{end}}
注册时间: {{.RegisteredAt.Format "2006-01-02"}}
{{range .Hobbies}}爱好: {{.}}
{{end}}
`

	type User struct {
		Name         string
		Age          int
		Email        string
		Active       bool
		RegisteredAt time.Time
		Hobbies      []string
	}

	user := User{
		Name:         "张三",
		Age:          18,
		Email:        "11111@qq.com",
		Active:       true,
		RegisteredAt: time.Now(),
		Hobbies:      []string{"football", "swimming"},
	}

	tmpl, err := template.New("user").Parse(templateText)
	if err != nil {
		panic(err)
	}
	fmt.Println("模板渲染结果：")
	err = tmpl.Execute(os.Stdout, user)
	if err != nil {
		panic(err)
	}
}

func DemoCompression() {
	originData := "这是一段需要压缩的文本数据，" +
		"重复内容" + strings.Repeat("重复", 10) +
		"结束。"

	var compressed bytes.Buffer
	gzWriter := gzip.NewWriter(&compressed)
	_, err := gzWriter.Write([]byte(originData))
	if err != nil {
		panic(err)
	}
	gzWriter.Close()
	fmt.Printf("原始大小: %d bytes\n", len(originData))
	fmt.Printf("压缩后大小: %d bytes\n", compressed.Len())
	fmt.Printf("压缩率: %.1f%%\n",
		float64(compressed.Len())/float64(len(originData))*100)

	gzReader, err := gzip.NewReader(&compressed)
	if err != nil {
		panic(err)
	}
	defer gzReader.Close()
	decompressed, err := io.ReadAll(gzReader)
	if err != nil {
		panic(err)
	}
	fmt.Println("解压结果：", string(decompressed))
}

func DemoBuffIO() {
	file, err := os.Create("test_buffer.txt")
	if err != nil {
		panic(err)
	}

	writer := bufio.NewWriter(file)
	for i := 0; i < 10; i++ {
		writer.WriteString(fmt.Sprintf("这是第%d行数据\n", i+1))
	}
	writer.Flush() // 刷新缓冲区
	fmt.Println("写入完成")
	file.Close()

	file2, err := os.Open("test_buffer.txt")
	if err != nil {
		panic(err)
	}

	defer file2.Close()
	reader := bufio.NewReader(file2)

	for {
		line, err := reader.ReadString('\n')
		if err == io.EOF {
			break
		}
		if err != nil {
			panic(err)
		}
		fmt.Println(line)
	}
}
