"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActionExecutor_1 = __importDefault(require("../ActionExecutor"));
function printActions(params, printer, actions) {
    const executor = params ? (new ActionExecutor_1.default(params)) : null;
    let state = { x: 0, y: 0 };
    printer.writeLn('Start');
    for (let action of actions) {
        let s = action.padEnd(20, ' ');
        if (executor) {
            state = executor.execute(state, action);
            s += state.x.toString().padEnd(10) + state.y.toString().padEnd(10);
        }
        printer.writeLn(s);
    }
    printer.writeLn('End: ', state.x, state.y);
}
exports.default = printActions;
//# sourceMappingURL=printActions.js.map