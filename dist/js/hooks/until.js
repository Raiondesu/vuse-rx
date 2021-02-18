"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.untilUnmounted = exports.pipeUntil = void 0;
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const from_1 = require("./from");
const pipeUntil = (hook) => operators_1.takeUntil(from_1.fromHook(hook));
exports.pipeUntil = pipeUntil;
const untilUnmounted = (obs) => obs.pipe(exports.pipeUntil(vue_1.onUnmounted));
exports.untilUnmounted = untilUnmounted;
//# sourceMappingURL=until.js.map