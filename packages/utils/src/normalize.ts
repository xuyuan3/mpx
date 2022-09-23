// const path = require('path')

// exports.lib = file => path.resolve(__dirname, '../', file)
// support npm link debug
export const lib = (file: string) => '@mpxjs/webpack-plugin/lib/' + file
export const runtime = (file: string) => '@mpxjs/web-plugin/src/runtime/' + file
export const utils = (file: string) => '@mpxjs/utils/' + file
