import fs from 'fs';
import { writeCompact } from './index-old';
import execute, { checkActions } from './execute';
import { IAction, solveSlow } from './generate';

interface ICompactAction {
    mode: 'fX_X2Y_eY_X2Y' | 'fY_Y2X_eX_Y2X';
    state: number[];
    lastOrphan: boolean;
}

interface ISimpleSolution {
    type: 'simple';
    swap: boolean;
    actions: { chord: IAction[], n: number }[];
}

interface INoSolution {
    type: 'no';
}

interface ICompactSolution {
    type: 'compact';
    swap: boolean;
    action: ICompactAction;
}

function getSolutionLength(solution: ISolution) {
    if (solution.type === 'no') {
        return 0;
    } else
    if (solution.type === 'simple') {
        return solution.actions.map(a => a.chord.length * a.n).reduce((p, c) => p + c, 0);
    } else
    if (solution.type === 'compact') {
        if (solution.action.mode === 'fX_X2Y_eY_X2Y') {
            return solution.action.state.map(s => 2 + 2 * s).reduce((p, c) => p + c, 0) - (solution.action.lastOrphan ? 2 : 0)
        } else
        if (solution.action.mode === 'fY_Y2X_eX_Y2X') {
            return solution.action.state.map(s => 2 + 2 * s).reduce((p, c) => p + c, 0);
        }
    }
}

type ISolution = ISimpleSolution | INoSolution | ICompactSolution;

