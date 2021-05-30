import { IAction } from "./generate";

export default function execute(X: number, Y: number, state: { x: number, y: number }, action: IAction): { x: number, y: number } {
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

export function checkActions(X: number, Y: number, Z: number, actions: IAction[]): boolean {
    let state = { x: 0, y: 0 };
    for (let action of actions) {
        state = execute(X, Y, state, action);
    }
    return (state.x === Z || state.y === Z);
}