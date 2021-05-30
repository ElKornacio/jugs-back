import AbstractPrinter from "../types/AbstractPrinter";
export default class FilePrinter extends AbstractPrinter {
    private readonly filePath;
    private readonly highWatermark;
    private textBuffers;
    private totalBytesLength;
    constructor(filePath: string, highWatermark?: number);
    private flush;
    protected write(text: string): void;
    open(): void;
    close(): void;
}
