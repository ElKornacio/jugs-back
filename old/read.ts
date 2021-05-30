import fs from 'fs';
import { IAction } from './generate';

export function read(X: number): IAction[][] {
    return JSON.parse(fs.readFileSync('back/cache-3/' + X + '.txt', 'utf8'));
}