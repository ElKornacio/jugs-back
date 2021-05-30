import InputParams from "./types/InputParams";
import JugAction from "./types/JugAction";
import JugsState from "./types/JugsState";
export declare type StateProcessor = (state: JugsState) => JugsState;
export default class ActionExecutor {
    private readonly params;
    constructor(params: InputParams);
    handlers: Record<JugAction, StateProcessor>;
    fX_X2Y(state: JugsState, n?: number): JugsState;
    eY_X2Y(state: JugsState, n?: number): JugsState;
    fY_Y2X(state: JugsState, n?: number): JugsState;
    eX_Y2X(state: JugsState, n?: number): JugsState;
    fX_X2Y_eY_X2Y(state: JugsState, n: number, a: number, b: 0 | 1): JugsState;
    fY_Y2X_eX_Y2X(state: JugsState, n: number, b: number): JugsState;
    execute(state: JugsState, action: JugAction): JugsState;
    executeAll(actions: JugAction[]): JugsState;
}
