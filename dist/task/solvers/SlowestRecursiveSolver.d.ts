import AbstractPrinter from "../types/AbstractPrinter";
import AbstractSolver from "../types/AbstractSolver";
import InputParams from "../types/InputParams";
import JugAction from "../types/JugAction";
declare type ActionsList = JugAction[];
export default class SlowestRecursiveSolver extends AbstractSolver<ActionsList> {
    getSolutions(params: InputParams): ActionsList[];
    convertToActions(solution: ActionsList): JugAction[];
    printSolution(printer: AbstractPrinter, solution: ActionsList): void;
    getSolutionLength(solution: ActionsList): number;
}
export {};
