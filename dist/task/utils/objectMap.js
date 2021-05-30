"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function objectMap(obj, func) {
    return Object.keys(obj).reduce((p, c) => {
        p[c] = func(obj[c]);
        return p;
    }, {});
}
exports.default = objectMap;
//# sourceMappingURL=objectMap.js.map