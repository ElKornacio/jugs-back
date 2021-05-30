"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractPrinter {
    writeLn(...args) {
        return this.write(args.join(', ') + "\n");
    }
}
exports.default = AbstractPrinter;
//# sourceMappingURL=AbstractPrinter.js.map