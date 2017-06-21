var router = require('express').Router();
var wsManager = require("../bin/www").WSCtrl.manager;
var rh = require("../Libs/ResponseHandler");

//列出所有资源
router.all("/list", function(req, res, next){
    var resources = wsManager.getAllResource();
    //清除每个资源下面的obj属性
    resources.forEach(function(resource){
        resource.clients.forEach(function(client){
            client.obj = null;
        });
    });
    //返回结果
    rh(res, 200, null, "返回资源列表", null, resources);
});

module.exports = router;