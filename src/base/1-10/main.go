package main

import (
	"fmt"
	"sort"
	"time"
)

type Product struct {
	ID        int
	Name      string
	Price     float64
	Rating    float64
	Sales     int
	CreatedAt time.Time
}

type ProductManager struct {
	products []Product
}

func NewProductManager() *ProductManager {
	return &ProductManager{
		products: []Product{
			{ID: 1, Name: "无线耳机", Price: 299.99, Rating: 4.5, Sales: 1200, CreatedAt: time.Now().Add(-24 * time.Hour)},
			{ID: 2, Name: "智能手机", Price: 3999.99, Rating: 4.8, Sales: 850, CreatedAt: time.Now().Add(-48 * time.Hour)},
			{ID: 3, Name: "蓝牙音箱", Price: 199.50, Rating: 4.2, Sales: 2300, CreatedAt: time.Now().Add(-12 * time.Hour)},
			{ID: 4, Name: "智能手表", Price: 899.00, Rating: 4.6, Sales: 1500, CreatedAt: time.Now().Add(-72 * time.Hour)},
		},
	}
}

func (pm *ProductManager) SortByPrice(ascending bool) {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Price < pm.products[j].Price
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Price > pm.products[j].Price
		})
	}
}

func (pm *ProductManager) SortByRating(ascending bool) {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Rating < pm.products[j].Rating
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Rating > pm.products[j].Rating
		})
	}
}
func (pm *ProductManager) SortBySales(ascending bool) {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Sales < pm.products[j].Sales
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Sales > pm.products[j].Sales
		})
	}
}

func (pm *ProductManager) SortByMultiple() {
	sort.Slice(pm.products, func(i, j int) bool {
		if pm.products[i].Price != pm.products[j].Price {
			return pm.products[i].Price < pm.products[j].Price
		}
		if pm.products[i].Rating != pm.products[j].Rating {
			return pm.products[i].Rating > pm.products[j].Rating
		}
		return pm.products[i].Sales < pm.products[j].Sales
	})
}

func (pm *ProductManager) PrintProducts() {
	for _, product := range pm.products {
		fmt.Printf("ID: %d, Name: %s, Price: %.2f, Rating: %.1f, Sales: %d\n",
			product.ID, product.Name, product.Price, product.Rating, product.Sales)
	}
}

/*
type Interface interface {
    Len() int
    Less(i, j int) bool
    Swap(i, j int)
}
*/

type Person struct {
	Name string
	Age  int
}

type People []Person

func (p People) Len() int {
	return len(p)
}
func (p People) Less(i, j int) bool {
	return p[i].Age > p[j].Age
}
func (p People) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}
func main() {
	pm := NewProductManager()

	fmt.Println("=====按价格排序=====")
	pm.SortByPrice(false)
	pm.PrintProducts()

	fmt.Println("=====按评分排序=====")
	pm.SortByRating(false)
	pm.PrintProducts()

	fmt.Println("=====按销量排序=====")
	pm.SortBySales(true)
	pm.PrintProducts()

	fmt.Println("=====按多个字段排序=====")
	pm.SortByMultiple()
	pm.PrintProducts()

	fmt.Println("=====interface的方式=====")
	people := People{
		{"Alice", 25},
		{"Bob", 30},
		{"Charlie", 28},
		{"David", 35},
	}

	sort.Sort(people)
	for _, person := range people {
		fmt.Printf("Name: %s, Age: %d\n", person.Name, person.Age)
	}

	names := []string{"Alice", "Bob", "Charlie", "David"}
	sort.Strings(names)
	index := sort.SearchStrings(names, "Bob")
	fmt.Println("Bob的索引为：", index)
}
