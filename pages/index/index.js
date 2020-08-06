//index.js
import * as echarts from '../../ec-canvas/echarts';

var util = require('../../utils/util.js')

const app = getApp()

function setOption(chart) {
  const option = {
    legend: {
      data: ['每小时进入人数'],
      top: '3%',
      textStyle: {
        fontSize: 16
      }
    },
    grid: {
      top: "10%"
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: []
    },
    series: [{
      name: '每小时进入人数',
      type: 'bar',
      data: [],
      label: {
        show: true,
        position: 'inside',
        fontSize: 12,
      },
    }]
  };
  chart.setOption(option);
}

Page({
  data: {
    ec: {
      lazyLoad: true
    },
    start_date: '2019-01-01',
    end_date: ''
  },

  onReady: function() {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
  },

  onLoad: function() {
    //获取昨天日期
    var yesterday_date = util.formatDate(new Date());
    this.setData({
      end_date: yesterday_date
    })

    if (this.chart == undefined) {
      setTimeout(this.init, 500)
      setTimeout(this.get_data, 1000)
    }
  },

  // 点击按钮后初始化图表
  init: function() {
    this.ecComponent.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      setOption(chart);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isLoaded: true,
        isDisposed: false
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  bindDateChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var mydate = e.detail.value
    this.get_data(mydate)
  },

  get_data: function(d) {
    var that = this
    var option = this.chart.getOption();
    if (d == undefined) {
      d = ''
    }
    wx.request({
      url: 'http://127.0.0.1:8000/api/get_hour_num?date=' + d,
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        var data_d = res.data.d
        var data_s = res.data.s
        var data_x = res.data.y
        var data_y = res.data.x
        option.series[0].data = data_x
        option.yAxis[0].data = data_y
        that.chart.setOption(option, true);

        var title = data_d + "     客流人数:" + res.data.s

        that.setData({
          title: title
        })

      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  dispose: function() {
    if (this.chart) {
      this.chart.dispose();
    }

    this.setData({
      isDisposed: true
    });
  }

})