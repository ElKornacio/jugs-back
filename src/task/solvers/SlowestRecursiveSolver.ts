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

export default class SlowestRecursiveSolver extends AbstractSolver<ActionsList> {

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

        function act(state: JugsState, wasInStateRaw: Record<string, true>, history: JugAction[]): ActionsList[] {
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