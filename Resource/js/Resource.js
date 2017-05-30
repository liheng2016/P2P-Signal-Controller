$(function(){
    //获取资源列表
    $.post("/resource/list", function(res){
        $.each(res.data, function(i, item){
            //构造客户端数组
            var dom = "";
            item.clients.map(function(client){
                dom +=
                    "<tr><td>" + client.address + "</td><td>" + client.weight + "</td></tr>";
            });
            //添加一个面板
            $(".Main-Content").append(
                "<div class='panel panel-info'>" +
                    "<div class='panel-heading'>" + "URL:" + item.url + ", MD5:" + item.md5 + "</div>" +
                    '<table class="panel-body table table-striped">' +
                        '<thead>' +
                            '<tr><th>第三方提供者地址</th><th>权重</th></tr>' +
                        '</thead>' +
                        '<tbody>' + dom + '</tbody>' +
                    '</table>' +
                '</div>'
            );
        });
    });
});