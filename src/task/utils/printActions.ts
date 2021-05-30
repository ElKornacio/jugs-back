import ActionExecutor from "../ActionExecutor";
import AbstractPrinter from "../types/AbstractPrinter";
import InputParams from "../types/InputParams";
import JugAction from "../types/JugAction";

export default function printActions(params: InputParams | null, printer: AbstractPrinter, actions: JugAction[]) {
    const executor = params ? (new ActionExecutor(params)) : null;
    let state = { x: 0, y: 0 };
    printer.writeLn('Start');
    for (let action of actions) {
        let s = action.padEnd(20, ' ');
        if (executor) {
            state = executor.execute(state, action);
            s += state.x.toString().padEnd(10) + state.y.toString().padEnd(10)
        }
        printer.writeLn(s);
    }
    printer.writeLn('End: ', state.x, state.y);
}