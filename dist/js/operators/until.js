"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.untilUnmounted = exports.pipeUntil = void 0;
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const from_1 = require("../hooks/from");
const pipeUntil = (hook) => operators_1.takeUntil(from_1.fromHook(hook));
exports.pipeUntil = pipeUntil;
exports.untilUnmounted = exports.pipeUntil(vue_1.onUnmounted);
//# sourceMappingURL=until.js.map