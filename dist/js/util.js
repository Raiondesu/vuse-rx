"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnDestroy$ = void 0;
const if_const_1 = __importDefault(require("if-const"));
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const createOnDestroy$ = () => new rxjs_1.Observable(ctx => if_const_1.default(vue_1.getCurrentInstance(), inst => {
    vue_1.onUnmounted(() => {
        ctx.next();
    }, inst);
}));
exports.createOnDestroy$ = createOnDestroy$;
//# sourceMappingURL=util.js.map