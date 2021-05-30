export default abstract class AbstractPrinter {
    protected abstract write(text: string): void;
    writeLn(...args: any[]): void;
    abstract open(): void;
    abstract close(): void;
}
