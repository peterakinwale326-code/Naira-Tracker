"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cors_1 = require("./cors");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.enableCors({
        origin: (0, cors_1.getCorsOrigin)(),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`Naira Inflation Tracker Backend running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map