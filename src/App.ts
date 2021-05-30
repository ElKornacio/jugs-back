import express from 'express';
import FastMathBasedSolver from './task/solvers/FastMathBasedSolver';
import SlowestRecursiveSolver from './task/solvers/SlowestRecursiveSolver';
import AbstractSolver from './task/types/AbstractSolver';
import isKeyOf from './task/utils/isKeyOf';

export default class App {

    private readonly server: express.Application;

    constructor(server: express.Application) {
        this.server = server;
    }

    async init() {
        this.server.get('/', (req, res) => {
            res.end('All is fine');
        })

        this.server.get('/solve', (req, res) => {
            let { X: rX, Y: rY, Z: rZ, solver: rSolver } = req.query;
            const X = Number(rX);
            const Y = Number(rY);
            const Z = Number(rZ);
            const solverName = String(rSolver);

            const solversMap = {
                fast: FastMathBasedSolver,
                slowest: SlowestRecursiveSolver,
            };

            if (isNaN(X) || isNaN(Y) || isNaN(Z) || !isKeyOf(solversMap, solverName)) {
                return res.status(400).end('Request is invalid');
            }

            const solver = new solversMap[solverName]();

            const solution = solver.getBestSolution({ X, Y, Z });

            return res.end(JSON.stringify(solution));
        })
    }

}