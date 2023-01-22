"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallow = void 0;
const shallow = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = mutation[key];
    }
    return state;
};
exports.shallow = shallow;
//# sourceMappingURL=shallow.js.map