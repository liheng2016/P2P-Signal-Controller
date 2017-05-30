$(function(){
    //获取资源列表
    $.post("/client/list", function(res){
        $.each(res.data, function(i, item){
            //构造资源数组
            var dom = "";
            item.urls.map(function(url){
                dom +=
                    "<tr><td>" + url + "</td></tr>";
            });
            //添加一个面板
            $(".Main-Content").append(
                "<div class='panel panel-info'>" +
                  "<div class='panel-heading'>" + "地址:" + item.address + ", 权重:" + item.weight + "</div>" +
                  '<table class="panel-body table table-striped">' +
                    '<thead>' +
                    '<tr><th>包含资源地址</th></tr>' +
                    '</thead>' +
                    '<tbody>' + dom + '</tbody>' +
                  '</table>' +
                '</div>'
            );
        });
    });
});