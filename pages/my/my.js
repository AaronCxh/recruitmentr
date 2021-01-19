const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mylogin: false,
    user: null,
    isRegister: false,
  },
  onNavTo(e) {
    let { url } = e.currentTarget.dataset
    const { mylogin, isRegister } = this.data
    if (!mylogin) {
      url = '/pages/login/login'
    }
    if (!isRegister) {
      url = '/pages/register/register'
    }
    wx.navigateTo({
      url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app
      .getUserInfos()
      .then((res) => {
        console.log('个人信息', res)
      })
      .catch(() => {
        console.error('未授权')
      })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
})
