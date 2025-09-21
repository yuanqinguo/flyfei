# 目录说明

## adaptor
1. 外部依赖适配器，必须基于interface进行定义，对外提供接口，禁止单独进行NewXXX操作逃逸到外部目录
2. 对外部的所有数据依赖均在该文件下，进行区分，如数据库操作，缓存操作，远程调用（HTTP， GRPC）等

## api
1. api目录用于定义http接口的controller层，所有http接口的controller对象均需在route层进行实例化
2. 该层无需进行interface接口化，路由path本身已具有代表封装属性和唯一性，直接在route中引用即可

## config
1. 定义配置的地方，所有配置均在该目录下定义，可选择进行分文件处理，consul文件主要解决配置中心的问题，可不使用，最终使用etcd进行更新

## route
1. route目录定义http接口的路由和路由中间件的注入，对应各类中间件需要过滤的接口配置等
2. controller文件聚合api目录下的所有controller，方便route中注入代码更简洁

## service
1. 该目录重点实现业务逻辑，仅可以依赖adaptor层的内容和配置内容，不可依赖其他层级对象
2. common, consts用于共用无业务逻辑的处理函数和常量定义，错误码定义，不可加入任何与业务判断相关代码
3. do用户在service层中dto到adaptor层中的model层中转，可选择性处理，但有以下硬性规定
   1. model层不可在service任何文件中出现NewXXmodel的操作，也不可以定义，仅限于接收返回值时，返回了一个model
   2. service层的所有返回不可直接对外返回model，只能返回dto对象或者GPRC的Resp对象
   3. 尽量保持以下层级方向
      4. dto -> do -> model 的输入数据流程
      5. model -> do -> dto 的输出数据流程

# Makefile
## 命令支持
#### 只支持linux下执行，windows可使用wsl安装ubuntu，并安装golang环境，goland默认即支持wsl的ubuntu终端
1. Makefile中会进行数据库表到model，query的生成： make gendb
2. 需进入query中文件进行import model处理

## 环境依赖
1. 安装gentool工具，执行：`go install gorm.io/gen/tools/gentool@latest`
   ，请参考：https://gorm.io/zh_CN/gen/gen_tool.html
5. 注意点： ubuntu下的go env,对应 GOBIN 如果为空，将安装到 GOPATH指定的目录下，此时命令中的PATH无法加载到