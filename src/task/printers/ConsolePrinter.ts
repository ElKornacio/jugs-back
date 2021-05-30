import AbstractPrinter from "../types/AbstractPrinter";

export default class ConsolePrinter extends AbstractPrinter {

    protected write(text: string) {
        console.log(text);
    }

    writeLn(...args: any[]) {
        console.log(...args);
    }

    open() {
        //
    }

    close() {
        //
    }

}