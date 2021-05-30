import AbstractPrinter from "../types/AbstractPrinter";
import AbstractSolver from "../types/AbstractSolver";
import InputParams from "../types/InputParams";
import JugAction from "../types/JugAction";
import JugsState from "../types/JugsState";
import printActions from "../utils/printActions";

type ActionsList = JugAction[];

interface IStackEntry {
    state: JugsState,
    branch: number,
}

export default class SlowSimulationalSolver extends AbstractSolver<ActionsList> {

    getSolutions(params: InputParams): ActionsList[] {
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
            let stack: IStackEntry[] = [{ state: { x: 0, y: 0 }, branch: 0 }];
            let history: JugAction[] = [];
            let results: JugAction[][] = [];
            const wasInState: Record<string, true> = {};
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
                } else
                if (branch === 1) {
                    pos.branch++;
                    history.push('fY');
                    stack.push({ state: { x: state.x, y: Y }, branch: 0 });
                } else
                if (branch === 2) {
                    pos.branch++;
                    history.push('X2Y');
                    stack.push({ state: { x: state.x - willPourX, y: state.y + willPourX, }, branch: 0 });
                } else
                if (branch === 3) {
                    pos.branch++;
                    history.push('Y2X');
                    stack.push({ state: { x: state.x + willPourY, y: state.y - willPourY, }, branch: 0 });
                } else
                if (branch === 4) {
                    pos.branch++;
                    history.push('eX');
                    stack.push({ state: { x: 0, y: state.y, }, branch: 0 });
                } else
                if (branch === 5) {
                    pos.branch++;
                    history.push('eY');
                    stack.push({ state: { x: state.x, y: 0, }, branch: 0 });
                } else {
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
        } else {
            return temp;
        }
    }

    convertToActions(solution: ActionsList): JugAction[] {
        return solution;
    }

    printSolution(printer: AbstractPrinter, solution: ActionsList): void {
        printActions(null, printer, solution);
    }

    getSolutionLength(solution: ActionsList): number {
        return solution.length;
    }
}