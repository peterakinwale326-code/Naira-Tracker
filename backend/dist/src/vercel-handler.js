"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVercelRequest = handleVercelRequest;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const cors_1 = require("./cors");
const app_module_1 = require("./app.module");
let appPromise;
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (0, cors_1.getCorsOrigin)(),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    await app.init();
    return app;
}
async function handleVercelRequest(req, res) {
    appPromise ??= createApp();
    try {
        const app = await appPromise;
        const expressHandler = app.getHttpAdapter().getInstance();
        return expressHandler(req, res);
    }
    catch (error) {
        appPromise = undefined;
        throw error;
    }
}
//# sourceMappingURL=vercel-handler.js.map