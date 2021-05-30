"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSolver_1 = __importDefault(require("../types/AbstractSolver"));
const printActions_1 = __importDefault(require("../utils/printActions"));
class SlowSimulationalSolver extends AbstractSolver_1.default {
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
        function act() {
            let stack = [{ state: { x: 0, y: 0 }, branch: 0 }];
            let history = [];
            let results = [];
            const wasInState = {};
            while (stack.length) {
                const pos = stack[stack.length - 1];
                const { state, branch } = pos;
                if (state.x === Z || state.y === Z) {
                    results.push(history.slice());
                    stack.pop();
                    history.pop();
                    continue;
                }
                if (branch === 0 && wasInState[state.x + ':' + state.y]) {
                    stack.pop();
                    history.pop();
                    continue;
                }
                wasInState[state.x + ':' + state.y] = true;
                const sum = state.x + state.y;
                const willPourX = sum > Y ? (Y - state.y) : state.x;
                const willPourY = sum > X ? (X - state.x) : state.y;
                if (branch === 0) {
                    pos.branch++;
                    history.push('fX');
                    stack.push({ state: { x: X, y: state.y }, branch: 0 });
                }
                else if (branch === 1) {
                    pos.branch++;
                    history.push('fY');
                    stack.push({ state: { x: state.x, y: Y }, branch: 0 });
                }
                else if (branch === 2) {
                    pos.branch++;
                    history.push('X2Y');
                    stack.push({ state: { x: state.x - willPourX, y: state.y + willPourX, }, branch: 0 });
                }
                else if (branch === 3) {
                    pos.branch++;
                    history.push('Y2X');
                    stack.push({ state: { x: state.x + willPourY, y: state.y - willPourY, }, branch: 0 });
                }
                else if (branch === 4) {
                    pos.branch++;
                    history.push('eX');
                    stack.push({ state: { x: 0, y: state.y, }, branch: 0 });
                }
                else if (branch === 5) {
                    pos.branch++;
                    history.push('eY');
                    stack.push({ state: { x: state.x, y: 0, }, branch: 0 });
                }
                else {
                    stack.pop();
                    history.pop();
                    delete wasInState[state.x + ':' + state.y];
                }
            }
            return results;
        }
        const temp = act();
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
exports.default = SlowSimulationalSolver;
//# sourceMappingURL=SlowSimulationalSolver.js.map