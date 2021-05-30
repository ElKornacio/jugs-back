"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSolver_1 = __importDefault(require("../types/AbstractSolver"));
const printActions_1 = __importDefault(require("../utils/printActions"));
class SlowestRecursiveSolver extends AbstractSolver_1.default {
    getSolutions(params) {
        let { X, Y, Z } = params;
        if (X === Y && X !== Z) {
            return [];
        }
        let swap = false;
        if (X > Y) {
            swap = true;
            [X, Y] = [Y, X];
        }
        function act(state, wasInStateRaw, history) {
            if (state.x === Z || state.y === Z) {
                return [history];
            }
            if (wasInStateRaw[state.x + ':' + state.y]) {
                return [];
            }
            const wasInState = Object.assign({}, wasInStateRaw);
            wasInState[state.x + ':' + state.y] = true;
            const a = act({ x: X, y: state.y }, wasInState, history.concat(['fX']));
            const b = act({ x: state.x, y: Y }, wasInState, history.concat(['fY']));
            const sum = state.x + state.y;
            const willPourX = sum > Y ? (Y - state.y) : state.x;
            const willPourY = sum > X ? (X - state.x) : state.y;
            const c = act({
                x: state.x - willPourX,
                y: state.y + willPourX,
            }, wasInState, history.concat(['X2Y']));
            const d = act({
                x: state.x + willPourY,
                y: state.y - willPourY,
            }, wasInState, history.concat(['Y2X']));
            const e = act({ x: 0, y: state.y }, wasInState, history.concat(['eX']));
            const f = act({ x: state.x, y: 0 }, wasInState, history.concat(['eY']));
            return a.concat(b).concat(c).concat(d).concat(e).concat(f);
        }
        const temp = act({ x: 0, y: 0 }, {}, []);
        if (temp.length === 0) {
            return [[]];
        }
        else {
            return temp;
        }
    }
    convertToActions(solution) {
        return solution;
    }
    printSolution(printer, solution) {
        printActions_1.default(null, printer, solution);
    }
    getSolutionLength(solution) {
        return solution.length;
    }
}
exports.default = SlowestRecursiveSolver;
//# sourceMappingURL=SlowestRecursiveSolver.js.map