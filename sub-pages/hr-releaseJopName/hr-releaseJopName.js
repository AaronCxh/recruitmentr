const app = getApp()
import {
  requestPositionNameById,
  requestAllPositionName,
} from '../../api/config'
import { Debounce } from '../../utils/util'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    value: '',
    show: false,
    top: [],
    middle: [],
    last: [],
    selected: [],
    searchList: [],
    searchKey: '',
  },
  onConfirm(e) {
    const page = getCurrentPages()[getCurrentPages().length - 2]
    page.setData({
      searchKey: e.detail,
    })
    app.globalData.selectPostion = []
    wx.navigateBack()
  },
  onChange(e) {
    this.setData({
      value: e.detail,
    })
  },
  onClose() {
    this.setData({
      show: false,
    })
  },
  onSearch: Debounce(function (e) {
    console.log(e)
    // app.globalData.searchKey = e.detail
    // const page = getCurrentPages()[getCurrentPages().length - 2]
    // page.setData({
    //   searchKey: e.detail,
    // })
    this.setData({
      show: false,
    })
    if (!e.detail) {
      this.setData({
        showSearch: false,
        searchList: [],
      })
      return
    }
    this.getSingleLists(e.detail)
  }, 250),
  onCancel() {
    console.log('cancel')
  },
  onClear() {
    console.log('clear')
  },
  getSingleLists: function (searchkey) {
    wx.showLoading({
      mask: true,
    })
    requestPositionNameById({
      name: searchkey,
    }).then((res) => {
      this.setData({
        showSearch: true,
        middle: [],
        last: [],
        selected: [],
        searchList: res.data.dataList,
      })
      wx.hideLoading(0)
      console.log('搜索结果', res)
    })
  },

  getPostionListById(id, target) {
    requestPositionNameById({
      id,
    }).then((res) => {
      console.log('职业分类', res)
      this.setData({
        [`${target}`]: res.data.dataList,
      })
    })
  },
  onTopTap(e) {
    const { id, index } = e.currentTarget.dataset
    this.setData({
      show: true,
      [`selected[0]`]: this.data.top[index],
      last: [],
    })
    this.getPostionListById(id, 'middle')
  },
  onMiddelTap(e) {
    const { id, index } = e.currentTarget.dataset
    this.setData({
      [`selected[1]`]: this.data.middle[index],
    })
    this.getPostionListById(id, 'last')
  },
  onLastTap(e) {
    const { id, index } = e.currentTarget.dataset
    const page = getCurrentPages()[getCurrentPages().length - 2]

    this.setData(
      {
        [`selected[2]`]: this.data.last[index],
      },
      () => {
        if (this.data.type == 'search') {
          wx.navigateTo({
            url: `/pages/search/search?searchKey=${this.data.last[index].Name}&classid=${this.data.last[index].AutoID}`,
          })
          return
        }
        app.globalData.selectPostion = this.data.selected
        page.setData({
          position: this.data.last[index],
        })
        wx.navigateBack()
      }
    )
  },
  onSelect(e) {
    const { index } = e.currentTarget.dataset
    if (this.data.type == 'search') {
      wx.navigateTo({
        url: `/pages/search/search?searchKey=${this.data.searchList[index].Name}`,
      })
      return
    }
    app.globalData.selectPostion[2] = this.data.searchList[index]
    getCurrentPages()[getCurrentPages().length - 2].setData({
      position: this.data.searchList[index],
    })
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type || '',
    })
    this.getPostionListById(0, 'top')
    if (options.search) {
      this.setData({
        searchKey: options.search,
      })

      this.getSingleLists(options.search)
    }
    if (options.type == 'search') {
      wx.setNavigationBarTitle({
        title: '职位分类',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
})
