import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import App from './App';

(async () => {

    const server = express();

    server.use(bodyParser.json());
    server.use(cors({ origin: 'http://localhost:3000' }));

    const app = new App(server);
    await app.init();

    server.listen(8185, () => {
        console.log('Backend is ready');
    });

})();