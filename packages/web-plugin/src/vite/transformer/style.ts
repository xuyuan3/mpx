import { styleCompiler } from '@mpxjs/compiler'
import genComponentTag from '@mpxjs/compile-utils/gen-component-tag'
import postcss from 'postcss'
import { SourceMapInput, TransformPluginContext, TransformResult } from 'rollup'
import { createFilter } from 'vite'
import { ResolvedOptions } from '../../options'
import loadPostcssConfig from '@mpxjs/compile-utils/loadPostcssConfig'
import { SFCDescriptor } from '../compiler'

async function mpxTransformStyle(
  code: string,
  filename: string,
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  pluginContext: TransformPluginContext
): Promise<TransformResult> {
  const { autoScopeRules, defs, transRpxRules: transRpxRulesRaw } = options
  const filter = createFilter(autoScopeRules.include, autoScopeRules.exclude)
  const autoScope = autoScopeRules.include && filter(filename)
  const transRpxRules = transRpxRulesRaw
    ? Array.isArray(transRpxRulesRaw)
      ? transRpxRulesRaw
      : [transRpxRulesRaw]
    : []
  const inlineConfig = { ...options.postcssInlineConfig }
  const config = await loadPostcssConfig({ webpack: {}, defs }, inlineConfig)
  const plugins = config.plugins.concat(styleCompiler.trim())

  if (autoScope) {
    const moduleId = descriptor.id
    plugins.push(styleCompiler.scopeId({ id: `data-v-${moduleId}` }))
  }

  plugins.push(
    styleCompiler.pluginCondStrip({
      defs
    })
  )

  for (const item of transRpxRules) {
    const { mode, comment, designWidth, include, exclude } = item || {}
    const filter = createFilter(include, exclude)
    if (filter(filename)) {
      plugins.push(styleCompiler.rpx({ mode, comment, designWidth }))
    }
  }

  if (options.mode === 'web') {
    plugins.push(styleCompiler.vw({ transRpxFn: options.webConfig.transRpxFn }))
  }

  const result = await postcss(plugins).process(code, {
    to: filename,
    from: filename,
    map: options.sourceMap
      ? {
          inline: false,
          annotation: false
        }
      : false,
    ...config.options
  })

  if (result.messages) {
    result.messages.forEach(({ type, file }) => {
      if (type === 'dependency') {
        pluginContext.addWatchFile(file)
      }
    })
  }
  // pluginContext.sourcemapChain.push(result.map && result.map.toJSON())
  return {
    code: result.css,
    map: result.map && (result.map.toJSON() as SourceMapInput)
  }
}

/**
 * transfrom style
 * @param code - style code
 * @param filename - filename
 * @param descriptor - SFCDescriptor
 * @param options - ResolvedOptions
 * @param pluginContext - TransformPluginContext
 */
export async function transformStyle(
  code: string,
  filename: string,
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  index: number,
  pluginContext: TransformPluginContext
): Promise<TransformResult | undefined> {
  const mpxStyle = await mpxTransformStyle(
    code,
    filename,
    descriptor,
    options,
    pluginContext
  )
  return mpxStyle
}

/**
 * generate style block
 * @param descriptor - SFCDescriptor
 * @returns <style>descriptor.style</style>
 */
export function genStylesBlock(descriptor: SFCDescriptor): { output: string } {
  const { styles } = descriptor
  return { output: styles.map(style => genComponentTag(style)).join('\n') }
}
