import fs from "fs";
import Table from 'easy-table';
import { read } from "./read";
import { generateFast } from "./fast";
import { generate, IAction } from "./generate";

const BufferedStream = require('buffered-stream');

interface IComplexAction {
    name: string,
    n: number,
    b: number,
    c: number,
    children?: IComplexAction[];
    x: number,
    y: number
}

export function writeCompact(log: (text: string) => void, logS: (...d: any[]) => void, X: number, Y: number, Z: number, solution: IAction[]) {

    logS(X, Y, Z);
    logS('j = ' + (Z % X) + ', k = ' + (Y % Z));
    const XoY = X - (Y % X);
    const YoX = Y - X;
    logS('XoY = ' + XoY + ', YoX = ' + YoX);
    // logS('XoY === 0 is ' + String(XoY === 0) + ', ' + 'YoX === 0 is ' + String(YoX === 0))
    logS('Z mod XoY = ' + (Z % XoY) + ', Z mod YoX = ' + (Z % YoX));

    let prev: IComplexAction | null = null;
    function writeComplexAction(action: IComplexAction, prefix: string = '', depth: number = 0, maxDepth: number = 100) {
        if (depth > maxDepth) {
            return;
        }
        let s = (prefix + action.name + '(n=' + action.c + ';a=' + action.n + ';b=' + action.b + ')').padEnd(40, ' ');
        s += action.x.toString().padEnd(6, ' ') + action.y.toString().padEnd(6, ' ');
        s += prev ? ((action.x - prev.x).toString().padEnd(6, ' ') + (action.y - prev.y).toString().padEnd(6, ' ')) : '';
        logS(s);
        prev = action;
        if (action.children) {
            for (let c of action.children) {
                writeComplexAction(c, prefix + '   ', depth + 1, maxDepth);
            }
        }
    }

    function writeActions(actions: IComplexAction[], maxDepth: number) {
        for (let a of actions) {
            writeComplexAction(a, '', 0, maxDepth);
        }
    }

    function execute(state: { x: number, y: number }, action: IAction): { x: number, y: number } {
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

    function countCollapse(actions: IComplexAction[]): IComplexAction[] {
        const result: IComplexAction[] = [];
        let current = null;
        let i = 0;
        while (i < actions.length) {
            if (!current) {
                current = actions[i];
            } else
                if (current.name === actions[i].name && current.n === actions[i].n && current.b === actions[i].b) {
                    current.c += 1;
                } else {
                    result.push(current);
                    current = actions[i];
                }
            i++;
        }
        if (current) {
            result.push(current);
        }
        return result;
    }

    function simpleCollapse(actions: IComplexAction[], rules: Record<string, string[]>): IComplexAction[] {

        const isNext = (set: string[], v: number) => {
            if (v + set.length > actions.length) {
                return false;
            }
            for (let j = 0; j < set.length; j++) {
                if (actions[v + j].name === set[j]) {
                    continue;
                } else {
                    return false;
                }
            }
            return true;
        }

        const result: IComplexAction[] = [];

        let i = 0;
        while (i < actions.length) {
            let found = false;
            for (let ruleName in rules) {
                const ruleSet = rules[ruleName];
                if (isNext(ruleSet, i)) {
                    result.push({
                        name: ruleName,
                        n: 1,
                        b: 0,
                        c: 0,
                        children: actions.slice(i, i + ruleSet.length),
                        x: actions[i + ruleSet.length - 1].x,
                        y: actions[i + ruleSet.length - 1].y,
                    });
                    i += ruleSet.length;
                    found = true;
                    break;
                }
            }
            if (found) {
                continue;
            }
            result.push(actions[i]);
            i++;
        }

        return result;
    }

    function complexCollapse(actions: IComplexAction[], rules: Record<string, [string, string]>): IComplexAction[] {
        const result: IComplexAction[] = [];

        let i = 0;
        while (i < actions.length) {
            let found = false;
            for (let ruleName in rules) {
                const ruleSet = rules[ruleName];
                let startA = i;
                let endA = i;
                while (endA < actions.length && actions[endA].name === ruleSet[0]) {
                    endA++;
                    i++;
                }
                let startB = i;
                let endB = i;
                if (endA - startA !== 0) {
                    while (endB < actions.length && actions[endB].name === ruleSet[1]) {
                        endB++;
                        i++;
                    }

                    const totalLen = (endA - startA) + (endB - startB);

                    result.push({
                        name: ruleName,
                        n: endA - startA,
                        b: endB - startB,
                        c: 1,
                        children: actions.slice(startA, endB),
                        x: actions[endB - 1].x,
                        y: actions[endB - 1].y,
                    });

                    i = endB;
                    found = true;
                    continue;
                }
            }
            if (found) {
                continue;
            }
            result.push(actions[i]);
            i++;
        }

        return result;
    }

    let state = { x: 0, y: 0 };
    let actions: IComplexAction[] = [];
    actions = solution.map(s => {
        state = execute(state, s);
        return {
            name: s,
            n: 1,
            b: 0,
            c: 0,
            ...state
        };
    });

    // writeActions(actions, 3);
    const firstRound = simpleCollapse(actions, {
        fY_Y2X: ['fY', 'Y2X'],
        eX_Y2X: ['eX', 'Y2X'],
        fX_X2Y: ['fX', 'X2Y'],
        eY_X2Y: ['eY', 'X2Y'],
    });
    // logS();
    // logS('First round: ' + firstRound.length);
    // logS();
    // writeActions(firstRound, 0);

    const secondRound = complexCollapse(firstRound, {
        'fY_Y2X_eX_Y2X': ['fY_Y2X', 'eX_Y2X'],
        'fX_X2Y_eY_X2Y': ['fX_X2Y', 'eY_X2Y'],
    });
    const _secondRound = secondRound; // countCollapse(secondRound);
    logS();
    logS('Second round: ' + _secondRound.length);
    if (!_secondRound.every(t => t.name === _secondRound[0].name)) {
        logS('Ololo');
    }
    if (_secondRound.some(t => t.name.length < 13)) {
        logS('Is in it');
    }
    logS();
    writeActions(_secondRound, 0);

}

(async () => {

    generateFast();
    // generate();
    return;

    let len = 0;
    let bufs: Buffer[] = [];

    // const stream = BufferedStream(10 * 1024 * 1024);
    // const logFile = fs.createWriteStream('log-3.txt', {
    //     flags: 'w',
    // });

    const log = (text: string) => {
        // console.log(text);
        // logFile.write(text + "\n");
        const newBuf = new Buffer(text + "\n", 'utf8');
        bufs.push(newBuf);
        len += newBuf.length;
        if (len > 50 * 1024 * 1024) {
            const fill = Buffer.concat(bufs);
            fs.appendFileSync('log-3.txt', fill);
            bufs = [];
            len = 0;
        }
        // stream.write(text + "\n");
    };
    const logS = (...d: any[]) => log(d.join(' '));

    function writeComplexAction(action: IComplexAction, prefix: string = '', depth: number = 0, maxDepth: number = 100) {
        if (depth > maxDepth) {
            return;
        }
        logS((prefix + action.name + '(n=' + action.c + ';a=' + action.n + ';b=' + action.b + ')').padEnd(40, ' '));
        if (action.children) {
            for (let c of action.children) {
                writeComplexAction(c, prefix + '   ', depth + 1, maxDepth);
            }
        }
    }

    function writeActions(actions: IComplexAction[], maxDepth: number) {
        for (let a of actions) {
            writeComplexAction(a, '', 0, maxDepth);
        }
    }

    function handle(X: number, Y: number, Z: number, solutions: IAction[][]) {
        let swap = true;
        if (X > Y) {
            swap = true;
            [X, Y] = [Y, X];
        }

        if (!solutions.length) {
            return
        }

        logS(X, Y, Z);
        logS('j = ' + (Z % X) + ', k = ' + (Y % Z));
        const XoY = X - (Y % X);
        const YoX = Y - X;
        logS('XoY = ' + XoY + ', YoX = ' + YoX);
        // logS('XoY === 0 is ' + String(XoY === 0) + ', ' + 'YoX === 0 is ' + String(YoX === 0))
        logS('Z mod XoY = ' + (Z % XoY) + ', Z mod YoX = ' + (Z % YoX));

        if (!solutions.length) {
            logS();
            logS('No solutions');
            logS();
            logS('---------------------------------------------------------------');
            logS();
            return;
        }

        logS();

        function execute(state: { x: number, y: number }, action: IAction): { x: number, y: number } {
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

        function countCollapse(actions: IComplexAction[]): IComplexAction[] {
            const result: IComplexAction[] = [];
            let current = null;
            let i = 0;
            while (i < actions.length) {
                if (!current) {
                    current = actions[i];
                } else
                if (current.name === actions[i].name && current.n === actions[i].n && current.b === actions[i].b) {
                    current.c += 1;
                } else {
                    result.push(current);
                    current = actions[i];
                }
                i++;
            }
            if (current) {
                result.push(current);
            }
            return result;
        }

        function simpleCollapse(actions: IComplexAction[], rules: Record<string, string[]>): IComplexAction[] {

            const isNext = (set: string[], v: number) => {
                if (v + set.length > actions.length) {
                    return false;
                }
                for (let j = 0; j < set.length; j++) {
                    if (actions[v + j].name === set[j]) {
                        continue;
                    } else {
                        return false;
                    }
                }
                return true;
            }

            const result: IComplexAction[] = [];

            let i = 0;
            while (i < actions.length) {
                let found = false;
                for (let ruleName in rules) {
                    const ruleSet = rules[ruleName];
                    if (isNext(ruleSet, i)) {
                        result.push({
                            name: ruleName,
                            n: 1,
                            b: 0,
                            c: 0,
                            children: actions.slice(i, i + ruleSet.length),
                            x: actions[i + ruleSet.length - 1].x,
                            y: actions[i + ruleSet.length - 1].y,
                        });
                        i += ruleSet.length;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    continue;
                }
                result.push(actions[i]);
                i++;
            }

            return result;
        }

        function complexCollapse(actions: IComplexAction[], rules: Record<string, [string, string]>): IComplexAction[] {
            const result: IComplexAction[] = [];

            let i = 0;
            while (i < actions.length) {
                let found = false;
                for (let ruleName in rules) {
                    const ruleSet = rules[ruleName];
                    let startA = i;
                    let endA = i;
                    while (endA < actions.length && actions[endA].name === ruleSet[0]) {
                        endA++;
                        i++;
                    }
                    let startB = i;
                    let endB = i;
                    if (endA - startA !== 0) {
                        while (endB < actions.length && actions[endB].name === ruleSet[1]) {
                            endB++;
                            i++;
                        }

                        const totalLen = (endA - startA) + (endB - startB);

                        result.push({
                            name: ruleName,
                            n: endA - startA,
                            b: endB - startB,
                            c: 1,
                            children: actions.slice(startA, endB),
                            x: actions[endB - 1].x,
                            y: actions[endB - 1].y,
                        });

                        i = endB;
                        found = true;
                        continue;
                    }
                }
                if (found) {
                    continue;
                }
                result.push(actions[i]);
                i++;
            }

            return result;
        }

        for (let solution of solutions) {
            logS('Total raw length: ', solution.length);

            let state = { x: 0, y: 0 };
            let actions: IComplexAction[] = [];
            actions = solution.map(s => {
                state = execute(state, s);
                return {
                    name: s,
                    n: 1,
                    b: 0,
                    c: 0,
                    ...state
                };
            });

            // writeActions(actions, 3);
            const firstRound = simpleCollapse(actions, {
                fY_Y2X: ['fY', 'Y2X'],
                eX_Y2X: ['eX', 'Y2X'],
                fX_X2Y: ['fX', 'X2Y'],
                eY_X2Y: ['eY', 'X2Y'],
            });
            // logS();
            // logS('First round: ' + firstRound.length);
            // logS();
            // writeActions(firstRound, 0);

            const secondRound = complexCollapse(firstRound, {
                'fY_Y2X_eX_Y2X': ['fY_Y2X', 'eX_Y2X'],
                'fX_X2Y_eY_X2Y': ['fX_X2Y', 'eY_X2Y'],
            });
            const _secondRound = countCollapse(secondRound);
            logS();
            logS('Second round: ' + _secondRound.length);
            if (!_secondRound.every(t => t.name === _secondRound[0].name)) {
                logS('Ololo');
            }
            if (_secondRound.some(t => t.name.length < 13)) {
                logS('Is in it');
            }
            logS();
            writeActions(_secondRound, 0);
        }

        logS();
        logS('---------------------------------------------------------------');
        logS();
    }

    // solveFast(17, 59, 55);

    // stream.pipe(logFile);

    const THRESHOLD = 200;
    for (let X = 1; X < THRESHOLD; X++) {
        const cacheX: Record<string, any> = read(X);
        console.log('X: ', X);
        for (let Y = 1; Y < THRESHOLD; Y++) {
            for (let Z = 1; Z < THRESHOLD; Z++) {
                handle(X, Y, Z, cacheX[Y + ':' + Z]);
            }
        }
    }
    // for (let X = 1; X < 100; X++) {
    //     const cacheX: Record<string, any> = read(X);
    //     console.log('X: ', X);
    //     for (let Y = X + 1; Y < 100; Y++) {
    //         for (let Z = 1; Z < Y; Z++) {
    //             if (Z === X) {
    //                 continue; // obvious solution
    //             }
    //             if (Z % X === 0) {
    //                 continue; // obvious solution
    //             }
    //             if (Y % X === 0) {
    //                 continue; // no solution
    //             }
    //             handle(X, Y, Z, cacheX[Y + ':' + Z]);
    //         }
    //     }
    // }

    // logFile.end('');
    // logFile.close();

    if (len > 0) {
        const fill = Buffer.concat(bufs);
        fs.appendFileSync('log-3.txt', fill);
    }

})().catch(err => {
    console.error(err);
});