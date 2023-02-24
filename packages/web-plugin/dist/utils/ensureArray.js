"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * forked from https://github.com/rollup/plugins/blob/master/packages/pluginutils/src/utils/ensureArray.ts
 * Helper since Typescript can't detect readonly arrays with Array.isArray
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArray(arg) {
    return Array.isArray(arg);
}
function ensureArray(thing) {
    if (isArray(thing))
        return thing;
    if (thing == null)
        return [];
    return [thing];
}
exports.default = ensureArray;
//# sourceMappingURL=ensureArray.js.map