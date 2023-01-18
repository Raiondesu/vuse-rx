export const shallow = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = mutation[key];
    }
    return state;
};
//# sourceMappingURL=shallow.js.map