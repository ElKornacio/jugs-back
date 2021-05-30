"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ActionExecutor {
    constructor(params) {
        this.handlers = {
            fX: (s) => ({ x: this.params.X, y: s.y }),
            fY: (s) => ({ x: s.x, y: this.params.Y }),
            eX: (s) => ({ x: 0, y: s.y }),
            eY: (s) => ({ x: s.x, y: 0 }),
            X2Y: (state) => {
                const sum = state.x + state.y;
                const willPourX = sum > this.params.Y ? (this.params.Y - state.y) : state.x;
                return { x: state.x - willPourX, y: state.y + willPourX };
            },
            Y2X: (state) => {
                const sum = state.x + state.y;
                const willPourY = sum > this.params.X ? (this.params.X - state.x) : state.y;
                return { x: state.x + willPourY, y: state.y - willPourY };
            },
        };
        this.params = params;
    }
    fX_X2Y(state, n = 1) {
        for (let i = 0; i < n; i++) {
            state = this.handlers.X2Y(this.handlers.fX(state));
        }
        return state;
    }
    eY_X2Y(state, n = 1) {
        for (let i = 0; i < n; i++) {
            state = this.handlers.X2Y(this.handlers.eY(state));
        }
        return state;
    }
    fY_Y2X(state, n = 1) {
        for (let i = 0; i < n; i++) {
            state = this.handlers.Y2X(this.handlers.fY(state));
        }
        return state;
    }
    eX_Y2X(state, n = 1) {
        for (let i = 0; i < n; i++) {
            state = this.handlers.Y2X(this.handlers.eX(state));
        }
        return state;
    }
    fX_X2Y_eY_X2Y(state, n, a, b) {
        for (let i = 0; i < n; i++) {
            state = this.fX_X2Y(state, a);
            state = this.eY_X2Y(state, b);
        }
        return state;
    }
    fY_Y2X_eX_Y2X(state, n, b) {
        for (let i = 0; i < n; i++) {
            state = this.fY_Y2X(state, 1);
            state = this.eX_Y2X(state, b);
        }
        return state;
    }
    execute(state, action) {
        return this.handlers[action](state);
    }
    executeAll(actions) {
        let state = { x: 0, y: 0 };
        for (let action of actions) {
            state = this.execute(state, action);
        }
        return state;
    }
}
exports.default = ActionExecutor;
//# sourceMappingURL=ActionExecutor.js.map