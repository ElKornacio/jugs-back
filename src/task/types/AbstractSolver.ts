import AbstractPrinter from "./AbstractPrinter";
import InputParams from "./InputParams";
import JugAction from "./JugAction";

export default abstract class AbstractSolver<T> {

    getBestSolution(params: InputParams): T {
        const all = this.getSolutions(params);
        const min = Math.min(...all.map(a => this.getSolutionLength(a)));
        return all.find(a => this.getSolutionLength(a) === min)!;
    }

    abstract getSolutions(params: InputParams): T[];
    
    abstract convertToActions(solution: T): JugAction[];
    abstract printSolution(printer: AbstractPrinter, solution: T): void;
    abstract getSolutionLength(solution: T): number;

}