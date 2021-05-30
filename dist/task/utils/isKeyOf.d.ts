export default function isKeyOf<T extends {}>(obj: T, key: any): key is keyof T;
