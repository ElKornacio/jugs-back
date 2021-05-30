export default function objectMap<T, R>(obj: any, func: (v: T) => R): any {
    return Object.keys(obj).reduce((p, c) => {
        p[c] = func(obj[c]);
        return p;
    }, {} as any);
}