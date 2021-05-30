import Table from 'easy-table';
import fs from 'fs';
import { writeCompact } from './index-old';

export type IAction = 'eX' | 'eY' | 'fX' | 'fY' | 'X2Y' | 'Y2X';

interface IStackEntry {
    state: { x: number, y: number },
    n: number,
}

function arEq(a: any[], b: any[]) {
    return a.length === b.length && a.every((e, i) => e === b[i]);
}

function genTupleArray(len: number, even: IAction, odd: IAction) {
    return [...new Array<IAction>(len)].map((v, i) => i % 2 === 0 ? even : odd);
}

export function solveSemiFast(log: (text: string) => void, logS: (...d: any[]) => void, X: number, Y: number, Z: number): IAction[][] {
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

    function fixAnswers(a: IAction[][]) {
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
        return [];
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
            return fixAnswers([['fY' as IAction].concat(genTupleArray(secondSol - 1, 'Y2X', 'eX'))]);
        } else {
            return fixAnswers([genTupleArray(firstSol, 'fX', 'X2Y')]);
        }
    }
    if (Y % X === 0) {
        return [];
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

    function eX(state: { x: number, y: number }): { x: number, y: number } {
        return { x: 0, y: state.y };
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

    function eX_Y2X(state: { x: number, y: number }, n: number): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = Y2X(eX(state));
        }
        return state;
    }

    function fX_X2Y_eY_X2Y(state: { x: number, y: number }, n: number, a: number, b: 0 | 1): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = fX_X2Y(state, a);
            state = eY_X2Y(state, b);
        }
        return state;
    }

    function fY_Y2X_eX_Y2X(state: { x: number, y: number }, n: number, b: number): { x: number, y: number } {
        for (let i = 0; i < n; i++) {
            state = fY_Y2X(state, 1);
            state = eX_Y2X(state, b);
        }
        return state;
    }

    function ceilAndPart(a: number, b: number) {
        return {
            ceil: Math.floor(a / b),
            part: (a % b) === 0
        }
    }

    // function actForY() {
    //     let history: number[] = [];
    //     let state = { x: 0, y: 0 };
    //     const wasInState: Record<string, true> = {};
    //     while (true) {
    //         // history.push(['fY', 'Y2X']);
    //         state = fY_Y2X(state, 1);
    //         if (wasInState[state.x + ':' + state.y]) {
    //             return [];
    //         } else {
    //             wasInState[state.x + ':' + state.y] = true;
    //         }
    //         let b = 0;
    //         const { ceil, part } = ceilAndPart(state.y, X);
    //         b = ceil + ((ceil > 0 && part) ? 1 : 0);
    //         // while (state.x === X && state.y != 0) {
    //         //     if (state.x === Z || state.y === Z) {
    //         //         break;
    //         //     }
    //         //     state = eX_Y2X(state, 1);
    //         //     if (wasInState[state.x + ':' + state.y]) {
    //         //         return [];
    //         //     } else {
    //         //         wasInState[state.x + ':' + state.y] = true;
    //         //     }
    //         //     b++;
    //         // }
    //         history.push(b);

    //         if (state.x === Z || state.y === Z) {
    //             break;
    //         }
    //     }
    //     return [history.map(b => {
    //         const arr: IAction[] = ['fY', 'Y2X'];
    //         while (b !== 0) {
    //             arr.push('eX', 'Y2X');
    //             b--;
    //         }
    //         return arr;
    //     }).flat()];
    // }

    // function actForX() {
    //     let history: number[] = [];
    //     let state = { x: 0, y: 0 };
    //     const wasInState: Record<string, true> = {};
    //     let lastOrphan = false;
    //     while (true) {
    //         let a = 0;
    //         while (state.x === 0 && state.y != Y) {
    //             if (state.x === Z || state.y === Z) {
    //                 break;
    //             }
    //             state = fX_X2Y(state, 1);
    //             if (wasInState[state.x + ':' + state.y]) {
    //                 return [];
    //             } else {
    //                 wasInState[state.x + ':' + state.y] = true;
    //             }
    //             a++;
    //         }
    //         history.push(a);
    //         if (state.x === Z || state.y === Z) {
    //             lastOrphan = true;
    //             break;
    //         }

    //         state = eY_X2Y(state, 1);
    //         if (wasInState[state.x + ':' + state.y]) {
    //             return [];
    //         } else {
    //             wasInState[state.x + ':' + state.y] = true;
    //         }

    //         if (state.x === Z || state.y === Z) {
    //             break;
    //         }
    //     }
    //     return [history.map((a, idx) => {
    //         const arr: IAction[] = [];
    //         while (a !== 0) {
    //             arr.push('fX', 'X2Y');
    //             a--;
    //         }
    //         if (idx === history.length - 1 && lastOrphan) {

    //         } else {
    //             arr.push('eY', 'X2Y');
    //         }
    //         return arr;
    //     }).flat()];
    // }

    function actNew(startFromfX: boolean) {
        const opt = true;
        let stack: IStackEntry[] = [{ state: { x: 0, y: 0 }, n: 0 }];
        let history: IAction[][] = [];
        let results: IAction[][] = [];
        const wasInState: Record<string, true> = {};
        while (stack.length) {
            const pos = stack[stack.length - 1];
            const { state, n } = pos;
            if (state.x === Z || state.y === Z) {
                results.push(history.slice().flat());
                stack.pop();
                history.pop();
                continue;
            }
            if (n === 0 && wasInState[state.x + ':' + state.y]) {
                stack.pop();
                history.pop();
                continue;
            }
            wasInState[state.x + ':' + state.y] = true;

            if (n === 0) {
                pos.n++;
                if (startFromfX) {
                    history.push(['fX', 'X2Y']);
                    stack.push({ state: fX_X2Y(state, 1), n: 0 });
                } else {
                    const historyBulk: IAction[] = ['fY', 'Y2X'];
                    let newState = fY_Y2X(state, 1);
                    // history.push(['fY', 'Y2X']);
                    // stack.push({ state: newState, n: opt ? 1 : 0 });
                    let n = 0;
                    while (newState.x === X && newState.y != 0) {
                        if (newState.x === Z || newState.y === Z) {
                            break;
                        }
                        const oldState = newState;
                        newState = eX_Y2X(newState, 1);
                        if (wasInState[newState.x + ':' + newState.y]) {
                            newState = oldState;
                            break;
                        }
                        historyBulk.push('eX', 'Y2X');
                        n++;
                        // stack.push({ state: newState, n: 0 });
                    }
                    history.push(historyBulk);
                    stack.push({ state: newState, n: 0 });
                }
            } else
            if (n === 1) {
                pos.n++;
                if (startFromfX) {
                    if (opt && history.length >= 1 && arEq(history[history.length - 1], ['eY', 'X2Y'])) {
                        continue;
                    } else {
                        history.push(['eY', 'X2Y']);
                        stack.push({ state: eY_X2Y(state, 1), n: 0 });
                    }
                } else {
                    history.push(['eX', 'Y2X']);
                    stack.push({ state: eX_Y2X(state, 1), n: 0 });
                }
            } else {
                stack.pop();
                history.pop();
                delete wasInState[state.x + ':' + state.y];
            }
        }

        return results;
    }

    const a = actNew(true);
    const b = actNew(false); //actNew(false);
    if (!a.length) {
        return fixAnswers(b);
    }
    if (!b.length) {
        return fixAnswers(a);
    }
    const aMin = Math.min(...a.map(t => t.length));
    const bMin = Math.min(...b.map(t => t.length));
    if (aMin < bMin) {
        return fixAnswers(a);
    } else {
        return fixAnswers(b);
    }
}

