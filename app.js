//app.js
import { getTimeStr, encrypt, decrypt } from './utils/util'
import './utils/es6-promise.min.js'
global.Promise && (Promise = global.Promise)
var timer
App({
  onLaunch: function () {
    // 展示本地存储能力
    // wx.clearStorage()

    this.updateAppHandle()
    // 登录
    this.checkLoginStatus()
      .then((res) => {
        this.getUserInfos()
      })
      .catch((err) => {
        console.error(err)
      })

    // this.getConfig()
    wx.getSystemInfo({
      success: (res) => {
        console.log('系统信息', res)
        this.globalData.systemInfo = res
        let modelmes = res.model
        if (modelmes.search('iPhone X') != -1) {
          this.globalData.safeArea = true
        }
      },
    })
  },
  getConfig() {
    this.request({
      url: this.api.host + 'Include/Weixin/wechatdata.aspx',
      data: {
        apiname: 'getconfig',
      },
      success: (res) => {
        console.log('配置', res)
        this.globalData.config = res.data
      },
    })
  },
  checkLoginStatus() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          var code = res.code
          wx.request({
            url: this.api.host + 'Include/Weixin/wechatapp',
            method: 'POST',
            data: {
              apiname: 'wechatuseropenid',
              code: code,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            success: (res) => {
              console.log('授权信息', res)
              if (res.data.ret == 'success') {
                wx.setStorageSync('LogiSessionKey', res.data.rdsession)
                if (res.data.codeStatus == 1) {
                  resolve(res)
                }
                reject('会员未授权')
              }
            },
            fail: function (err) {
              console.log('获取登录凭证失败', err)
              reject(err)
            },
          })
        },
      })
    })
  },
  getUserInfos: function () {
    var temp = {
      apiname: 'getuserinfo',
    }
    return new Promise( (resolve, reject) => {
      this.request({
        url: this.api.host + 'Include/Weixin/wechatdata',
        data: temp,
        success: (res) => {
          if (res.data.ret == 'success') {
            this.globalData.userInfo = res.data
            this.globalData.mylogin = true
            resolve(res)
            if (typeof this.mylogin == 'function') {
              this.mylogin()
            }
          } else {
            reject()
          }
        },
      })
    })
  },
  setFilterData(data) {
    this.globalData.filterData = data
  },
  globalData: {
    userInfo: {},
    teacherInfo: {},
    agencyInfo: {},
    mylogin: false,
    safeArea: false,
    filterData: null,
    userType: 'user' // 'user'|'hr'
  },
  api: {
    host: 'https://wx.tuhuabao.net/',
    // host: 'http://192.168.1.17:8088/'
  },
  updataOptions: function (t, a) {
    ;(null != this.globalData.nextOptions &&
      0 != this.globalData.nextOptions.length) ||
      (this.globalData.nextOptions = {}),
      (this.globalData.nextOptions[t] = a)
  },
  showToast: function (str, callback, duration = 1500) {
    wx.showToast({
      icon: 'none',
      title: str,
      duration: duration,
    })
    if (callback) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        callback()
      }, duration)
    }
  },
  showModal: function (options) {
    options.confirmText = options.confirmText ? options.confirmText : '是'
    options.cancelText = options.cancelText ? options.cancelText : '否'
    wx.showModal(options)
  },
  request: function (options, showLoading) {
    let currentPage = getCurrentPages()[getCurrentPages().length - 1]
    if (showLoading) {
      showLoading &&
        wx.showLoading({
          mask: true,
        })
      currentPage.setData({
        loading: true,
        disabled: true,
      })
    }
    return new Promise(function (resolve, reject) {
      options.data.encrypttime = encodeURIComponent(
        encrypt(getTimeStr(Date.now(), 'datetime', true))
      )
      if (!options.data.unauthorization) {
        options.data.customrdsession = wx.getStorageSync('LogiSessionKey')
      }
      // options.header = {
      //   'Content-Type': 'application/x-www-form-urlencoded',
      // }
      options.header = Object.assign(
        {},
        {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        options.header || {}
      )
      options.success =
        options.success ||
        function (res) {
          resolve(res)
        }
      options.fail =
        options.fail ||
        function (err) {
          console.log(err)
          reject(err)
          if (err.errMsg == 'request:fail timeout') {
            wx.showModal({
              content: '请求超时,请检查网络状态',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack()
                }
              },
            })
          } else {
            reject(err)
          }
        }
      options.complete =
        options.complete ||
        function () {
          if (showLoading) {
            currentPage.setData &&
              currentPage.setData({
                loading: false,
                disabled: false,
              })
          }
          wx.stopPullDownRefresh()
        }
      var requestTast = wx.request(options)
      options.isAbort &&
        currentPage.setData({
          requestTast: requestTast,
        })
    })
  },
  updateAppHandle: function () {
    var t = wx.getUpdateManager()
    t.onUpdateReady(function (e) {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (e) {
          e.confirm && t.applyUpdate()
        },
      })
    })
  },
})
