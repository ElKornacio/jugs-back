import fs from 'fs';
import AbstractPrinter from "../types/AbstractPrinter";

export default class FilePrinter extends AbstractPrinter {

    private readonly filePath: string;
    private readonly highWatermark: number;
    private textBuffers: Buffer[] = [];
    private totalBytesLength: number = 0;

    constructor(filePath: string, highWatermark: number = 50 * 1024 * 1024) {
        super();
        this.filePath = filePath;
        this.highWatermark = highWatermark;
    }

    private flush() {
        const fill = Buffer.concat(this.textBuffers);
        fs.appendFileSync(this.filePath, fill);
        this.textBuffers = [];
        this.totalBytesLength = 0;
    }

    protected write(text: string) {
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