import AbstractPrinter from "../types/AbstractPrinter";
export default class ConsolePrinter extends AbstractPrinter {
    protected write(text: string): void;
    writeLn(...args: any[]): void;
    open(): void;
    close(): void;
}
