const app = getApp()
import { requestList, postCollect } from '../../api/hr/collect'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    buttontext: '加载中',
    tabs: [
      { title: '全部', value: 0 },
      { title: '沟通中', value: 1 },
      { title: '待沟通', value: 99 },
    ],
    lists: [],
    active: 0,
  },
  onClose(event) {
    console.log(event)
    const { id } = event.currentTarget
    const { position, instance } = event.detail
    switch (position) {
      case 'left':
      case 'cell':
        instance.close()
        break
      case 'right':
        app.showModal({
          content: '确定删除吗？',
          success: (res) => {
            if (res.confirm) {
              postCollect(id).then((res) => {
                app.showToast(res.data.msg)
                instance.close()
                this.getLists()
              })
            }
          },
        })
        break
    }
  },
  onNavTo(e) {
    console.log(e)
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/resume/resume?id=${id}`,
    })
  },
  onChange(e) {
    console.log(e)
    this.setData(
      {
        active: e.detail.index,
      },
      () => {
        this.getLists(1)
      }
    )
  },
  initList() {
    var listTemp = []
    for (var i = 0; i < this.data.tabs.length; i++) {
      listTemp[i] = {}
      listTemp[i].pageNum = 1
      listTemp[i].loading = true
      listTemp[i].nomore = false
      listTemp[i].init = false
      listTemp[i].data = []
      listTemp[i].buttontext = '加载中...'
      listTemp[i].loadData = false
    }
    this.setData({
      initList: true,
      lists: listTemp,
    })
    return Promise.resolve()
  },
  getLists(pageNum = 1) {
    const { active, lists, tabs } = this.data
    console.log(123456)
    requestList({
      pageindex: pageNum,
      pagesize: 20,
      status: tabs[active].value,
    }).then((res) => {
      console.log('我的收藏', res)
      if (res.data.ret == 'success') {
        var data = res.data.dataList
        this.setData({
          loadData: true,
          [`lists[${active}].init`]: true,
        })

        if (res.data.TotalCount - 10 * (pageNum - 1) <= 10) {
          this.setData({
            [`lists[${active}].moreButton`]: true,
            [`lists[${active}].buttontext`]: '暂无更多数据',
            [`lists[${active}].loading`]: false,
            [`lists[${active}].pageNum`]: 0,
            [`lists[${active}].loadData`]: true,
          })
        } else {
          this.setData({
            [`lists[${active}].buttontext`]: '加载中..',
            [`lists[${active}].loading`]: true,
            [`lists[${active}].pageNum`]: pageNum,
          })
        }

        if (res.data.TotalCount > 0) {
          this.setData({
            [`lists[${active}].data`]:
              pageNum == 1 ? data : lists[active].data.concat(data),
            [`lists[${active}].loadData`]: true,
          })
        } else {
          this.setData({
            [`lists[${active}].data`]: [],
            [`lists[${active}].nomore`]: true,
          })
        }
      } else {
        this.setData({
          [`lists[${active}].data`]: [],
          [`lists[${active}].nomore`]: true,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initList().then(() => {
      console.log(213)
      this.getLists()
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
    app.globalData.isRef && this.getLists() && (app.globalData.isRef = false)
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
  onReachBottom: function () {
    this.data.lists[this.data.active].pageNum != 0 &&
      this.getLists(this.data.lists[this.data.active].pageNum + 1)
  },
})
