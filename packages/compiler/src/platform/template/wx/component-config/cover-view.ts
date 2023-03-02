import { DefineConfig } from '.'

const TAG_NAME = 'cover-view'

export default <DefineConfig> function ({ print }) {
  const aliPropLog = print({ platform: 'ali', tag: TAG_NAME, isError: false })
  const baiduValueLogError = print({ platform: 'baidu', tag: TAG_NAME, isError: true, type: 'value' })
  const webPropLog = print({ platform: 'web', tag: TAG_NAME, isError: false })
  return {
    test: TAG_NAME,
    web (_tag, { el }) {
      if (el.hasEvent) {
        el.isBuiltIn = true
      }
      if (el.isBuiltIn) {
        return 'mpx-view'
      } else {
        return 'div'
      }
    },
    tt () {
      return 'view'
    },
    props: [
      {
        test: 'scroll-top',
        ali: aliPropLog,
        swan ({ name, value }) {
          if (typeof value === 'string') {
            baiduValueLogError({ name, value })
          }
        },
        web: webPropLog
      },
      {
        test: 'use-built-in',
        web (_prop, { el }) {
          el.isBuiltIn = true
        }
      }
    ]
  }
}