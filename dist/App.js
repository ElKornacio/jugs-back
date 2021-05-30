"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FastMathBasedSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/FastMathBasedSolver"));
const SlowestRecursiveSolver_1 = __importDefault(require("jugs-task-package/dist/solvers/SlowestRecursiveSolver"));
const isKeyOf_1 = __importDefault(require("jugs-task-package/dist/utils/isKeyOf"));
class App {
    constructor(server) {
        this.server = server;
    }
    async init() {
        this.server.get('/', (req, res) => {
            res.end('All is fine');
        });
        this.server.get('/solve', (req, res) => {
            let { X: rX, Y: rY, Z: rZ, solver: rSolver } = req.query;
            const X = Number(rX);
            const Y = Number(rY);
            const Z = Number(rZ);
            const solverName = String(rSolver);
            const solversMap = {
                fast: FastMathBasedSolver_1.default,
                slowest: SlowestRecursiveSolver_1.default,
            };
            if (isNaN(X) || isNaN(Y) || isNaN(Z) || !isKeyOf_1.default(solversMap, solverName)) {
                return res.status(400).end('Request is invalid');
            }
            const solver = new solversMap[solverName]();
            const solution = solver.getBestSolution({ X, Y, Z });
            return res.end(JSON.stringify(solution));
        });
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map