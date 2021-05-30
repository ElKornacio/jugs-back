"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractSolver {
    getBestSolution(params) {
        const all = this.getSolutions(params);
        const min = Math.min(...all.map(a => this.getSolutionLength(a)));
        return all.find(a => this.getSolutionLength(a) === min);
    }
}
exports.default = AbstractSolver;
//# sourceMappingURL=AbstractSolver.js.map