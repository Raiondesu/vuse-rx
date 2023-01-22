"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromHook = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const fromHook = (hook) => new rxjs_1.Observable(ctx => { (0, vue_1.getCurrentInstance)() && hook(() => ctx.next()); });
exports.fromHook = fromHook;
//# sourceMappingURL=from.js.map