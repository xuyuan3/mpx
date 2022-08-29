import normalize from '@mpxjs/utils/normalize'
import { LoaderContext } from 'webpack'
import { RESOLVE_IGNORED_ERR } from '../../constants/index'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parseRequest = require(normalize.utils('parse-request'))

type LoaderContextResolveCallback = Parameters<LoaderContext<null>['resolve']>[2]

// todo 提供不记录dependency的resolve方法，非必要的情况下不记录dependency，提升缓存利用率
export default (
  context: string,
  request: string,
  loaderContext: LoaderContext<null>,
  callback: LoaderContextResolveCallback
): any => {
  const { queryObj } = parseRequest(request)
  context = queryObj.context || context
  return loaderContext.resolve(context, request, (err, resource, info) => {
    if (err) return callback(err)
    if (resource === false) return callback(RESOLVE_IGNORED_ERR)
    callback(null, resource, info)
  })
}
