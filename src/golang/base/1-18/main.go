package main

import (
	"fmt"
	"time"
)

const (
	DateTime = "2006-01-02 15:04"
)

func main() {
	// 当前时间
	nowTime := time.Now()
	fmt.Println(nowTime)

	// 加几分钟
	addMinutes := nowTime.Add(time.Minute * 5)
	fmt.Println(addMinutes)

	// 减去5天
	subtractDays := nowTime.AddDate(0, 0, -5)
	fmt.Println(subtractDays)

	// 获取两个日期的差的天数
	days := subtractDays.Sub(addMinutes).Hours() / 24
	fmt.Println(days)

	// 哪个时间更大
	fmt.Println(nowTime.After(addMinutes))
	fmt.Println(nowTime.Before(addMinutes))

	fmt.Println(nowTime.Format(time.DateTime)) // YYYY-MM-DD HH:mm:ss

	loc, _ := time.LoadLocation("America/New_York")
	nyTime := time.Now().In(loc)
	fmt.Println(nyTime.Format(time.DateTime))

	dtime := "2025-10-18 14:23:12"
	ddtime, _ := time.Parse(time.DateTime, dtime)
	fmt.Println(ddtime.Format(time.DateTime))

	// 时间周期
	start := time.Date(2025, 1, 1, 0, 0, 0, 0, time.Local)
	end := time.Date(2026, 1, 1, 0, 0, 0, 0, time.Local)
	days = end.Sub(start).Hours() / 24
	fmt.Println(days)
}