export function solveSlow(log: (text: string) => void, logS: (...d: any[]) => void, X: number, Y: number, Z: number): IAction[][] {
    if (X === Y && X !== Z) {
        logS(X, Y, Z);
        logS('No solution');
        return [];
    }
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

    function fixAnswers(a: IAction[][]) {
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

    logS(X, Y, Z);
    logS('j = ' + (Z % X) + ', k = ' + (Y % Z));
    const XoY = X - (Y % X);
    const YoX = Y - X;
    logS('XoY = ' + XoY + ', YoX = ' + YoX);
    // logS('XoY === 0 is ' + String(XoY === 0) + ', ' + 'YoX === 0 is ' + String(YoX === 0))
    logS('Z mod XoY = ' + (Z % XoY) + ', Z mod YoX = ' + (Z % YoX));

    const diff = Y - X;

    function act2() {
        let stack: IStackEntry[] = [{ state: { x: 0, y: 0 }, n: 0 }];
        let history: IAction[] = [];
        let results: IAction[][] = [];
        const wasInState: Record<string, true> = {};
        while (stack.length) {
            const pos = stack[stack.length - 1];
            const { state, n } = pos;
            if (state.x === Z || state.y === Z) {
                results.push(history.slice());
                stack.pop();
                history.pop();
                continue;
            }
            if (n === 0 && wasInState[state.x + ':' + state.y]) {
                stack.pop();
                history.pop();
                continue;
            }
            wasInState[state.x + ':' + state.y] = true;

            const sum = state.x + state.y;
            const willPourX = sum > Y ? (Y - state.y) : state.x;
            const willPourY = sum > X ? (X - state.x) : state.y;

            if (n === 0) {
                pos.n++;
                history.push('fX');
                stack.push({ state: { x: X, y: state.y }, n: 0 });
            } else
            if (n === 1) {
                pos.n++;
                history.push('fY');
                stack.push({ state: { x: state.x, y: Y }, n: 0 });
            } else
            if (n === 2) {
                pos.n++;
                history.push('X2Y');
                stack.push({ state: { x: state.x - willPourX, y: state.y + willPourX, }, n: 0 });
            } else
            if (n === 3) {
                pos.n++;
                history.push('Y2X');
                stack.push({ state: { x: state.x + willPourY, y: state.y - willPourY, }, n: 0 });
            } else
            if (n === 4) {
                pos.n++;
                history.push('eX');
                stack.push({ state: { x: 0, y: state.y, }, n: 0 });
            } else
            if (n === 5) {
                pos.n++;
                history.push('eY');
                stack.push({ state: { x: state.x, y: 0, }, n: 0 });
            } else {
                stack.pop();
                history.pop();
                delete wasInState[state.x + ':' + state.y];
            }
        }

        return results;
    }

    function act(state: { x: number, y: number }, wasInStateRaw: Record<string, true>, history: IAction[]): IAction[][] {
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

    function replay(history: IAction[]) {
        let state = { x: 0, y: 0 };
        logS('Start:\t0,\t0');
        logS();
        const result: { entity: string, x: number, y: number }[] = [];
        for (let entity of history) {
            const sum = state.x + state.y;
            const willPourX = sum > Y ? (Y - state.y) : state.x;
            const willPourY = sum > X ? (X - state.x) : state.y;
            if (entity === 'fX') {
                state.x = X;
            } else
            if (entity === 'fY') {
                state.y = Y;
            } else
            if (entity === 'X2Y') {
                state = {
                    x: state.x - willPourX,
                    y: state.y + willPourX,
                };
            } else
            if (entity === 'Y2X') {
                state = {
                    x: state.x + willPourY,
                    y: state.y - willPourY,
                };
            } else
            if (entity === 'eX') {
                state.x = 0;
            } else
            if (entity === 'eY') {
                state.y = 0;
            }
            if (swap) {
                result.push({ entity, x: state.x, y: state.y });
            } else {
                result.push({ entity, x: state.y, y: state.x });
            }
            // logS(`${entity}:\t${state.x},\t${state.y}`);
        }
        const t = new Table();
        // const final: { entity: string, n: number, x: number, y: number }[] = [];
        // let current: { entity: string, n: number, x: number, y: number } | null = null;
        // for (let r of result) {
        //     if (!current) {
        //         current = { n: 1, ...r };
        //     } else {
        //         const rName = r.entity.split('(')[0];
        //         const cName = current.entity.split('(')[0];
        //         if (rName === cName) {
        //             current.n++;
        //         } else {
        //             final.push(current);
        //             current = { n: 1, ...r };
        //         }
        //     }
        // }
        // if (current) {
        //     final.push(current);
        // }

        for (let r of result) {
            t.cell('Op', r.entity);
            t.cell('x', r.x);
            t.cell('y', r.y);
            t.newRow();
        }
        logS(t.toString());
        logS();
        if (swap) {
            logS(`End:\t${state.y},\t${state.x}`);
        } else {
            logS(`End:\t${state.x},\t${state.y}`);
        }

        logS('In total: ', history.length + ' / ' + result.length);
    }

    const resultingHistories = act2(); // act({ x: 0, y: 0 }, {}, []);
    // const resultingHistories2 = act({ x: 0, y: 0 }, {}, []);
    // if (resultingHistories.length !== resultingHistories2.length) {
    //     console.log('AAAAAAAA: ', X, Y, Z, resultingHistories.length, resultingHistories2.length);
    // }
    if (resultingHistories.length === 0) {
        logS('No solution');

        logS();
        logS('---------------------------------------------------------------');
        logS();

        return [];
    } else {
        let bestLength = Math.min(...resultingHistories.map(r => r.length));
        const bestResults = resultingHistories.filter(r => r.length === bestLength);

        // for (let best of bestResults) {
        //     logS();
        //     replay(best);
        // }

        // logS();
        // logS('---------------------------------------------------------------');
        // logS();

        return fixAnswers(bestResults);
    }
}

function execute(X: number, Y: number, state: { x: number, y: number }, action: IAction): { x: number, y: number } {
    let finalState = Object.assign({}, state);
    const sum = state.x + state.y;
    const willPourX = sum > Y ? (Y - state.y) : state.x;
    const willPourY = sum > X ? (X - state.x) : state.y;
    if (action === 'fX') {
        finalState.x = X;
    } else
        if (action === 'fY') {
            finalState.y = Y;
        } else
            if (action === 'X2Y') {
                finalState = {
                    x: finalState.x - willPourX,
                    y: finalState.y + willPourX,
                };
            } else
                if (action === 'Y2X') {
                    finalState = {
                        x: finalState.x + willPourY,
                        y: finalState.y - willPourY,
                    };
                } else
                    if (action === 'eX') {
                        finalState.x = 0;
                    } else
                        if (action === 'eY') {
                            finalState.y = 0;
                        }
    return finalState;
}

function checkActions(X: number, Y: number, Z: number, actions: IAction[]): boolean {
    let state = { x: 0, y: 0 };
    for (let action of actions) {
        state = execute(X, Y, state, action);
    }
    return (state.x === Z || state.y === Z);
}

export function generate() {

    const logFile = fs.createWriteStream('log.txt');

    const log = (text: string) => {
        // console.log(text);
        logFile.write(text + "\n");
    };
    const logS = (...d: any[]) => log(d.join(' '));

    // console.log('slow: ', solveSlow(log, logS, 3, 4, 2));
    // console.log('fast: ', solveSemiFast(log, logS, 3, 4, 2));
    // return;

    // const cX = 131;
    // const cY = 197;
    // const cZ = 164;
    
    // const cX = 3;
    // const cY = 1000000;
    // const cZ = 1;

    const cX = 3;
    const cY = 5;
    const cZ = 4;

    // const s = Date.now();
    // for (let l = 0; l < 1; l++) {
    //     console.log('res: ', solveSemiFast(log, logS, cX, cY, cZ));//1 * 1000 * 1000, 3, 2);
    // }
    // const e = Date.now();
    // console.log('took avg: ' + ((e - s) / 1) + 'ms');
    // console.log();
    // debugger;
    // return;

    
    // const results = solveSemiFast(log, logS, cX, cY, cZ);
    // if (!results.length) {
    //     console.log('No solution');
    // }
    // const min = Math.min(...results.map(r => r.length));
    // const result = results.filter(t => t.length === min)[0];
    // // console.log('result: ', result);
    // writeCompact(console.log, console.log, cX, cY, cZ, result);

    // return;

    const start = Date.now();
    const THRESHOLD = 30;
    let i = 0;
    for (let X = 1; X < THRESHOLD; X++) {
        const cacheX: Record<string, any> = {};
        console.log('X: ', X);
        for (let Y = 1; Y < THRESHOLD; Y++) {
            for (let Z = 1; Z < THRESHOLD; Z++) {
                i++;
                const fastAnswers = solveSemiFast(log, logS, X, Y, Z);
                if (!fastAnswers.every(answer => checkActions(X, Y, Z, answer))) {
                    debugger;
                }

                const slowAnswers = solveSlow(log, logS, X, Y, Z);
                if (!slowAnswers.every(answer => checkActions(X, Y, Z, answer))) {
                    debugger;
                }

                if (fastAnswers.length === 0 && slowAnswers.length !== 0) {
                    debugger;
                }
                if (fastAnswers.length !== 0 && slowAnswers.length === 0) {
                    debugger;
                }
                if (fastAnswers.length !== 0 && slowAnswers.length !== 0) {
                    const aMin = Math.min(...fastAnswers.map(t => t.length));
                    const bMin = Math.min(...slowAnswers.map(t => t.length));
                    if (aMin !== bMin) {
                        debugger;
                    }
                }
                cacheX[Y + ':' + Z] = fastAnswers;
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