"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const AbstractPrinter_1 = __importDefault(require("../types/AbstractPrinter"));
class FilePrinter extends AbstractPrinter_1.default {
    constructor(filePath, highWatermark = 50 * 1024 * 1024) {
        super();
        this.textBuffers = [];
        this.totalBytesLength = 0;
        this.filePath = filePath;
        this.highWatermark = highWatermark;
    }
    flush() {
        const fill = Buffer.concat(this.textBuffers);
        fs_1.default.appendFileSync(this.filePath, fill);
        this.textBuffers = [];
        this.totalBytesLength = 0;
    }
    write(text) {
        const newBuf = Buffer.from(text + "\n", 'utf8');
        this.textBuffers.push(newBuf);
        this.totalBytesLength += newBuf.length;
        if (this.totalBytesLength > this.highWatermark) {
            this.flush();
        }
    }
    open() {
        //
    }
    close() {
        if (this.totalBytesLength > 0) {
            this.flush();
        }
    }
}
exports.default = FilePrinter;
//# sourceMappingURL=FilePrinter.js.map