/*** 模块引用 ***/
var http = require("http");
var Promise = require("es6-promise").Promise;


var client = {
    /**
     * 获取资源
     * @url
     */
    get:    function(url){
        return new Promise(function(resolve, reject){
            if(!url){
                reject();
            }else{
                http.get(url, function(res){
                    //获取到数据，则返回
                    res.on("data", function(res){
                        resolve(res);
                    });
                }).on('error', function(e){
                    reject(e);
                });
            }
        });
    },
    /**
     * post 获取
     * @host            链接
     * @port            端口
     * @path
     * @data            json化数据
     */
    post: function (url, data) {
        return new Promise(function (resolve, reject) {
            if(!url || !data){
                reject();
            }else{
                //var req = http.request();
            }
        });
    }
};
module.exports = client;