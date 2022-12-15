import { TransformPluginContext } from 'rollup'
import { NOOP } from '../utils'
import { LoaderDefinition } from 'webpack'
import { ResolvedOptions } from '../options'

export interface ProxyPluginContext {
  resolve(context: string, request: string): Promise<{ id: string } | null>
  addDependency(filename: string): void
  cacheable(): void
  async(): any
  resource?: string
  resourcePath?: string
  sourceMap?: boolean
}

export function proxyPluginContext(
  pluginContext: TransformPluginContext | ThisParameterType<LoaderDefinition>,
  rollupOptions?: {
    moduleId: string
    options: ResolvedOptions
  }
): ProxyPluginContext {
  if ('mode' in pluginContext) {
    return {
      resolve: (request: string, context: string) =>
        new Promise((resolve, reject) => {
          pluginContext.resolve(context, request, (err, res) => {
            if (err) return reject(err)
            resolve({
              id: res as string
            })
          })
        }),
      addDependency: pluginContext.addDependency.bind(pluginContext),
      cacheable: pluginContext.cacheable.bind(pluginContext),
      async: pluginContext.async.bind(pluginContext),
      resource: pluginContext.resource,
      sourceMap: pluginContext.sourceMap
    }
  } else {
    return {
      resolve: pluginContext.resolve.bind(pluginContext),
      addDependency: pluginContext.addWatchFile.bind(pluginContext),
      cacheable: NOOP,
      async: NOOP,
      resource: rollupOptions?.moduleId,
      sourceMap: rollupOptions?.options.sourceMap
    }
  }
}
