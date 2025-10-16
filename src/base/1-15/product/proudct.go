package product

import (
	"1-15/common"
	"fmt"
	"log"
	"time"
)

type Product struct {
	ID    int64
	Name  string
	Price float64
	Stock int
}

func (p *Product) DisplayInfo() {
	fmt.Printf("商品ID: %d, 名称: %s, 价格: %.2f, 库存: %d\n", p.ID, p.Name, p.Price, p.Stock)
}

type ProductService struct {
	products []*Product
	logger   *log.Logger
}

var TestMessage string

func init() {
	TestMessage = "hello world"
}
func NewProductService() *ProductService {
	return &ProductService{
		products: []*Product{},
		logger:   common.NewLogger("product"),
	}
}

func (s *ProductService) AddProduct(name string, price float64, stock int) int64 {
	product := &Product{
		ID:    time.Now().Unix(),
		Name:  name,
		Price: price,
		Stock: stock,
	}
	s.products = append(s.products, product)
	s.logger.Printf("商品添加成功: %s 价格：%.2f, 库存： %d", product.Name, product.Price, product.Stock)
	return product.ID
}

func (s *ProductService) FindProductByID(id int64) *Product {
	for _, product := range s.products {
		if product.ID == id {
			return product
		}
	}
	return nil
}

func (s *ProductService) ListAllProducts() {
	for _, product := range s.products {
		s.logger.Printf("商品ID: %d, 名称: %s, 价格: %.2f, 库存: %d", product.ID, product.Name, product.Price, product.Stock)
	}
}
