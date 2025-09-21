# 目录说明

## adaptor
1. 外部依赖适配器，必须基于interface进行定义，对外提供接口，禁止单独进行NewXXX操作逃逸到外部目录
2. 对外部的所有数据依赖均在该文件下，进行区分，如数据库操作，缓存操作，远程调用（HTTP， GRPC）等


## config
1. 定义配置的地方，所有配置均在该目录下定义，可选择进行分文件处理，consul文件主要解决配置中心的问题，可不使用，最终使用etcd进行更新

## api
1. 该目录定义对外提供http接口的controller

## service
1. 该目录重点实现业务逻辑，仅可以依赖adaptor层的内容和配置内容，不可依赖其他层级对象
2. common, consts用于共用无业务逻辑的处理函数和常量定义，错误码定义，不可加入任何与业务判断相关代码
3. do用户在service层中dto到adaptor层中的model层中转，可选择性处理，但有以下硬性规定
   1. model层不可在service任何文件中出现NewXXmodel的操作，也不可以定义，仅限于接收返回值时，返回了一个model
   2. service层的所有返回不可直接对外返回model，只能返回dto对象或者GPRC的Resp对象
   3. 尽量保持以下层级方向
      4. dto -> do -> model 的输入数据流程
      5. model -> do -> dto 的输出数据流程

# 特殊说明
## 该服务依赖gotenberg开源镜像，依赖nodejs=next.js生成完整的html页面
## Dockerfile_base文件定义了gotenberg的镜像，同时安装了node的编译运行环境
## Dockerfile文件定义了go的编译环境，引用了Dockerfile_base的产物
## 该服务的API对外提供给各后端服务调用，同时提供了查询接口给内部集成的next.js调用