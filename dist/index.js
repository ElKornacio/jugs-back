"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const App_1 = __importDefault(require("./App"));
(async () => {
    const server = express_1.default();
    server.use(body_parser_1.default.json());
    server.use(cors_1.default({ origin: '*' }));
    const app = new App_1.default(server);
    await app.init();
    server.listen(8185, () => {
        console.log('Backend is ready');
    });
})();
//# sourceMappingURL=index.js.map