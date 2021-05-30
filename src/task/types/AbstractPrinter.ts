export default abstract class AbstractPrinter {

    protected abstract write(text: string): void;

    writeLn(...args: any[]): void {
        return this.write(args.join(', ') + "\n");
    }

    abstract open(): void;
    abstract close(): void;

}