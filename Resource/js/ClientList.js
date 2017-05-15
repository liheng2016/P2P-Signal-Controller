// 中国区域划分
// 华北地区:北京 天津 河北 内蒙古 山西
// 华南地区:广东 广西 海南
// 华东地区:上海 山东 安徽 浙江 福建 江苏 江西
// 华中地区:湖北 湖南 河南
// 西北地区:新疆 甘肃 青海 陕西 宁夏
// 西南地区:重庆 四川 云南 贵州 西藏
// 东北地区:黑龙江 吉林 辽宁
// 其他地区:香港 澳门 台湾



var overview = {
  //客户端
  clients:{
    canvas:   null,
    config:{
      type: 'pie',
      data: {
        datasets: [{ data: [1, 2, 3, 4, 5, 6, 7, 8], backgroundColor: ["#0000CC", "#F7464A", "#46BFBD", "#FDB45C", "#660000", "#FF6633", "#FFFF00", "#FF66FF"] }],
        labels: ["华北", "华南", "华东", "华中", "西北", "西南", "东北", "其他"]
      },
      options: {
        responsive: true
      }
    },
    /**
     * 初始化
     */
    init: function() {
      overview.clients.canvas = $("#chart-clients").get(0).getContext("2d");;
    },
    /**
     * 刷新
     */
    refresh:  function(){
      //设置数据
      //overview.clients.config.data.datasets[0].data = [];
      //画图
      new Chart(overview.clients.canvas, overview.clients.config);
    }
  },
  //资源
  resources:{
    canvas: null,
    config:{
      type: 'pie',
      data: {
        datasets: [{
          data: [
            1,
            1,
            1
          ],
          backgroundColor: [
            "#F7464A",
            "#46BFBD",
            "#FDB45C"
          ]
        }],
        labels: [
          "图片",
          "视频",
          "音频"
        ]
      },
      options: {
        responsive: true
      }
    },
    /**
     * 初始化
     */
    init: function(){
      overview.resources.canvas = $("#chart-resources").get(0).getContext("2d");;
    },
    /**
     * 刷新
     */
    refresh:  function(){
      overview.resources.config.data.datasets[0].data = [1, 1, 1];
      //画图
      new Chart(overview.resources.canvas, overview.resources.config);
    }
  }
};

/*** 加载后执行的操作 ***/
$(function(){
  //初始化
  overview.clients.init();
  overview.resources.init();
  //刷新界面
  overview.clients.refresh();
  overview.resources.refresh();
});