/**
 * IP组件
 */
/*** 模块引用 ***/
var httpclient = require("./Http/client");
/*** 参数 ***/
var opts = {
    ipQuery:            'http://ip.taobao.com/service/getIpInfo.php?ip='
};

var IPManager = {
    /**
     * 去除端口号
     * @address             地址
     */
    removePort: function (address) {
        //如果不是字符串，返回空串
        if (typeof address !== 'string') {
            return "";
        }
        //执行到此说明传入正常
        var commaIndex = address.indexOf(':');
        if(commaIndex === -1){
            return address;
        }else{
            return address.substring(0, commaIndex);
        }
    },
    /**
     * ipV6 转 ipV4
     * @address             地址
     */
    toIPV4:  function (address) {
        //如果传入参数格式错误，则直接返回空串
        if(typeof address !== 'string'){
            return "";
        }
        //执行到此说明传入正常
        return address.replace(/::ffff:/, '');
    },

    /**
     * 查询
     * @address
     */
    query: function (address) {
        //规范化参数
        address = this.removePort(address);
        address = this.toIPV4(address);

        //执行查询
        return new Promise(function (resolve, reject) {
            httpclient.get(opts.ipQuery + address).then(function (res) {
                try{
                    res = JSON.parse(res);
                    if(res && res.code && res.code === 0 && res.data){

                    }else{
                        reject(res);
                    }
                }catch(e){
                    //json化失败
                    reject(e);
                }
            }).catch(function (err) {
                console.log("报错了");
                reject(err);
            });
        });
    }
};
console.log("进行查询123.120.172.179");
IPManager.query('123.120.172.179');

module.exports = IPManager;