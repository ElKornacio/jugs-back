import ActionExecutor from "../ActionExecutor";
import AbstractPrinter from "../types/AbstractPrinter";
import AbstractSolver from "../types/AbstractSolver";
import InputParams from "../types/InputParams";
import JugAction from "../types/JugAction";
import JugsState from "../types/JugsState";
import arraysEqual from "../utils/arraysEqual";
import generateTupleArray from "../utils/generateTupleArray";
import printActions from "../utils/printActions";

type ActionsList = JugAction[];

interface IStackEntry {
    state: JugsState,
    branch: number,
}

export default class UnhurriedSemiSimulationalSolver extends AbstractSolver<ActionsList> {

    getSolutions(params: InputParams): ActionsList[] {
        let { X, Y, Z } = params;
        const executor = new ActionExecutor(params);

        let swap = false;
        if (X > Y) {
            swap = true;
            [X, Y] = [Y, X];
        }

        const str_fX = swap ? 'fY' : 'fX';
        const str_fY = swap ? 'fX' : 'fY';
        const str_X2Y = swap ? 'Y2X' : 'X2Y';
        const str_Y2X = swap ? 'X2Y' : 'Y2X';
        const str_eX = swap ? 'eY' : 'eX';
        const str_eY = swap ? 'eX' : 'eY';

        function fixAnswers(a: JugAction[][]) {
            if (a.length === 0) {
                return [[]];
            }
            return a.map(t => t.map(g => {
                if (g === 'fX') {
                    return str_fX;
                } else
                if (g === 'fY') {
                    return str_fY;
                } else
                if (g === 'X2Y') {
                    return str_X2Y;
                } else
                if (g === 'Y2X') {
                    return str_Y2X;
                } else
                if (g === 'eX') {
                    return str_eX;
                } else
                if (g === 'eY') {
                    return str_eY;
                } else {
                    throw new Error('Unknown action');
                }
            }))
        }

        if (Z > Y) {
            return [[]];
        }
        if (Z === Y) {
            return fixAnswers([['fY']]);
        }
        if (Z === X) {
            return fixAnswers([['fX']]);
        }
        if (Z % X === 0) {
            const firstSol = (Z / X) * 2;
            const secondSol = 1 + ((Y - Z) / X) * 2 - 1;
            if ((Y - Z) % X === 0 && (secondSol < firstSol)) {
                return fixAnswers([['fY' as JugAction].concat(generateTupleArray(secondSol - 1, 'Y2X', 'eX'))]);
            } else {
                return fixAnswers([generateTupleArray(firstSol, 'fX', 'X2Y')]);
            }
        }
        if (Y % X === 0) {
            return [[]];
        }

        function act(startFromfX: boolean) {
            const opt = true;
            let stack: IStackEntry[] = [{ state: { x: 0, y: 0 }, branch: 0 }];
            let history: JugAction[][] = [];
            let results: JugAction[][] = [];
            const wasInState: Record<string, true> = {};
            while (stack.length) {
                const pos = stack[stack.length - 1];
                const { state, branch } = pos;
                if (state.x === Z || state.y === Z) {
                    results.push(history.slice().flat());
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

                if (branch === 0) {
                    pos.branch++;
                    if (startFromfX) {
                        history.push(['fX', 'X2Y']);
                        stack.push({ state: executor.fX_X2Y(state, 1), branch: 0 });
                    } else {
                        const historyBulk: JugAction[] = ['fY', 'Y2X'];
                        let newState = executor.fY_Y2X(state, 1);
                        // history.push(['fY', 'Y2X']);
                        // stack.push({ state: newState, branch: opt ? 1 : 0 });
                        let n = 0;
                        while (newState.x === X && newState.y != 0) {
                            if (newState.x === Z || newState.y === Z) {
                                break;
                            }
                            const oldState = newState;
                            newState = executor.eX_Y2X(newState, 1);
                            if (wasInState[newState.x + ':' + newState.y]) {
                                newState = oldState;
                                break;
                            }
                            historyBulk.push('eX', 'Y2X');
                            n++;
                            // stack.push({ state: newState, branch: 0 });
                        }
                        history.push(historyBulk);
                        stack.push({ state: newState, branch: 0 });
                    }
                } else
                    if (branch === 1) {
                        pos.branch++;
                        if (startFromfX) {
                            if (opt && history.length >= 1 && arraysEqual(history[history.length - 1], ['eY', 'X2Y'])) {
                                continue;
                            } else {
                                history.push(['eY', 'X2Y']);
                                stack.push({ state: executor.eY_X2Y(state, 1), branch: 0 });
                            }
                        } else {
                            history.push(['eX', 'Y2X']);
                            stack.push({ state: executor.eX_Y2X(state, 1), branch: 0 });
                        }
                    } else {
                        stack.pop();
                        history.pop();
                        delete wasInState[state.x + ':' + state.y];
                    }
            }

            return results;
        }

        const solutionX = act(true);
        const solutionY = act(false); 
        if (!solutionX.length) {
            return fixAnswers(solutionY);
        }
        if (!solutionY.length) {
            return fixAnswers(solutionX);
        }
        const aMin = Math.min(...solutionX.map(t => t.length));
        const bMin = Math.min(...solutionY.map(t => t.length));
        if (aMin < bMin) {
            return fixAnswers(solutionX);
        } else {
            return fixAnswers(solutionY);
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