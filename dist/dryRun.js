"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConsolePrinter_1 = __importDefault(require("jugs-task-package/dist/printers/ConsolePrinter"));
const FastMathBasedSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/FastMathBasedSolver"));
const SlowestRecursiveSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/SlowestRecursiveSolver"));
const SlowSimulationalSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/SlowSimulationalSolver"));
const UnhurriedSemiSimulationalSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/UnhurriedSemiSimulationalSolver"));
const TaskProcessor_1 = __importDefault(require("jugs-task-package/dist/TaskProcessor"));
(async () => {
    const printer = new ConsolePrinter_1.default();
    const taskProcessor = new TaskProcessor_1.default(printer);
    const slowestRecursiveSolver = new SlowestRecursiveSolver_1.default();
    const slowSimulationalSolver = new SlowSimulationalSolver_1.default();
    const unhurriedSemiSimulationalSolver = new UnhurriedSemiSimulationalSolver_1.default();
    const fastMathBasedSolver = new FastMathBasedSolver_1.default();
    function basicFunctionalityCheck(THRESHOLD = 10) {
        taskProcessor.testSolver('slowestRecursiveSolver', THRESHOLD, slowestRecursiveSolver);
        taskProcessor.testSolver('slowSimulationalSolver', THRESHOLD, slowSimulationalSolver);
        taskProcessor.testSolver('unhurriedSemiSimulationalSolver', THRESHOLD, unhurriedSemiSimulationalSolver);
        taskProcessor.testSolver('fastMathBasedSolver', THRESHOLD, fastMathBasedSolver);
    }
    // By "unstable" I mean that on large THRESHOLD slowestRecursiveSolver could crash due to the stack overflow error.
    // Other solvers are stack-free, so they are stable for any THRESHOLD (but slow solvers are slow, obviously).
    function unstableValidityCheck(THRESHOLD = 20) {
        const results = [];
        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(taskProcessor.compareSolvers(params, {
                slowestRecursiveSolver,
                slowSimulationalSolver,
                unhurriedSemiSimulationalSolver,
                fastMathBasedSolver,
            }));
        }
        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            slowestRecursiveSolver: 0,
            slowSimulationalSolver: 0,
            unhurriedSemiSimulationalSolver: 0,
            fastMathBasedSolver: 0,
        });
    }
    function stableValidityCheck(THRESHOLD = 20) {
        const results = [];
        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(taskProcessor.compareSolvers(params, {
                slowSimulationalSolver,
                unhurriedSemiSimulationalSolver,
                fastMathBasedSolver,
            }));
        }
        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            slowSimulationalSolver: 0,
            unhurriedSemiSimulationalSolver: 0,
            fastMathBasedSolver: 0,
        });
    }
    function fastBoysCheck(THRESHOLD = 20) {
        const results = [];
        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(taskProcessor.compareSolvers(params, {
                unhurriedSemiSimulationalSolver,
                fastMathBasedSolver,
            }));
        }
        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            unhurriedSemiSimulationalSolver: 0,
            fastMathBasedSolver: 0,
        });
    }
    function fastestMagicalSolverCheck(THRESHOLD = 20) {
        const results = [];
        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(taskProcessor.compareSolvers(params, {
                fastMathBasedSolver,
            }));
        }
        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            fastMathBasedSolver: 0,
        });
    }
    basicFunctionalityCheck();
    console.log('Basic tests passed');
    let start;
    start = Date.now();
    const finalResult1 = unstableValidityCheck();
    console.log('Unstable check: ', finalResult1, 'time: ', (Date.now() - start) + 'ms');
    start = Date.now();
    const finalResult2 = stableValidityCheck();
    console.log('Stable check: ', finalResult2, 'time: ', (Date.now() - start) + 'ms');
    start = Date.now();
    const finalResult3 = fastBoysCheck(50);
    console.log('Fast boys check: ', finalResult3, 'time: ', (Date.now() - start) + 'ms');
    start = Date.now();
    const finalResult4 = fastestMagicalSolverCheck(50);
    console.log('Fastest magical solver check: ', finalResult4, 'time: ', (Date.now() - start) + 'ms');
})();
//# sourceMappingURL=dryRun.js.map