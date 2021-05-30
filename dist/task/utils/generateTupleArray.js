"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateTupleArray(len, even, odd) {
    return [...new Array(len)].map((v, i) => i % 2 === 0 ? even : odd);
}
exports.default = generateTupleArray;
//# sourceMappingURL=generateTupleArray.js.map