var router = require('express').Router();
var wsManager = require("../bin/www").WSCtrl.manager;
var rh = require("../Libs/ResponseHandler");

//列出所有客户端
router.all("/list", function(req, res, next){
    var clients = wsManager.getAllClients();

    //返回结果
    rh(res, 200, null, "返回客户端列表", null, clients);
});

module.exports = router;