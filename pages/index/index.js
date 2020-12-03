//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '',
    ori_src: 'https://www.sogoodprint.com',
    oss: '',
    token: ""
  },

  onLoad: function (options) {
    var that = this;
  },
  getLogin() {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log("用户授权了");
          wx.login({
            success: e => {
              let code = e.code;
              console.log(code)
              if (code) { }
              that.getToken(code)
            }
          })
        } else {
          //用户没有授权
          console.log("用户没有授权");
        }
      }
    });
  },
  onShow: function () {
    this.setData({
      src: ''
    })
    this.getLogin();
  },
  setSrc() {
    this.setData({
      src: this.data.ori_src + '?token=' + this.data.token + '&vid=' + new Date().getTime()
    })
  },
  bindGetUserInfo: function (res) {
    console.log('bindgetuserinfo', res)
    if (res.detail.userInfo) {
      wx.login({
        success: e => {
          let code = e.code;
          console.log(code)
          this.getToken(code)
        }
      })
    } else {
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });

    }
  },
  getToken(code) {
    const url = 'https://www.sogoodprint.com/stage-api/wxmini/info'
    const that = this
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json', // 默认值
      },
      data: {
        code
      },
      success(res) {
        console.log(res.data)
        if (res.data.code == 200) {
          that.setData({
            token: res.data.token
          })
          that.setSrc()
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
      }
    })

  },
  onShareAppMessage: function (ops) {
    var that = this
    return {
      title: 'Sogoodprint-画册彩页折页海报在线印刷报价服务平台',
      path: '/pages/index/index',
      imageUrl: '/image/share.jpeg'

    }

  }
})