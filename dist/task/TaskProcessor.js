"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActionExecutor_1 = __importDefault(require("./ActionExecutor"));
const objectMap_1 = __importDefault(require("./utils/objectMap"));
const printActions_1 = __importDefault(require("./utils/printActions"));
class TaskProcessor {
    constructor(printer) {
        this.printer = printer;
    }
    printActions(params, actions) {
        printActions_1.default(params, this.printer, actions);
    }
    solveTask(params, solver) {
        return solver.convertToActions(solver.getBestSolution(params));
    }
    verifyTask(params, actions) {
        const executor = new ActionExecutor_1.default(params);
        const result = executor.executeAll(actions);
        return actions.length === 0 || result.x === params.Z || result.y === params.Z;
    }
    compareSolvers(params, solvers) {
        return objectMap_1.default(solvers, (solver) => solver.getSolutionLength(solver.getBestSolution(params)));
    }
    testSolver(name, THRESHOLD, solver) {
        for (let params of this.iterator(THRESHOLD)) {
            this.testCase(name, params, solver);
        }
    }
    testCase(name, params, solver) {
        if (!this.verifyTask(params, this.solveTask(params, solver))) {
            console.log(`Solver "${name}" failed on params (${params.X} ${params.Y} ${params.Z})`);
            debugger;
        }
    }
    iterator(THRESHOLD) {
        return (function* () {
            const start = Date.now();
            let i = 0;
            for (let X = 1; X < THRESHOLD; X++) {
                for (let Y = X + 1; Y < THRESHOLD; Y++) {
                    for (let Z = 1; Z < Y; Z++) {
                        i++;
                        yield { X, Y, Z };
                    }
                }
            }
            const end = Date.now();
            return (end - start) / i;
        })();
    }
}
exports.default = TaskProcessor;
//# sourceMappingURL=TaskProcessor.js.map