import JugAction from "../types/JugAction";

export default function generateTupleArray(len: number, even: JugAction, odd: JugAction) {
    return [...new Array<JugAction>(len)].map((v, i) => i % 2 === 0 ? even : odd);
}