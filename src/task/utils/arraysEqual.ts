export default function arraysEqual(a: any[], b: any[]) {
    return a.length === b.length && a.every((e, i) => e === b[i]);
}