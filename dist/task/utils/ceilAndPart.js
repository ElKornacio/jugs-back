"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ceilAndPart(a, b) {
    return {
        ceil: Math.floor(a / b),
        part: (a % b) !== 0
    };
}
exports.default = ceilAndPart;
;
//# sourceMappingURL=ceilAndPart.js.map