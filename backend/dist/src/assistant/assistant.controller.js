"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantController = void 0;
const common_1 = require("@nestjs/common");
const assistant_service_1 = require("./assistant.service");
let AssistantController = class AssistantController {
    constructor(assistant) {
        this.assistant = assistant;
    }
    async chat(body) {
        const message = typeof body?.message === 'string' ? body.message.trim() : '';
        if (!message || message.length > 4000) {
            throw new common_1.BadRequestException('Message is required and must be no longer than 4,000 characters.');
        }
        const history = Array.isArray(body.history) ? body.history.slice(-24) : [];
        return this.assistant.chat(message, history);
    }
};
exports.AssistantController = AssistantController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "chat", null);
exports.AssistantController = AssistantController = __decorate([
    (0, common_1.Controller)('api/v1/assistant'),
    __metadata("design:paramtypes", [assistant_service_1.AssistantService])
], AssistantController);
//# sourceMappingURL=assistant.controller.js.map