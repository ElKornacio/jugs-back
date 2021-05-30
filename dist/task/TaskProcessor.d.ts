import AbstractPrinter from "./types/AbstractPrinter";
import AbstractSolver from "./types/AbstractSolver";
import InputParams from "./types/InputParams";
import JugAction from "./types/JugAction";
export default class TaskProcessor {
    private readonly printer;
    constructor(printer: AbstractPrinter);
    printActions(params: InputParams, actions: JugAction[]): void;
    solveTask<T>(params: InputParams, solver: AbstractSolver<T>): JugAction[];
    verifyTask(params: InputParams, actions: JugAction[]): boolean;
    compareSolvers<T extends {
        [key: string]: AbstractSolver<any>;
    }>(params: InputParams, solvers: T): Record<keyof T, number>;
    testSolver(name: string, THRESHOLD: number, solver: AbstractSolver<any>): void;
    testCase(name: string, params: InputParams, solver: AbstractSolver<any>): void;
    iterator(THRESHOLD: number): Generator<InputParams, number, void>;
}