export function solveFast(X: number, Y: number, Z: number): ISolution {
    let swap = false;
    if (X > Y) {
        swap = true;
        [X, Y] = [Y, X];
    }

    if (Z > Y) {
        return { type: 'no' };
    }
    if (Z === Y) {
        return { type: 'simple', swap, actions: [{ chord: ['fY'], n: 1 }] };
    }
    if (Z === X) {
        return { type: 'simple', swap, actions: [{ chord: ['fX'], n: 1 }] };
    }
    
    const firstSol = (Z % X === 0) ? ((Z / X) * 2) : false;
    const secondSol = ((Y - Z) % X === 0) ? (1 + ((Y - Z) / X) * 2 - 1) : false;
    let desc: 0 | 1 | 2 = 0;
    if (firstSol && secondSol) {
        if (firstSol < secondSol) {
            desc = 1;
        } else {
            desc = 2;
        }
    } else
    if (firstSol) {
        desc = 1
    } else
    if (secondSol) {
        desc = 2;
    }
    if (desc === 1 && firstSol) {
        return {
            type: 'simple',
            swap,
            actions: [
                {
                    chord: ['fX', 'X2Y'],
                    n: (firstSol % 2 === 0) ? (firstSol / 2) : (firstSol - 1) / 2
                },
                {
                    chord: ['fX'],
                    n: (firstSol % 2)
                }
            ]
        }
        // return fixAnswers([genTupleArray(firstSol, 'fX', 'X2Y')]);
    } else
    if (desc === 2 && secondSol) {
        return {
            type: 'simple',
            swap,
            actions: [
                {
                    chord: ['fY'],
                    n: 1
                },
                {
                    chord: ['Y2X', 'eX'],
                    n: (secondSol % 2 === 0) ? (secondSol / 2 - 1) : (secondSol - 1) / 2
                },
                {
                    chord: ['Y2X'],
                    n: (secondSol % 2 === 0) ? 1 : 0
                }
            ]
        }
        //return fixAnswers([['fY' as IAction].concat(genTupleArray(secondSol - 1, 'Y2X', 'eX'))]);
    }
    
    if (Y % X === 0) {
        return { type: 'no' };
    }

    function fX(state: { x: number, y: number }): { x: number, y: number } {
        return { x: X, y: state.y };
    }

    function fY(state: { x: number, y: number }): { x: number, y: number } {
        return { x: state.x, y: Y };
    }

    function X2Y(state: { x: number, y: number }): { x: number, y: number } {
        const sum = state.x + state.y;
        const willPourX = sum > Y ? (Y - state.y) : state.x;
        return { x: state.x - willPourX, y: state.y + willPourX, };
    }

    function Y2X(state: { x: number, y: number }): { x: number, y: number } {
        const sum = state.x + state.y;
        const willPourY = sum > X ? (X - state.x) : state.y;
        return { x: state.x + willPourY, y: state.y - willPourY, };
    }

    function eY(state: { x: number, y: number }): { x: number, y: number } {
        return { x: state.x, y: 0 };
    }

    function fX_X2Y(state: { x: number, y: number }, n: number): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = X2Y(fX(state));
        }
        return state;
    }

    function eY_X2Y(state: { x: number, y: number }, n: number): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = X2Y(eY(state));
        }
        return state;
    }

    function fY_Y2X(state: { x: number, y: number }, n: number): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = Y2X(fY(state));
        }
        return state;
    }

    function ceilAndPart(a: number, b: number) {
        return {
            ceil: Math.floor(a / b),
            part: (a % b) !== 0
        }
    }

    function actForY(): ISolution {
        // fY_Y2X_eX_Y2X
        let history: number[] = [];
        let state = { x: 0, y: 0 };
        const wasInState: Record<string, true> = {};
        while (true) {
            state = fY_Y2X(state, 1);
            if (wasInState[state.x + ':' + state.y]) {
                return { type: 'no' };
            } else {
                wasInState[state.x + ':' + state.y] = true;
            }
            if (state.x === Z || state.y === Z) {
                history.push(0);
                break;
            }
            let b = 0;
            if ((state.y - Z) % X === 0) {
                b = (state.y - Z) / X;
                state.x = X;
                state.y = Z;
            } else {
                const { ceil, part } = ceilAndPart(state.y, X);
                b = ceil + (part ? 1 : 0);
                if (b > 0) {
                    state.x = state.y % X;
                    state.y = 0;
                }
            }
            history.push(b);

            if (state.x === Z || state.y === Z) {
                break;
            }
        }
        return {
            type: 'compact',
            swap,
            action: {
                mode: 'fY_Y2X_eX_Y2X',
                state: history,
                lastOrphan: false,
            }
        }
    }

    function actForX(): ISolution {
        // fX_X2Y_eY_X2Y
        let history: number[] = [];
        let state = { x: 0, y: 0 };
        const wasInState: Record<string, true> = {};
        let lastOrphan = false;
        while (true) {
            if (wasInState[state.x + ':' + state.y]) {
                return { type: 'no' };
            } else {
                wasInState[state.x + ':' + state.y] = true;
            }

            let a = 0;
            if ((Z - state.y) % X === 0) {
                a = (Z - state.y) / X;
                state.x = 0;
                state.y = Z;
            } else {
                const { ceil, part } = ceilAndPart(Y - state.y, X);
                a = ceil + (part ? 1 : 0);
                if (a > 0) {
                    state.x = X - ((Y - state.y) % X);
                    state.y = Y;
                }
            }
            
            history.push(a);
            if (state.x === Z || state.y === Z) {
                lastOrphan = true;
                break;
            }

            // while (state.x === 0 && state.y != Y) {
            //     if (state.x === Z || state.y === Z) {
            //         break;
            //     }
            //     state = fX_X2Y(state, 1);
            //     if (wasInState[state.x + ':' + state.y]) {
            //         return { type: 'no' };
            //     } else {
            //         wasInState[state.x + ':' + state.y] = true;
            //     }
            //     a++;
            // }

            state = eY_X2Y(state, 1);

            if (state.x === Z || state.y === Z) {
                break;
            }
        }
        return {
            type: 'compact',
            swap,
            action: {
                mode: 'fX_X2Y_eY_X2Y',
                state: history,
                lastOrphan,
            }
        }
    }

    // const startX = Date.now();
    const a = actForX();
    // const startY = Date.now();
    const b = actForY();
    // console.log(`X: ${startY - startX}ms, Y: ${Date.now() - startY}ms`);
    const aLen = getSolutionLength(a);
    const bLen = getSolutionLength(b);
    if (!aLen) {
        return b;
    }
    if (!bLen) {
        return a;
    }

    if (aLen < bLen) {
        return a;
    } else {
        return b;
    }
}

function printSolution(log: (text: string) => void, logS: (...d: any[]) => void, solution: ISolution) {
    if (solution.type === 'no') {
        logS('No solution')
    } else
    if (solution.type === 'simple') {
        logS('Simple solution (' + getSolutionLength(solution) + '):');
        logS();
        for (let action of solution.actions) {
            if (action.n) {
                logS(action.chord.join('_') + `(n=${action.n})`);
            }
        }
    } else
    if (solution.type === 'compact') {
        logS('Compact solution (' + getSolutionLength(solution) + '):');
        logS();
        let i = 0;
        for (let action of solution.action.state) {
            if (solution.action.mode === 'fX_X2Y_eY_X2Y') {
                logS('fX_X2Y_eY_X2Y(a=' + action + ';b=' + ((i === solution.action.state.length - 1 && solution.action.lastOrphan) ? 0 : 1) + ')')
            } else {
                logS('fY_Y2X_eX_Y2X(a=1;b=' + action + ')');
            }
            i++;
        }
    }
}

