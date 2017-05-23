# P2P-Dispatch-Framework（信令服务器）
P2P分发框架－信令服务器，用于控制连接，提供peer端寻找、控制信号转发等功能

端口占用：

        8080:   查看资源情况
        10000:  提供websocket服务


## 一、信令服务器接口
* 3001 操作索引
    * 参数

            {
                code:   3001,
                data:[
                    {
                        url:    "//www.example.com/example",    //资源：url绝对路径（如果客户端没有指定传输协议，则采用通用协议）
                        md5:    "34dfsf3afeefefefe"             //资源：md5校验代码
                    },
                    ...
                ]
            }

    * 返回结果
        * 1001 通知客户端MD5错误，需要丢弃的资源

                {
                    code:   1001,
                    data:[
                        "//www.example.com/example",            //资源：url绝对路径（如果客户端没有指定传输协议，则采用通用协议）
                        ...
                    ]
                }

* 3002 寻找有这些资源的客户端
    * 参数

            {
                code:   3002,
                data:[
                    "//www.example.com/example",                //资源：url绝对路径（如果客户端没有指定传输协议，则采用通用协议）
                    "http://www.example.com/example",
                    "https://www.example.com/example",
                    ...
                ]
            }

    * 返回结果
        * 1002 通知客户端每个的资源的第三方提供者 & 无第三方提供者的资源

                {
                    code:       1002,
                    data:{
                         //建议的资源提供者，相同资源按照顺序提供
                        reqs:               [{url, clients: [address, ...], }, ...],
                        //没有提供者的资源
                        notFindResources:   [url, ...]
                    }
                }

* 3201 转发数据索取请求
    * 参数

            {
                code:   3201,
                data:   {
                    offer:  {
                        //IP地址
                        address:    string
                    }
                }
            }

    * 返回结果（增加响应者的IP地址）

            {
                code:   1201,
                data:   {
                    offer:  {
                        //IP地址
                        address:    string
                    },
                    answer: {
                        //IP地址（新增）
                        address:    string
                    }
                }
            }

* 3202 转发拒绝服务
    * 参数

            {
                code:   3202,
                data:   {
                    offer:  {
                        //IP地址
                        address:    string
                        //可用
                        isAvailable: false
                    },
                    answer: {
                        //IP地址（新增）
                        address:    string
                    }
                }
            }

    * 返回结果

            {
                code:   1202,
                //转发客户端data字段
                data:   object
            }

* 3003 转发描述（提供者）
    * 参数

            {
                code:   3003,
                data:   {
                    offer:  {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string
                    },
                    answer: {
                        //IP地址
                        address:    string,
                    }
                }
            }

    * 返回结果

            {
                code:   1003,
                //转发客户端data字段
                data:   object
            }

* 3004 转发描述（响应者）
    * 参数

            {
                code:   3004,
                data:   {
                    offer:  {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string
                    },
                    answer: {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string
                    }
                }
            }

    * 返回结果

            {
                code:   1004,
                //转发客户端data字段
                data:   object
            }

* 3005 转发候选信息
    * 特殊说明

            会出现2中情况：提供者－发送候选信息 & 响应者－发送候选信息；返回结果只是单纯转发，不做处理

    * 参数一（提供者）

            {
                code:   3005,
                data:   {
                    offer:  {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string,
                        //候选信息
                        candidate:  object,
                    },
                    answer: {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string
                    }
                }
            }

    * 参数二（响应者）

            {
                code:   3005,
                data:   {
                    offer:  {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string
                    },
                    answer: {
                        //资源描述
                        desc:       object,
                        //IP地址
                        address:    string,
                        //候选信息
                        candidate:  object,
                    }
                }
            }

    * 返回结果

            {
                code:   1005,
                //转发客户端data字段
                data:   object
            }

## 二、客户端处理报文

        1001 丢弃资源
        1002 收到可用的客户端
        1003 收到请求描述信息
        1004 收到响应描述
        1005 收到候选信息
        1201 接收到发送数据请求，准备发送数据