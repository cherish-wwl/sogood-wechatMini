//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '',
    ori_src: 'https://www.sogoodprint.com/',
    oss: '',
    token: "",
    userInfo: null,
    isLoaded: false
  },

  onLoad: function (options) {
    var that = this;
    console.log('index options',options)
    this.setData({
        options
    })
  },
  getLogin() {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log("用户授权了",res);
          that.getWechatUserInfo();
          that.TouchWXLogin()
        } else {
          //用户没有授权
          console.log("用户没有授权");
          that.setData({
            isLoaded: true
          })
        }
      }
    });
  },
  getWechatUserInfo(){
    const that = this
    wx.getUserInfo({
      success: function(res) {
        console.log('getWechatUserInfo', res)
        that.setData({
          userInfo: res
        })
      }
    })
  },
  onShow: function () {
    this.setData({
      src: ''
    })
    this.getLogin();
  },
  setSrc() {
    let path = '?token=' + this.data.token
    if(this.options.order){
      path = 'page/orderDetail?order=' + this.options.order + '&token='  + this.data.token
    } 
    this.setData({
      src: this.data.ori_src + path 
    })
  },
  TouchWXLogin(){
    wx.login({
      success: e => {
        let code = e.code;
        console.log('code',code)
        this.getSessionKey(code)
      },
      fail: e => {
        that.setData({
          isLoaded: true
        })
      }
    })
  },
  bindGetUserInfo: function (res) {
    console.log('bindgetuserinfo', res)
    if (res.detail.userInfo) {
      this.setData({
        userInfo: res.detail
      })
      this.TouchWXLogin()
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
  getSessionKey(code) {
    const url = 'https://www.sogoodprint.com/stage-api/wxmini/login'
    const that = this
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json', // 默认值
        'type': 1
      },
      data: {
        code
      },
      success(res) {
        console.log('getSessionKey',res.data)
        if (res.data.code == 200) {
          that.getWXInfo(res.data.data)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          that.setData({
            isLoaded: true
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
        that.setData({
          isLoaded: true
        })
      }
    })
 
  },
  getWXInfo(session){
    console.log('getWXInfo',this.data.userInfo,session )
    // /wxmini/info
    const url = 'https://www.sogoodprint.com/stage-api/wxmini/info'
    const that = this
    wx.request({
      url: url,
      method:'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'type': 1
      },
      data: {
        sessionKey: session.sessionKey,
        signature: this.data.userInfo.signature,
        rawData: this.data.userInfo.rawData,
        encryptedData: this.data.userInfo.encryptedData,
        iv: this.data.userInfo.iv,
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
        that.setData({
          isLoaded: true
        })
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
        that.setData({
          isLoaded: true
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

  },
  toPay(){
    wx.navigateTo({
      url: '/pages/pay/pay',
    })
  }
})