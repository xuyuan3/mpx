import { ToPromise, webHandleSuccess, webHandleFail, createDom, getRootElement } from '../../../common/js'
import '../../../common/stylus/ActionSheet.styl'
import MpxEvent from '@mpxjs/webpack-plugin/lib/runtime/components/web/event'

export default class ActionSheet extends ToPromise {
  constructor () {
    super()
    this.defaultOpts = {
      itemList: [],
      itemColor: '#000000',
      success: null,
      fail: null,
      complete: null
    }
    this.hideTimer = null

    this.actionSheet = createDom('div', { class: '__mpx_actionsheet__' }, [
      this.mask = createDom('div', { class: '__mpx_mask__' }),
      this.box = createDom('div', { class: '__mpx_actionsheet_box__' }, [
        this.list = createDom('div', { class: '__mpx_actionsheet_list__' }),
        this.cancelBtn = createDom('div', { class: '__mpx_actionsheet_cancel__' }, ['取消'])
      ])
    ])
  }

  show (options) {
    getRootElement().appendChild(this.actionSheet) // show 则挂载
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    const opts = Object.assign({}, this.defaultOpts, options)

    const list = createDom('div', { class: '__mpx_actionsheet_list__' })

    opts.itemList.forEach((item, index) => {
      const sheet = createDom('div', { class: '__mpx_actionsheet_sheet__' }, [item])
      // eslint-disable-next-line no-new
      new MpxEvent({
        layer: sheet,
        touchend: () => {
          this.hide()
          const res = {
            errMsg: 'showActionSheet:ok',
            tapIndex: index
          }
          webHandleSuccess(res, opts.success, opts.complete)
          this.toPromiseResolve(res)
        }
      })
      list.appendChild(sheet)
    })

    this.box.replaceChild(list, this.list)
    this.list = list
    this.list.style.color = opts.itemColor
    // eslint-disable-next-line no-new
    new MpxEvent({
      layer: this.cancelBtn,
      touchend: () => {
        this.hide()
        const err = { errMsg: 'showActionSheet:fail cancel' }
        webHandleFail(err, opts.fail, opts.complete)
        !opts.fail && this.toPromiseReject(err)
      }
    })
    // make transition next frame
    this.actionSheet.classList.add('show')
    // 如果使用 requestAnimationFrame，第一次展示不会有动画效果，原因待确认，这里先使用 setTimeout
    setTimeout(() => {
      this.box.classList.add('show')
    }, 17)

    return this.toPromiseInitPromise()
  }

  hide () {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    this.box.classList.remove('show')
    this.hideTimer = setTimeout(() => {
      this.actionSheet.classList.remove('show')
      this.actionSheet.remove() // hide 则卸载
    }, 300) // animation duration is 300ms
  }
}
