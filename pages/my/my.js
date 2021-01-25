const app = getApp()
import { auth, getRoleInfos, togglerRole } from '../../api/user'
import { requestUserInfo } from '../../api/user/user'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mylogin: app.globalData.mylogin,
    user: {},
    isRegister: false,
    code: -1,
  },
  onPhone(e) {
    console.log('weapp绑定手机', e)
    const { detail } = e
    const { user, code } = this.data
    if (detail.errMsg.indexOf('fail') > -1) {
      console.log('授权手机失败')
    } else {
      auth({
        encryptedData: encodeURIComponent(detail.encryptedData),
        iv: encodeURIComponent(detail.iv),
        code,
      })
        .then((res) => {
          console.log(res)
          if (res.data.ret == 'success') {
            wx.setStorageSync('LogiSessionKey', res.data.rdsession)
            app.globalData.mylogin = true
            this.setData({
              mylogin: true,
            })
            getRoleInfos().then((res) => {
              console.log('会员信息', res)
              app.globalData.roleInfo = res
              this.getUser()
            })
          }
        })
        .catch((err) => {
          console.error(err)
        })
      // var temp = {}
      // temp.type = 'wechat'
      // temp.apiname = 'bindmobile'
      // temp.iv = encodeURIComponent(e.detail.iv)
      // temp.encryptedData = encodeURIComponent(e.detail.encryptedData)
      // temp.code = code
      // console.log(temp)
      // app.request({
      //   url: app.api.host + '/Include/Weixin/wechatdata',
      //   data: temp,
      //   method: 'POST',
      //   success: (resp) => {
      //     console.log('微信绑定手机', resp)
      //     user.Mobile = resp.data.mobile
      //     user.bindphone = true
      //     this.setState({
      //       user,
      //     })
      //     if (resp.data.ret != 'success') {
      //       return app.showToast('绑定失败')
      //     }
      //   },
      // })
    }
  },
  onNavTo(e) {
    let { url } = e.currentTarget.dataset
    const { mylogin, isRegister } = this.data
    if (!mylogin) {
      url = '/pages/login/login'
    } else if (!isRegister) {
      url = '/pages/register/register'
    }
    wx.navigateTo({
      url,
    })
  },
  onNavToHr() {
    togglerRole(1).then(() => {
      wx.reLaunch({
        url: '/sub-pages/main/main',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      mylogin: app.globalData.mylogin,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.login({
      success: (e) => {
        this.setData({
          code: e.code,
        })
      },
    })
    this.getUser()
  },
  getUser() {
    requestUserInfo()
      .then((res) => {
        console.log('求职者信息', res)
      })
      .catch((err) => {
        console.error(err)
        wx.reLaunch({
          url: '/pages/register/register'
        })
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
  onShareAppMessage: function () {
    return {
      title: '柯城就业创业招聘网',
      path: '/pages/index/index',
      imageUrl: 'https://s3.ax1x.com/2021/01/21/sh67FI.jpg',
    }
  },
})
