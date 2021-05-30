import ConsolePrinter from "./task/printers/ConsolePrinter";
import FastMathBasedSolver from "./task/solvers/FastMathBasedSolver";
import SlowestRecursiveSolver from "./task/solvers/SlowestRecursiveSolver";
import SlowSimulationalSolver from "./task/solvers/SlowSimulationalSolver";
import UnhurriedSemiSimulationalSolver from "./task/solvers/UnhurriedSemiSimulationalSolver";
import TaskProcessor from "./task/TaskProcessor";

(async () => {

    const printer = new ConsolePrinter();
    const taskProcessor = new TaskProcessor(printer);

    const slowestRecursiveSolver = new SlowestRecursiveSolver();
    const slowSimulationalSolver = new SlowSimulationalSolver();
    const unhurriedSemiSimulationalSolver = new UnhurriedSemiSimulationalSolver();
    const fastMathBasedSolver = new FastMathBasedSolver();

    function basicFunctionalityCheck(THRESHOLD = 10) {
        taskProcessor.testSolver('slowestRecursiveSolver', THRESHOLD, slowestRecursiveSolver);
        taskProcessor.testSolver('slowSimulationalSolver', THRESHOLD, slowSimulationalSolver);
        taskProcessor.testSolver('unhurriedSemiSimulationalSolver', THRESHOLD, unhurriedSemiSimulationalSolver);
        taskProcessor.testSolver('fastMathBasedSolver', THRESHOLD, fastMathBasedSolver);
    }

    // By "unstable" I mean that on large THRESHOLD slowestRecursiveSolver could crash due to the stack overflow error.
    // Other solvers are stack-free, so they are stable for any THRESHOLD (but slow solvers are slow, obviously).
    function unstableValidityCheck(THRESHOLD = 20) {
        const results: Record<string, number>[] = [];

        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(
                taskProcessor.compareSolvers(params, {
                    slowestRecursiveSolver,
                    slowSimulationalSolver,
                    unhurriedSemiSimulationalSolver,
                    fastMathBasedSolver,
                })
            );
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
        })
    }

    function stableValidityCheck(THRESHOLD = 20) {
        const results: Record<string, number>[] = [];

        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(
                taskProcessor.compareSolvers(params, {
                    slowSimulationalSolver,
                    unhurriedSemiSimulationalSolver,
                    fastMathBasedSolver,
                })
            );
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
        })
    }

    function fastBoysCheck(THRESHOLD = 20) {
        const results: Record<string, number>[] = [];

        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(
                taskProcessor.compareSolvers(params, {
                    unhurriedSemiSimulationalSolver,
                    fastMathBasedSolver,
                })
            );
        }

        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            unhurriedSemiSimulationalSolver: 0,
            fastMathBasedSolver: 0,
        })
    }

    function fastestMagicalSolverCheck(THRESHOLD = 20) {
        const results: Record<string, number>[] = [];

        for (let params of taskProcessor.iterator(THRESHOLD)) {
            results.push(
                taskProcessor.compareSolvers(params, {
                    fastMathBasedSolver,
                })
            );
        }

        return results.reduce((p, c) => {
            for (let key in c) {
                p[key] += c[key];
            }
            return p;
        }, {
            fastMathBasedSolver: 0,
        })
    }

    basicFunctionalityCheck();
    console.log('Basic tests passed');

    let start: number;

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