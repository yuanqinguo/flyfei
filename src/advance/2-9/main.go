package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"strconv"
)

type Student struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Age   int    `json:"age"`
	Grade int    `json:"grade"`
}

var students = []Student{
	{ID: 1, Name: "张三", Age: 18, Grade: 1},
	{ID: 2, Name: "李四", Age: 19, Grade: 2},
	{ID: 3, Name: "王五", Age: 20, Grade: 3},
}

func getStudent(c *gin.Context) {
	idStr := c.Query("id")
	stdID, _ := strconv.Atoi(idStr)

	for _, std := range students {
		if std.ID == stdID {
			c.JSON(200, gin.H{
				"code": 200,
				"msg":  "查询成功",
				"data": std,
			})
			return
		}
	}
	c.JSON(200, gin.H{
		"code": 404,
		"msg":  "未找到该学生",
	})
}

func addStudent(c *gin.Context) {
	var newStudent Student
	if err := c.BindJSON(&newStudent); err != nil {
		c.JSON(400, gin.H{
			"code": 400,
			"msg":  "参数错误",
		})
		return
	}
	students = append(students, newStudent)
	c.JSON(200, gin.H{
		"code": 200,
		"msg":  "添加成功",
	})
}

func updateStudent(c *gin.Context) {
	// 更新学生
	var newStudent Student
	if err := c.BindJSON(&newStudent); err != nil {
		c.JSON(400, gin.H{
			"code": 400,
			"msg":  "参数错误",
		})
		return
	}
	for i, std := range students {
		if std.ID == newStudent.ID {
			students[i] = newStudent
			c.JSON(200, gin.H{
				"code": 200,
				"msg":  "更新成功",
			})
			return
		}
	}
	c.JSON(200, gin.H{
		"code": 404,
		"msg":  "未找到该学生",
	})
}

func ginRouterDemo() {
	router := gin.Default()

	apiV1 := router.Group("/api/v1") // http://localhost/api/v1

	stdGroup := apiV1.Group("/students")   // http://localhost/api/v1/students
	stdGroup.GET("/info", getStudent)      // /api/v1/students/info?id=1
	stdGroup.POST("/add", addStudent)      // /api/v1/students/add
	stdGroup.PUT("/update", updateStudent) // /api/v1/students/update

	fmt.Println("Gin 路由服务器启动运行：8080")
	router.Run(":8080")

}

func main() {
	ginRouterDemo()
}
