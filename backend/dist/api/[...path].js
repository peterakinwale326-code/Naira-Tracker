"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
let appPromise;
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    await app.init();
    return app;
}
async function handler(req, res) {
    appPromise ??= createApp();
    const app = await appPromise;
    const expressHandler = app.getHttpAdapter().getInstance();
    return expressHandler(req, res);
}
//# sourceMappingURL=%5B...path%5D.js.map