function expandSolution(solution: ISolution): IAction[] {
    const result: IAction[] = [];

    const swap = (solution.type !== 'no') ? solution.swap : false;

    const str_fX = swap ? 'fY' : 'fX';
    const str_fY = swap ? 'fX' : 'fY';
    const str_X2Y = swap ? 'Y2X' : 'X2Y';
    const str_Y2X = swap ? 'X2Y' : 'Y2X';
    const str_eX = swap ? 'eY' : 'eX';
    const str_eY = swap ? 'eX' : 'eY';

    const m = (t: IAction) => {
        if (t === 'fX') {
            return str_fX;
        } else
        if (t === 'fY') {
            return str_fY;
        } else
        if (t === 'eX') {
            return str_eX;
        } else
        if (t === 'eY') {
            return str_eY;
        } else
        if (t === 'X2Y') {
            return str_X2Y;
        } else
        if (t === 'Y2X') {
            return str_Y2X;
        } else {
            throw new Error();
        }
    }

    if (solution.type === 'no') {
        return [];
    } else
    if (solution.type === 'simple') {
        for (let action of solution.actions) {
            for (let i = 0; i < action.n; i++) {
                result.push(...action.chord);
            }
        }
    } else
    if (solution.type === 'compact') {
        let i = 0;
        for (let action of solution.action.state) {
            if (solution.action.mode === 'fX_X2Y_eY_X2Y') {
                for (let j = 0; j < action; j++) {
                    result.push('fX', 'X2Y');
                }
                if (i === solution.action.state.length - 1 && solution.action.lastOrphan) {
                    //
                } else {
                    result.push('eY', 'X2Y');
                }
            } else {
                result.push('fY', 'Y2X');
                for (let j = 0; j < action; j++) {
                    result.push('eX', 'Y2X');
                }
            }
            i++;
        }
    }
    return result.map(r => m(r));
}

export function generateFast() {

    const logFile = fs.createWriteStream('log.txt');

    const log = (text: string) => {
        // console.log(text);
        logFile.write(text + "\n");
    };
    const logS = (...d: any[]) => log(d.join(' '));


    // const cX = 3;
    // const cY = 4;
    // const cZ = 2;

    const cX = 997;
    const cY = 10000000;
    const cZ = 1;

    const THRES = 1000;

    const s = Date.now();
    for (let l = 0; l < THRES; l++) {
        // console.log('canonical: ', solveSlow(log, logS, cX, cY, cZ));
        const a = solveFast(cX, cY, cZ);
        // console.log('check result: ', checkActions(cX, cY, cZ, expandSolution(a)));
    }
    const e = Date.now();
    console.log('took avg: ' + ((e - s) / THRES) + 'ms');
    console.log();
    return;

    const start = Date.now();
    const THRESHOLD = 300;
    let i = 1;
    for (let X = 1; X < THRESHOLD; X++) {
        const cacheX: Record<string, any> = {};
        console.log('X: ', X);
        console.log('Avg: ' + (Date.now() - start) / i);
        for (let Y = X + 1; Y < THRESHOLD; Y++) {
            for (let Z = 1; Z < Y; Z++) {
                i++;
                const fastSolution = solveFast(X, Y, Z);
                // const fastActions = expandSolution(fastSolution);
                // const fastAnswers = fastActions.length ? [fastActions] : [];
                // // if (!fastAnswers.every(answer => checkActions(X, Y, Z, answer))) {
                // //     debugger;
                // // }

                // const slowAnswers = solveSlow(log, logS, X, Y, Z);
                // // if (!slowAnswers.every(answer => checkActions(X, Y, Z, answer))) {
                // //     debugger;
                // // }

                // if (fastAnswers.length === 0 && slowAnswers.length !== 0) {
                //     debugger;
                // }
                // if (fastAnswers.length !== 0 && slowAnswers.length === 0) {
                //     debugger;
                // }
                // if (fastAnswers.length !== 0 && slowAnswers.length !== 0) {
                //     const aMin = Math.min(...fastAnswers.map(t => t.length));
                //     const bMin = Math.min(...slowAnswers.map(t => t.length));
                //     if (aMin !== bMin) {
                //         debugger;
                //     }
                // }
                // cacheX[Y + ':' + Z] = fastAnswers;
            }
        }
        // write(X, cacheX);
    }
    const end = Date.now();
    console.log('Took ' + (end - start) + 'ms, ' + i + ', avg: ' + (end - start) / i);

    logFile.end('');
    logFile.close();
}

export function write(X: number, values: Record<string, any>) {
    fs.writeFileSync('back/cache-3/' + X + '.txt', JSON.stringify(values), 'utf8');
}