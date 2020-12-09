// pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payData: null,
    options: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('pay options',options)
    this.setData({
      options:options
    })
    this.getPayInfo(options.order)
  },
  pay: function() {
    const { timeStamp,nonceStr,package,signType,paySign } = this.data.payData
    const that = this
    wx.requestPayment({
      timeStamp,
      nonceStr,
      package,
      signType,
      paySign,
      success (res) {
        console.log('pay success', res)
        wx.showToast({
          title: '支付成功',
          icon: 'none',
          duration: 2000,
          complete: function () {
            wx.redirectTo({
              url: '/pages/index/index?order='+that.data.options.orderSn,
            })
          }
        })
       
      },
      fail (res) { 
        console.log('pay fail', res)
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000,
          complete: function () {
            wx.redirectTo({
              url: '/pages/index/index?order='+that.data.options.orderSn,
            })
          }
        }) 
      }
    })
  },
  getPayInfo(orderids){
    const that = this
    wx.request({
      url: 'https://www.sogoodprint.com/stage-api/wxPay/mpCreate',
      data: {
          orderId:orderids
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': this.options.token,
        'type': '1'
    },
      success(res) {
          console.log(res.data)
          if (res.data.code == 200) {
              that.setData({
                  payData: res.data.data
              })
              that.pay()
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
      },
      fail:function(res){
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        }) 
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})