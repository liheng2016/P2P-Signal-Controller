console.log("WebSocket管理模块初始化");

/*** 引用模块 ***/
var WebSocketServer = require("ws").Server;
var path = require("path");
var fs = require("fs");
var crypto = require('crypto');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
/*** 自定义模块 ***/
var utils = require("../Utils");
var Client = require("./Type/Client");
var Resource = require("./Type/Resource");
var Response = require("./Type/Response");

//保存的数据
var global = {
    resources:  [],                                 //资源
    clients:    []                                  //保存的客户端
};
//导出对象
module.exports = {
    /*** 对外提供接口 ***/
    /**
     * 添加客户端
     * @ws
     */
    addClient: function(ws){
        var i;
        var client;
        if(global.clients.length <= 0){
            client = new Client(ws);
            global.clients.push(client);
        }else{
            for(i = 0; i < global.clients.length; i++) {
                if(global.clients[i].match(ws)){
                    break;
                }else if(i == global.clients.length - 1){
                    client = new Client(ws);
                    global.clients.push(client);
                }
            }
        }
        console.log("当前客户端情况");
        console.log(global.clients.length);
    },
    /**
     * 删除客户端
     * @ws
     */
    deleteClient:  function(ws){
        console.log("删除前客户端数量");
        console.log(global.clients.length);

        var i;
        //删除客户端记录
        for(i = 0; i < global.clients.length; i++) {
            if(global.clients[i].match(ws)){
                global.clients.splice(i, 1);
                break;
            }
        }
        //删除资源中的记录
        for(i = 0; i < global.resources.length; i++){
            global.resources[i].deleteClient(ws);
        }
    },

    /**
     * 收集资源
     * @ws              websocket连接对象
     * @datas           客户端返回的数据[{url, md5}, ..]
     */
    gatherResources:    function(ws, datas){
        var client = new Client(ws);
        var abandonResource = [];                   //抛弃的资源，因为md5不一致(形如 [url, ..])

        /*** 遍历获取的数据，进行检查 ***/
        async(function() {
            var i, j;
            var data;
            var resource;

            //循环检测数据
            for(i = 0; i < datas.length; i++){
                data = datas[i];
                //如果不是绝对路径，说明有人进行攻击，直接结束
                if(!utils.url.isAbsolute(data.url)){
                    return;
                }

                //数据正常，看看当前服务器保存情况，再处理
                if (global.resources.length <= 0) {
                    //没有任何资源
                    //直接添加
                    try{
                        resource = await(Resource(data.url));

                        resource.addClient(client, data.md5);
                        global.resources.push(resource);
                    }catch(e){
                        //资源获取失败
                        abandonResource.push(data.url);
                    }
                }else{
                    //有资源
                    var existIndex = -1;
                    for(j = 0; j < global.resources.length; j++){
                        if(global.resources[j].match(data.url)){
                            //资源存在
                            existIndex = j;
                            break;
                        }
                    }
                    //根据检查结果操作
                    if(existIndex > -1){
                        //存在
                        global.resources[existIndex].addClient(client, data.md5);
                    }else{
                        //不存在
                        try{
                            resource = await(Resource(data.url, global.resources));
                            resource.addClient(client, data.md5);
                            global.resources.push(resource);
                        }catch(e){
                            //资源获取失败
                            abandonResource.push(data.url);
                        }
                    }
                }
            }
        })().then(function(){
            //资源添加结束，通知客户端需要丢弃的资源
            var response = Response(1001, abandonResource);
            ws.send(JSON.stringify(response));
        }).catch(function(e){
            //出错说明代码写错了
            console.log(e);
        });
    },

    /**
     * 寻找可以获取数据的客户端集合
     * @ws                      websocket连接
     * @urls                    资源数组[url, ..]
     */
    findClients2AcquireData:    function(ws, urls){
        console.log("*** 寻找可以获取数据的客户端集合 ***");
        console.log("接收参数");
        console.log(urls);
        console.log("当前资源情况");
        console.log(global.resources);

        var i, j, k;
        var notFindResources = [];
        var reqs = [];

        //如果请求的资源，则构造结果
        if(urls && urls.length > 0){
            //遍历资源列表，寻找资源
            if(global.resources.length <= 0){
                notFindResources = urls;
            }else{
                //遍历资源寻找客户端
                for(i = 0; i < urls.length; i++){
                    for(j = 0; j < global.resources.length; j++){
                        if(global.resources[j].match(urls[i])){
                            //资源匹配，添加客户端
                            var clients = [];
                            for(k = 0; k < global.resources[j].getAllClients().length; k++){
                                clients.push(global.resources[j].getClient(k).getAddress());
                            }
                            reqs.push({
                                url:            urls[i],
                                clients:        clients
                            });

                            break;
                        }else if(j == global.resources.length - 1){
                            //这个资源根本没有p2p资源服务器可以提供服务
                            notFindResources.push(urls[i]);
                        }
                    }
                }
            }
        }

        //发送结果
        var response = new Response(1002, {reqs: reqs, notFindResources: notFindResources});
        ws.send(JSON.stringify(response));

        console.log("发送结果");
        console.log(response);
    },
  
    /**
     * 转发请求desc
     * @ws                      websocket连接对象
     * @data                    客户端传递的data信息
     */
    transferOfferDesc:   function(ws, data){
      //寻找发送方
      var sendclient = this.getClient(ws);
      //如果找不到发送方，说明发送方已经关闭，则直接结束
      if(!sendclient){
        console.warn("转发请求desc：发送者已经关闭了连接");
        return;
      }
      
      //寻找接收者
      var receiveclient = this.getClient(data.answer.address);
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发请求desc：接收者已经关闭了连接");
        return;
      }
      
      //给接收发送数据
      receiveclient.send({ code: 1003, data: data });
    },
    /**
     * 转发响应Desc
     * @ws                 websocket连接对象
     * @data               客户端发送的数据
     */
    transferAnswerDesc: function(ws, data){
      //寻找发送方
      var sendclient = this.getClient(ws);
      //如果找不到发送方，说明发送方已经关闭，则直接结束
      if(!sendclient){
        console.warn("转发响应desc：发送者已经关闭了连接");
        return;
      }
      //寻找接收者
      var receiveclient = this.getClient(data.offer.address);
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发响应desc：接收者已经关闭了连接");
        return;
      }
      
      //转发信息
      receiveclient.send({ code: 1004, data: data });
    },
    /**
     * 转发候选信息
     * @ws                目标
     * @data              客户端发送数据
     */
    transferIceCandidate: function(ws, data){
      //寻找发送方
      var sendclient = this.getClient(ws);
      //如果找不到发送方，说明发送方已经关闭，则直接结束
      if(!sendclient){
        console.warn("转发候选信息：发送者已经关闭了连接");
        return;
      }
      //寻找接收者
      var receiveclient = data.offer.candidate ? this.getClient(data.answer.address) : this.getClient(data.offer.address);;
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发候选信息：接收者已经关闭了连接");
        return;
      }
      
      //转发
      receiveclient.send({ code: 1005, data: data });
    },
    /**
     * 转发数据索取请求
     * @ws                      websocket连接对象
     * @data                    客户端传递的数据对象
     */
    transferDataQuery:  function(ws, data){
      //寻找发送方
      var sendclient = this.getClient(ws);
      //如果找不到发送方，说明发送方已经关闭，则直接结束
      if(!sendclient){
        console.warn("转发数据索取请求：发送者已经关闭了连接");
        return;
      }
      //增加响应者的IP
      data.answer.address = sendclient.getAddress();
      
      //寻找接收者
      var receiveclient = this.getClient(data.offer.address);
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发数据索取请求：接收者已经关闭了连接");
        return;
      }
      
      //转发
      receiveclient.send({ code: 1201, data: data });
    },
    /**
     * 转发拒绝服务
     * @ws
     * @data
     */
    transferRefuseProvide:  function(ws, data){
      //寻找接收者
      var receiveclient = this.getClient(data.answer.address);
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发拒绝服务：接收者已经关闭了连接");
        return;
      }
      
      //转发
      receiveclient.send({ code: 1202, data: data });
    },
    /**
     * 转发终止请求
     * @ws              websocket对象
     * @data            客户端传来的数据
     */
    transferRefuseRequest:  function(ws, data){
      //寻找接收者
      var receiveclient = this.getClient(data.offer.address);
      //如果找不到接收者，则说明接受着已经关闭，则直接结束
      if(!receiveclient){
        console.warn("转发终止请求：接收者已经关闭了连接");
        return;
      }
  
      //转发
      receiveclient.send({ code: 1202, data: data });
    },

    /**
     * 增加资源
     * @ws              websocket对象
     * @data            客户端传输数据 {url, md5}
     */
    appendResource: function(ws, data){
        //获取客户端
        var client = this.getClient(ws);
        //客户端扩展资源
        client.addURL(data.url);
        //资源扩展客户端
        var resource = this.getResource(data.url);
        (async(function(){
            //如果没有找到资源，则新建一个资源
            if(!resource){
                try{
                    resource = await(Resource(data.url));
                    resource.addClient(client, data.md5);
                    global.resources.push(resource);
                }catch(e){
                    //资源获取失败，不管了
                    console.log("增加资源:资源获取失败");
                }
            }
            //此时应该有资源了
            resource.addClient(client, data.md5);
        }))();
    },
  
    /*** 提供给内部接口的 ***/
    /**
     * 获取所有客户端
     */
    getAllClients:  function(){
        var clients = [];
        if(global.clients.length > 0){
            clients = global.clients.map(function (client) {
                return client.clone();
            });
        }
        console.log(clients);
        return clients;
    },
    /**
     * 获取所有资源列表
     */
    getAllResource: function(){
      return global.resources;
    },
    /**
     * 获取客户端
     * @mark            客户端资源标识，可以是websocket对象，
     */
    getClient:  function(mark) {
      var i;
      for(i = 0; i < global.clients.length; i++) {
        if(global.clients[i].match(mark)){
          return global.clients[i];
        }
      }
    },
    /**
     * 获取资源
     * @url             资源url
     */
    getResource:   function(ws, url, md5){
        var i;
        var resource = null;
        for(i = 0; i < global.resources; i++){
            if(global.resources[i].match(url)){
                resource = global.resources[i];
                break;
            }
        }

        return resource;
    }
};