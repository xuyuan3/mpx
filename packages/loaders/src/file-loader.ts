import path from 'path'
import loaderUtils from 'loader-utils'
import { LoaderDefinition } from 'webpack'
import toPosix from '@mpxjs/utils/to-posix'
import parseRequest from '@mpxjs/utils/parse-request'
import RecordResourceMapDependency from '@mpxjs/webpack-plugin/lib/dependencies/RecordResourceMapDependency'
import { Dependency } from 'webpack'

const loader:LoaderDefinition = function (content:string, prevOptions?: any) {
  const options = prevOptions || loaderUtils.getOptions(this) || {}
  const context = options.context || this.rootContext

  let url = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp
  })

  let outputPath = url

  if (options.publicPath) {
    if (options.outputPathCDN) {
      if (typeof options.outputPathCDN === 'function') {
        outputPath = options.outputPathCDN(outputPath, this.resourcePath, context)
      } else {
        outputPath = toPosix(path.join(options.outputPathCDN, outputPath))
      }
    }
  } else {
    const { resourcePath, queryObj } = parseRequest(this.resource)
    const packageRoot = queryObj.packageRoot || ''
    url = outputPath = toPosix(path.join(packageRoot, outputPath))
    this._module && this._module.addPresentationalDependency(<Dependency>new RecordResourceMapDependency(resourcePath, 'staticResource', outputPath, packageRoot))
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(url)}`

  if (options.publicPath) {
    if (typeof options.publicPath === 'function') {
      publicPath = options.publicPath(url, this.resourcePath, context)
    } else {
      publicPath = `${options.publicPath.endsWith('/')
        ? options.publicPath
        : `${options.publicPath}/`}${url}`
    }
    publicPath = JSON.stringify(publicPath)
  }

  this.emitFile(outputPath, content)

  // TODO revert to ES2015 Module export, when new CSS Pipeline is in place
  return `module.exports = ${publicPath};`
}

// @ts-ignore
loader.raw = true

export default loader
