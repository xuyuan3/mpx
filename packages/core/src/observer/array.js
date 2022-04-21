import { def } from '../helper/utils'
import { getObserver } from './reactive'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

  /**
   * Intercept mutating methods and emit events
   */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
  .forEach(function (method) {
    // cache original method
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator (...args) {
      const result = original.apply(this, args)
      const ob = getObserver(this)
      if (ob) {
        let inserted
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args
            break
          case 'splice':
            inserted = args.slice(2)
            break
        }
        if (inserted) ob.observeArray(inserted)
        // notify change
        ob.dep.notify()
      }
      return result
    })
  })
