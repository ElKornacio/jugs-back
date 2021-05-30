export default function ceilAndPart(a: number, b: number) {
    return {
        ceil: Math.floor(a / b),
        part: (a % b) !== 0
    }
};