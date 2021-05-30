"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractPrinter_1 = __importDefault(require("../types/AbstractPrinter"));
class ConsolePrinter extends AbstractPrinter_1.default {
    write(text) {
        console.log(text);
    }
    writeLn(...args) {
        console.log(...args);
    }
    open() {
        //
    }
    close() {
        //
    }
}
exports.default = ConsolePrinter;
//# sourceMappingURL=ConsolePrinter.js.map