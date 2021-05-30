import ActionExecutor from "./ActionExecutor";
import AbstractPrinter from "./types/AbstractPrinter";
import AbstractSolver from "./types/AbstractSolver";
import InputParams from "./types/InputParams";
import JugAction from "./types/JugAction";
import objectMap from "./utils/objectMap";
import printActions from "./utils/printActions";

export default class TaskProcessor {

    private readonly printer: AbstractPrinter;

    constructor(printer: AbstractPrinter) {
        this.printer = printer;
    }

    printActions(params: InputParams, actions: JugAction[]) {
        printActions(params, this.printer, actions);
    }

    solveTask<T>(params: InputParams, solver: AbstractSolver<T>): JugAction[] {
        return solver.convertToActions(solver.getBestSolution(params));
    }

    verifyTask(params: InputParams, actions: JugAction[]) {
        const executor = new ActionExecutor(params);
        const result = executor.executeAll(actions);
        return actions.length === 0 || result.x === params.Z || result.y === params.Z;
    }

    compareSolvers<T extends { [key: string]: AbstractSolver<any> }>(params: InputParams, solvers: T): Record<keyof T, number> {
        return objectMap<AbstractSolver<any>, number>(solvers, (solver) => solver.getSolutionLength(solver.getBestSolution(params)));
    }

    testSolver(name: string, THRESHOLD: number, solver: AbstractSolver<any>) {
        for (let params of this.iterator(THRESHOLD)) {
            this.testCase(name, params, solver);
        }
    }

    testCase(name: string, params: InputParams, solver: AbstractSolver<any>) {
        if (!this.verifyTask(params, this.solveTask(params, solver))) {
            console.log(`Solver "${name}" failed on params (${params.X} ${params.Y} ${params.Z})`);
            debugger;
        }
    }

    iterator(THRESHOLD: number): Generator<InputParams, number, void> {
        return (function*() {
            const start = Date.now();
            let i = 0;
            for (let X = 1; X < THRESHOLD; X++) {
                for (let Y = X + 1; Y < THRESHOLD; Y++) {
                    for (let Z = 1; Z < Y; Z++) {
                        i++;
                        yield { X, Y, Z} as InputParams;
                    }
                }
            }
            const end = Date.now();
            return (end - start) / i;
        })();
    }

}