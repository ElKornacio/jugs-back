import express from 'express';
export default class App {
    private readonly server;
    constructor(server: express.Application);
    init(): Promise<void>;
}
